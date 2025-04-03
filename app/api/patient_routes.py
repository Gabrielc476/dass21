# app/api/patient_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.infra.database.repositories.patient_repository import PatientRepository

# Criação do blueprint
patient_bp = Blueprint('patient', __name__)

# Inicialização dos repositórios
patient_repository = PatientRepository()


@patient_bp.route('', methods=['POST'])
@jwt_required()
def create_patient():
    """Endpoint para criar um novo paciente"""
    data = request.get_json()
    user_id = get_jwt_identity()

    # Obtém os dados
    name = data.get('name', '')
    age = data.get('age')
    gender = data.get('gender', '')
    gender_other = data.get('gender_other', '')
    ethnicity = data.get('ethnicity', '')
    ethnicity_other = data.get('ethnicity_other', '')
    marital_status = data.get('marital_status', '')
    city_state = data.get('city_state', '')
    income = data.get('income')
    income_range = data.get('income_range', '')
    education_institution = data.get('education_institution', '')
    course = data.get('course', '')
    period = data.get('period')
    profession = data.get('profession', '')

    # Valida o nome
    if not name:
        return jsonify({'message': 'Nome do paciente é obrigatório'}), 400

    # Valida a idade, se fornecida
    if age is not None:
        try:
            age = int(age)
            if age < 0 or age > 120:
                return jsonify({'message': 'Idade inválida'}), 400
        except:
            return jsonify({'message': 'Idade deve ser um número inteiro'}), 400

    # Valida a renda, se fornecida
    if income is not None:
        try:
            income = float(income)
            if income < 0:
                return jsonify({'message': 'Renda inválida'}), 400
        except:
            return jsonify({'message': 'Renda deve ser um número'}), 400

    # Valida o período, se fornecido
    if period is not None:
        try:
            period = int(period)
            if period < 1:
                return jsonify({'message': 'Período inválido'}), 400
        except:
            return jsonify({'message': 'Período deve ser um número inteiro'}), 400

    # Cria o paciente
    patient = patient_repository.create(
        name, age, gender, gender_other, ethnicity, ethnicity_other,
        marital_status, city_state, income, income_range,
        education_institution, course, period, profession, user_id
    )

    return jsonify({
        'message': 'Paciente criado com sucesso',
        'patient': patient.to_dict()
    }), 201


@patient_bp.route('', methods=['GET'])
@jwt_required()
def get_patients():
    """Endpoint para obter todos os pacientes"""
    user_id = get_jwt_identity()

    # Parâmetros de busca
    search_term = request.args.get('search', '')

    if search_term:
        # Busca por termo
        patients = patient_repository.search(search_term, user_id)
    else:
        # Busca todos
        patients = patient_repository.get_all(user_id)

    return jsonify({
        'patients': [p.to_dict() for p in patients]
    }), 200


@patient_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    """Endpoint para obter um paciente pelo ID"""
    patient = patient_repository.get_by_id(patient_id)

    if not patient:
        return jsonify({'message': 'Paciente não encontrado'}), 404

    return jsonify({'patient': patient.to_dict()}), 200


@patient_bp.route('/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    """Endpoint para atualizar um paciente"""
    data = request.get_json()

    # Busca o paciente
    patient = patient_repository.get_by_id(patient_id)
    if not patient:
        return jsonify({'message': 'Paciente não encontrado'}), 404

    # Atualiza os dados
    if 'name' in data and data['name']:
        patient.name = data['name']

    if 'age' in data:
        try:
            age = int(data['age']) if data['age'] is not None else None
            if age is not None and (age < 0 or age > 120):
                return jsonify({'message': 'Idade inválida'}), 400
            patient.age = age
        except:
            return jsonify({'message': 'Idade deve ser um número inteiro'}), 400

    if 'gender' in data:
        patient.gender = data['gender']

    if 'gender_other' in data:
        patient.gender_other = data['gender_other']

    if 'ethnicity' in data:
        patient.ethnicity = data['ethnicity']

    if 'ethnicity_other' in data:
        patient.ethnicity_other = data['ethnicity_other']

    if 'marital_status' in data:
        patient.marital_status = data['marital_status']

    if 'city_state' in data:
        patient.city_state = data['city_state']

    if 'income' in data:
        try:
            income = float(data['income']) if data['income'] is not None else None
            if income is not None and income < 0:
                return jsonify({'message': 'Renda inválida'}), 400
            patient.income = income
        except:
            return jsonify({'message': 'Renda deve ser um número'}), 400

    if 'income_range' in data:
        patient.income_range = data['income_range']

    if 'education_institution' in data:
        patient.education_institution = data['education_institution']

    if 'course' in data:
        patient.course = data['course']

    if 'period' in data:
        try:
            period = int(data['period']) if data['period'] is not None else None
            if period is not None and period < 1:
                return jsonify({'message': 'Período inválido'}), 400
            patient.period = period
        except:
            return jsonify({'message': 'Período deve ser um número inteiro'}), 400

    if 'profession' in data:
        patient.profession = data['profession']

    # Salva as alterações
    patient_repository.update(patient)

    return jsonify({
        'message': 'Paciente atualizado com sucesso',
        'patient': patient.to_dict()
    }), 200


@patient_bp.route('/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    """Endpoint para remover um paciente"""
    patient = patient_repository.get_by_id(patient_id)

    if not patient:
        return jsonify({'message': 'Paciente não encontrado'}), 404

    # Remove o paciente
    patient_repository.delete(patient)

    return jsonify({'message': 'Paciente removido com sucesso'}), 200