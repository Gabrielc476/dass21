from app.infra.database.repositories.dass21_repository import DASS21Repository
from app.infra.database.repositories.patient_repository import PatientRepository
from typing import Dict, List, Optional, Tuple, Any
import os


class DASS21Service:
    """Serviço para operações relacionadas ao DASS-21"""

    def __init__(self, dass21_repository: DASS21Repository, patient_repository: PatientRepository):
        self.dass21_repository = dass21_repository
        self.patient_repository = patient_repository

    def create_assessment(self, patient_id: int, answers: List[int],
                          user_id: int = None) -> Tuple[Dict, int]:
        """
        Cria uma nova avaliação DASS-21

        Args:
            patient_id: ID do paciente
            answers: Lista com 21 respostas (0-3)
            user_id: ID do usuário que criou a avaliação

        Returns:
            Tuple com resposta e código HTTP
        """
        # Verifica se o paciente existe
        patient = self.patient_repository.get_by_id(patient_id)
        if not patient:
            return {'message': 'Paciente não encontrado'}, 404

        # Verifica se as respostas são válidas
        if len(answers) != 21 or not all(0 <= a <= 3 for a in answers):
            return {'message': 'Respostas inválidas. Deve fornecer 21 valores entre 0 e 3'}, 400

        try:
            # Cria a avaliação
            assessment = self.dass21_repository.create(
                patient_id=patient_id,
                answers=answers,
                created_by=user_id
            )

            return {
                'message': 'Avaliação criada com sucesso',
                'assessment': assessment.to_dict()
            }, 201

        except Exception as e:
            return {'message': f'Erro ao criar avaliação: {str(e)}'}, 500

    def get_patient_assessments(self, patient_id: int) -> Tuple[Dict, int]:
        """
        Obtém todas as avaliações de um paciente

        Args:
            patient_id: ID do paciente

        Returns:
            Tuple com resposta e código HTTP
        """
        # Verifica se o paciente existe
        patient = self.patient_repository.get_by_id(patient_id)
        if not patient:
            return {'message': 'Paciente não encontrado'}, 404

        # Busca as avaliações
        assessments = self.dass21_repository.get_by_patient(patient_id)

        return {
            'patient': patient.to_dict(),
            'assessments': [a.to_dict() for a in assessments]
        }, 200

    def get_assessment(self, assessment_id: int) -> Tuple[Dict, int]:
        """
        Obtém uma avaliação pelo ID

        Args:
            assessment_id: ID da avaliação

        Returns:
            Tuple com resposta e código HTTP
        """
        assessment = self.dass21_repository.get_by_id(assessment_id)
        if not assessment:
            return {'message': 'Avaliação não encontrada'}, 404

        return {'assessment': assessment.to_dict()}, 200

    def delete_assessment(self, assessment_id: int) -> Tuple[Dict, int]:
        """
        Remove uma avaliação

        Args:
            assessment_id: ID da avaliação

        Returns:
            Tuple com resposta e código HTTP
        """
        assessment = self.dass21_repository.get_by_id(assessment_id)
        if not assessment:
            return {'message': 'Avaliação não encontrada'}, 404

        # Remove a imagem associada, se houver
        if assessment.image_path and os.path.exists(assessment.image_path):
            os.remove(assessment.image_path)

        # Remove a avaliação
        self.dass21_repository.delete(assessment)

        return {'message': 'Avaliação removida com sucesso'}, 200