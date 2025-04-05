# app/core/services/ihs2_service.py
from app.infra.database.repositories.ihs2_repository import IHS2Repository
from app.infra.database.repositories.patient_repository import PatientRepository
from typing import Dict, List, Optional, Tuple, Any


class IHS2Service:
    """Serviço para operações relacionadas ao IHS-2"""

    def __init__(self, ihs2_repository: IHS2Repository, patient_repository: PatientRepository):
        self.ihs2_repository = ihs2_repository
        self.patient_repository = patient_repository

    def create_assessment(self, patient_id: int, answers: List[int],
                          factor_scores: Dict[str, float], total_score: float,
                          user_id: int = None) -> Tuple[Dict, int]:
        """
        Cria uma nova avaliação IHS-2

        Args:
            patient_id: ID do paciente
            answers: Lista com 38 respostas (0-4)
            factor_scores: Dicionário com pontuações de cada fator
            total_score: Pontuação total
            user_id: ID do usuário que criou a avaliação

        Returns:
            Tuple com resposta e código HTTP
        """
        # Verifica se o paciente existe
        patient = self.patient_repository.get_by_id(patient_id)
        if not patient:
            return {'message': 'Paciente não encontrado'}, 404

        # Verifica se as respostas são válidas
        if len(answers) != 38 or not all(0 <= a <= 4 for a in answers):
            return {'message': 'Respostas inválidas. Deve fornecer 38 valores entre 0 e 4'}, 400

        try:
            # Cria a avaliação
            assessment = self.ihs2_repository.create(
                patient_id=patient_id,
                answers=answers,
                factor_scores=factor_scores,
                total_score=total_score,
                created_by=user_id
            )

            return {
                'message': 'Avaliação IHS-2 criada com sucesso',
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
        assessments = self.ihs2_repository.get_by_patient(patient_id)

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
        assessment = self.ihs2_repository.get_by_id(assessment_id)
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
        assessment = self.ihs2_repository.get_by_id(assessment_id)
        if not assessment:
            return {'message': 'Avaliação não encontrada'}, 404

        # Remove a avaliação
        self.ihs2_repository.delete(assessment)

        return {'message': 'Avaliação removida com sucesso'}, 200