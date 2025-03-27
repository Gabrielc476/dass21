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

    # Cria o paciente
    patient = patient_repository.create(name, age, gender, user_id)

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