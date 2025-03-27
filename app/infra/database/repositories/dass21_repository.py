from app.infra.database.models import DASS21Assessment
from app import db
from typing import Optional, List, Dict, Any
import datetime


class DASS21Repository:
    """Repositório para operações com avaliações DASS-21"""

    @staticmethod
    def create(patient_id: int, answers: List[int], created_by: int = None,
               image_path: str = None, ocr_processed: bool = False) -> DASS21Assessment:
        """
        Cria uma nova avaliação DASS-21

        Args:
            patient_id: ID do paciente
            answers: Lista com 21 respostas (0-3)
            created_by: ID do usuário que criou a avaliação
            image_path: Caminho da imagem (se houver)
            ocr_processed: Se foi processado via OCR

        Returns:
            Nova avaliação DASS-21
        """
        if len(answers) != 21:
            raise ValueError("Deve fornecer exatamente 21 respostas")

        # Calcula as pontuações conforme as regras do DASS-21
        # Índices das questões para cada subescala (ajustados para base 0)
        depression_questions = [2, 4, 9, 12, 15, 16, 20]
        anxiety_questions = [1, 3, 6, 7, 8, 14, 18]
        stress_questions = [0, 5, 10, 11, 13, 17, 19]

        # Cálculo das pontuações
        depression_score = sum(answers[i] for i in depression_questions) * 2
        anxiety_score = sum(answers[i] for i in anxiety_questions) * 2
        stress_score = sum(answers[i] for i in stress_questions) * 2

        # Criação da avaliação
        assessment = DASS21Assessment(
            patient_id=patient_id,
            depression_score=depression_score,
            anxiety_score=anxiety_score,
            stress_score=stress_score,
            q1=answers[0], q2=answers[1], q3=answers[2], q4=answers[3], q5=answers[4],
            q6=answers[5], q7=answers[6], q8=answers[7], q9=answers[8], q10=answers[9],
            q11=answers[10], q12=answers[11], q13=answers[12], q14=answers[13], q15=answers[14],
            q16=answers[15], q17=answers[16], q18=answers[17], q19=answers[18], q20=answers[19],
            q21=answers[20],
            created_by=created_by,
            image_path=image_path,
            ocr_processed=ocr_processed
        )

        db.session.add(assessment)
        db.session.commit()
        return assessment

    @staticmethod
    def get_by_id(assessment_id: int) -> Optional[DASS21Assessment]:
        """Busca uma avaliação pelo ID"""
        return DASS21Assessment.query.get(assessment_id)

    @staticmethod
    def get_by_patient(patient_id: int) -> List[DASS21Assessment]:
        """Busca todas as avaliações de um paciente"""
        return DASS21Assessment.query.filter_by(patient_id=patient_id).order_by(
            DASS21Assessment.date.desc()).all()

    @staticmethod
    def get_recent(days: int = 30, created_by: int = None) -> List[DASS21Assessment]:
        """Busca avaliações recentes"""
        date_limit = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        query = DASS21Assessment.query.filter(DASS21Assessment.date >= date_limit)

        if created_by:
            query = query.filter_by(created_by=created_by)

        return query.order_by(DASS21Assessment.date.desc()).all()

    @staticmethod
    def update(assessment: DASS21Assessment) -> DASS21Assessment:
        """Atualiza uma avaliação"""
        db.session.commit()
        return assessment

    @staticmethod
    def delete(assessment: DASS21Assessment) -> bool:
        """Remove uma avaliação"""
        db.session.delete(assessment)
        db.session.commit()
        return True