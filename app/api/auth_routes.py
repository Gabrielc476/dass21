from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.core.services.auth_service import AuthService
from app.infra.database.repositories.user_repository import UserRepository
from app.utils.validators import Validators

# Criação do blueprint
auth_bp = Blueprint('auth', __name__)

# Inicialização dos serviços
user_repository = UserRepository()
auth_service = AuthService(user_repository)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint para registro de usuários"""
    data = request.get_json()

    # Valida os dados
    username = data.get('username', '')
    email = data.get('email', '')
    password = data.get('password', '')

    # Valida o nome de usuário
    valid_username, username_error = Validators.validate_username(username)
    if not valid_username:
        return jsonify({'message': username_error}), 400

    # Valida o email
    valid_email, email_error = Validators.validate_email(email)
    if not valid_email:
        return jsonify({'message': email_error}), 400

    # Valida a senha
    valid_password, password_error = Validators.validate_password(password)
    if not valid_password:
        return jsonify({'message': password_error}), 400

    # Registra o usuário
    response, status_code = auth_service.register(username, email, password)
    return jsonify(response), status_code


@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para login de usuários"""
    data = request.get_json()

    # Obtém os dados
    username = data.get('username', '')
    password = data.get('password', '')

    # Valida os dados
    if not username or not password:
        return jsonify({'message': 'Nome de usuário e senha são obrigatórios'}), 400

    # Realiza o login
    response, status_code = auth_service.login(username, password)
    return jsonify(response), status_code


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Endpoint para obter o usuário atual"""
    user_id = get_jwt_identity()
    user = user_repository.get_by_id(user_id)

    if not user:
        return jsonify({'message': 'Usuário não encontrado'}), 404

    return jsonify({'user': user.to_dict()}), 200