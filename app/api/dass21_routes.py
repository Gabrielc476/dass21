from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.infra.database.repositories.dass21_repository import DASS21Repository
from app.infra.database.repositories.patient_repository import PatientRepository
from app.core.services.dass21_service import DASS21Service
from app.core.services.ocr_service import OCRService
from app.utils.validators import Validators

# Criação do blueprint
dass21_bp = Blueprint('dass21', __name__)

# Inicialização dos repositórios e serviços
dass21_repository = DASS21Repository()
patient_repository = PatientRepository()
dass21_service = DASS21Service(dass21_repository, patient_repository)


@dass21_bp.route('/assessment', methods=['POST'])
@jwt_required()
def create_assessment():
    """Endpoint para criar uma nova avaliação"""
    data = request.get_json()
    user_id = get_jwt_identity()

    # Obtém os dados
    patient_id = data.get('patient_id')
    answers = data.get('answers', [])

    # Valida o ID do paciente
    if not patient_id:
        return jsonify({'message': 'ID do paciente é obrigatório'}), 400

    # Valida as respostas
    valid_answers, answers_error = Validators.validate_dass21_answers(answers)
    if not valid_answers:
        return jsonify({'message': answers_error}), 400

    # Cria a avaliação
    response, status_code = dass21_service.create_assessment(patient_id, answers, user_id)
    return jsonify(response), status_code


@dass21_bp.route('/assessment/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment(assessment_id):
    """Endpoint para obter uma avaliação pelo ID"""
    response, status_code = dass21_service.get_assessment(assessment_id)
    return jsonify(response), status_code


@dass21_bp.route('/assessment/<int:assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(assessment_id):
    """Endpoint para remover uma avaliação"""
    response, status_code = dass21_service.delete_assessment(assessment_id)
    return jsonify(response), status_code


@dass21_bp.route('/patient/<int:patient_id>/assessments', methods=['GET'])
@jwt_required()
def get_patient_assessments(patient_id):
    """Endpoint para obter todas as avaliações de um paciente"""
    response, status_code = dass21_service.get_patient_assessments(patient_id)
    return jsonify(response), status_code


@dass21_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_questionnaire():
    """Endpoint para upload e processamento OCR de questionários"""
    user_id = get_jwt_identity()

    # Verifica se há arquivo
    if 'file' not in request.files:
        return jsonify({'message': 'Nenhum arquivo enviado'}), 400

    file = request.files['file']

    # Verifica se o arquivo está vazio
    if file.filename == '':
        return jsonify({'message': 'Arquivo vazio'}), 400

    # Obtém o ID do paciente
    patient_id = request.form.get('patient_id')
    if not patient_id:
        return jsonify({'message': 'ID do paciente é obrigatório'}), 400

    try:
        patient_id = int(patient_id)
    except:
        return jsonify({'message': 'ID do paciente inválido'}), 400

    # Inicializa o serviço OCR
    ocr_service = OCRService(
        dass21_repository=dass21_repository,
        patient_repository=patient_repository,
        upload_folder=current_app.config['UPLOAD_FOLDER']
    )

    # Processa o questionário
    response, status_code = ocr_service.process_questionnaire_image(file, patient_id, user_id)
    return jsonify(response), status_code