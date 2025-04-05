# app/infra/database/repositories/ihs2_repository.py
from app.infra.database.models_ihs2 import IHS2Assessment
from app import db
from typing import Optional, List, Dict, Any
import datetime


class IHS2Repository:
    """Repositório para operações com avaliações IHS-2"""

    @staticmethod
    def create(patient_id: int, answers: List[int], factor_scores: Dict[str, float],
               total_score: float, created_by: int = None) -> IHS2Assessment:
        """
        Cria uma nova avaliação IHS-2

        Args:
            patient_id: ID do paciente
            answers: Lista com 38 respostas (0-4)
            factor_scores: Dicionário com pontuações de cada fator
            total_score: Pontuação total
            created_by: ID do usuário que criou a avaliação

        Returns:
            Nova avaliação IHS-2
        """
        if len(answers) != 38:
            raise ValueError("Deve fornecer exatamente 38 respostas para o IHS-2")

        # Criação da avaliação
        assessment = IHS2Assessment(
            patient_id=patient_id,
            f1_score=factor_scores.get('F1', 0),
            f2_score=factor_scores.get('F2', 0),
            f3_score=factor_scores.get('F3', 0),
            f4_score=factor_scores.get('F4', 0),
            f5_score=factor_scores.get('F5', 0),
            total_score=total_score,
            q1=answers[0], q2=answers[1], q3=answers[2], q4=answers[3], q5=answers[4],
            q6=answers[5], q7=answers[6], q8=answers[7], q9=answers[8], q10=answers[9],
            q11=answers[10], q12=answers[11], q13=answers[12], q14=answers[13], q15=answers[14],
            q16=answers[15], q17=answers[16], q18=answers[17], q19=answers[18], q20=answers[19],
            q21=answers[20], q22=answers[21], q23=answers[22], q24=answers[23], q25=answers[24],
            q26=answers[25], q27=answers[26], q28=answers[27], q29=answers[28], q30=answers[29],
            q31=answers[30], q32=answers[31], q33=answers[32], q34=answers[33], q35=answers[34],
            q36=answers[35], q37=answers[36], q38=answers[37],
            created_by=created_by
        )

        db.session.add(assessment)
        db.session.commit()
        return assessment

    @staticmethod
    def get_by_id(assessment_id: int) -> Optional[IHS2Assessment]:
        """Busca uma avaliação pelo ID"""
        return IHS2Assessment.query.get(assessment_id)

    @staticmethod
    def get_by_patient(patient_id: int) -> List[IHS2Assessment]:
        """Busca todas as avaliações de um paciente"""
        return IHS2Assessment.query.filter_by(patient_id=patient_id).order_by(
            IHS2Assessment.date.desc()).all()

    @staticmethod
    def get_recent(days: int = 30, created_by: int = None) -> List[IHS2Assessment]:
        """Busca avaliações recentes"""
        date_limit = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        query = IHS2Assessment.query.filter(IHS2Assessment.date >= date_limit)

        if created_by:
            query = query.filter_by(created_by=created_by)

        return query.order_by(IHS2Assessment.date.desc()).all()

    @staticmethod
    def update(assessment: IHS2Assessment) -> IHS2Assessment:
        """Atualiza uma avaliação"""
        db.session.commit()
        return assessment

    @staticmethod
    def delete(assessment: IHS2Assessment) -> bool:
        """Remove uma avaliação"""
        db.session.delete(assessment)
        db.session.commit()
        return True