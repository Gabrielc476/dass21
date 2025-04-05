# app/api/ihs2_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.infra.database.repositories.ihs2_repository import IHS2Repository
from app.infra.database.repositories.patient_repository import PatientRepository
from app.core.services.ihs2_service import IHS2Service

# Criação do blueprint
ihs2_bp = Blueprint('ihs2', __name__)

# Inicialização dos repositórios e serviços
ihs2_repository = IHS2Repository()
patient_repository = PatientRepository()
ihs2_service = IHS2Service(ihs2_repository, patient_repository)


@ihs2_bp.route('/assessment', methods=['POST'])
@jwt_required()
def create_assessment():
    """Endpoint para criar uma nova avaliação IHS-2"""
    data = request.get_json()
    user_id = get_jwt_identity()

    # Obtém os dados
    patient_id = data.get('patient_id')
    answers = data.get('answers', [])
    factor_scores = data.get('factor_scores', {})
    total_score = data.get('total_score', 0)

    # Valida o ID do paciente
    if not patient_id:
        return jsonify({'message': 'ID do paciente é obrigatório'}), 400

    # Cria a avaliação
    response, status_code = ihs2_service.create_assessment(
        patient_id, answers, factor_scores, total_score, user_id
    )
    return jsonify(response), status_code


@ihs2_bp.route('/assessment/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment(assessment_id):
    """Endpoint para obter uma avaliação pelo ID"""
    response, status_code = ihs2_service.get_assessment(assessment_id)
    return jsonify(response), status_code


@ihs2_bp.route('/assessment/<int:assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(assessment_id):
    """Endpoint para remover uma avaliação"""
    response, status_code = ihs2_service.delete_assessment(assessment_id)
    return jsonify(response), status_code


@ihs2_bp.route('/patient/<int:patient_id>/assessments', methods=['GET'])
@jwt_required()
def get_patient_assessments(patient_id):
    """Endpoint para obter todas as avaliações de um paciente"""
    response, status_code = ihs2_service.get_patient_assessments(patient_id)
    return jsonify(response), status_code