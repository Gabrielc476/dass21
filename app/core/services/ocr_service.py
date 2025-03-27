from app.infra.database.repositories.dass21_repository import DASS21Repository
from app.infra.database.repositories.patient_repository import PatientRepository
from app.core.services.dass21_service import DASS21Service
from typing import Dict, List, Optional, Tuple, Any
import os
import pytesseract
from PIL import Image
import cv2
import numpy as np
import re
import uuid
from werkzeug.utils import secure_filename


class OCRService:
    """Serviço para processamento OCR de formulários DASS-21"""

    def __init__(self, dass21_repository: DASS21Repository,
                 patient_repository: PatientRepository,
                 upload_folder: str):
        self.dass21_repository = dass21_repository
        self.patient_repository = patient_repository
        self.upload_folder = upload_folder

    def _allowed_file(self, filename: str) -> bool:
        """Verifica se o arquivo tem uma extensão permitida"""
        ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def save_uploaded_file(self, file) -> str:
        """
        Salva o arquivo enviado

        Args:
            file: Arquivo enviado

        Returns:
            Caminho do arquivo salvo
        """
        if not file or not self._allowed_file(file.filename):
            raise ValueError("Arquivo inválido ou não permitido")

        # Gera um nome único para o arquivo
        unique_filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        filepath = os.path.join(self.upload_folder, unique_filename)

        # Salva o arquivo
        file.save(filepath)
        return filepath

    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Pré-processa a imagem para melhorar o reconhecimento OCR

        Args:
            image_path: Caminho da imagem

        Returns:
            Imagem pré-processada como array NumPy
        """
        # Lê a imagem
        img = cv2.imread(image_path)

        # Converte para escala de cinza
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Aplica o threshold adaptativo para melhorar o contraste
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                       cv2.THRESH_BINARY, 11, 2)

        # Aplica operações morfológicas para reduzir ruído
        kernel = np.ones((1, 1), np.uint8)
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

        return opening

    def extract_answers_from_image(self, image_path: str) -> List[int]:
        """
        Extrai as respostas do formulário a partir da imagem

        Args:
            image_path: Caminho da imagem

        Returns:
            Lista com as 21 respostas (0-3)
        """
        # Pré-processa a imagem
        preprocessed = self.preprocess_image(image_path)

        # Extrai o texto com OCR
        text = pytesseract.image_to_string(preprocessed)

        # Processa o texto para extrair as respostas
        # Este é um exemplo simplificado - em um caso real, seria necessário
        # um algoritmo mais robusto para identificar as marcações

        answers = []

        # Procura padrões como "Q1: 2", "1. 3", etc.
        patterns = [
            r'(?:Q|q)(\d+)[\s:]*(\d)',  # Padrão "Q1: 2"
            r'(\d+)[\.\s]+(\d)',  # Padrão "1. 3"
            r'(\d+)[\s\-]+(\d)'  # Padrão "1 - 2"
        ]

        found_answers = {}

        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                q_num = int(match.group(1))
                if 1 <= q_num <= 21:
                    answer = int(match.group(2))
                    if 0 <= answer <= 3:
                        found_answers[q_num] = answer

        # Preenche a lista de respostas
        for i in range(1, 22):
            answers.append(found_answers.get(i, 0))  # Padrão 0 se não encontrado

        return answers

    def process_questionnaire_image(self, file, patient_id: int,
                                    user_id: int = None) -> Tuple[Dict, int]:
        """
        Processa a imagem de um questionário DASS-21

        Args:
            file: Arquivo da imagem
            patient_id: ID do paciente
            user_id: ID do usuário que enviou a imagem

        Returns:
            Tuple com resposta e código HTTP
        """
        try:
            # Verifica se o paciente existe
            patient = self.patient_repository.get_by_id(patient_id)
            if not patient:
                return {'message': 'Paciente não encontrado'}, 404

            # Salva o arquivo
            filepath = self.save_uploaded_file(file)

            # Extrai as respostas da imagem
            answers = self.extract_answers_from_image(filepath)

            # Cria a avaliação
            assessment = self.dass21_repository.create(
                patient_id=patient_id,
                answers=answers,
                created_by=user_id,
                image_path=filepath,
                ocr_processed=True
            )

            return {
                'message': 'Questionário processado com sucesso',
                'assessment': assessment.to_dict()
            }, 201

        except ValueError as e:
            return {'message': str(e)}, 400

        except Exception as e:
            return {'message': f'Erro ao processar questionário: {str(e)}'}, 500