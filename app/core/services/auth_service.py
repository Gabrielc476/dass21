from app.infra.database.repositories.user_repository import UserRepository
from app.utils.security import generate_jwt_token
from typing import Dict, Optional, Tuple


class AuthService:
    """Serviço para autenticação de usuários"""

    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register(self, username: str, email: str, password: str) -> Tuple[Dict, int]:
        """
        Registra um novo usuário

        Args:
            username: Nome de usuário
            email: Email do usuário
            password: Senha do usuário

        Returns:
            Tuple com resposta e código HTTP
        """
        # Verifica se o usuário já existe
        if self.user_repository.get_by_username(username):
            return {'message': 'Nome de usuário já existe'}, 400

        if self.user_repository.get_by_email(email):
            return {'message': 'Email já está em uso'}, 400

        # Cria o usuário
        user = self.user_repository.create(username, email, password)

        # Gera o token
        token = generate_jwt_token(user.id)

        return {
            'message': 'Usuário registrado com sucesso',
            'user': user.to_dict(),
            'token': token
        }, 201

    def login(self, username: str, password: str) -> Tuple[Dict, int]:
        """
        Realiza login de um usuário

        Args:
            username: Nome de usuário ou email
            password: Senha do usuário

        Returns:
            Tuple com resposta e código HTTP
        """
        # Busca o usuário pelo nome de usuário ou email
        user = self.user_repository.get_by_username(username)
        if not user:
            user = self.user_repository.get_by_email(username)

        # Verifica se o usuário existe e a senha está correta
        if not user or not user.check_password(password):
            return {'message': 'Credenciais inválidas'}, 401

        # Gera o token
        token = generate_jwt_token(user.id)

        return {
            'message': 'Login realizado com sucesso',
            'user': user.to_dict(),
            'token': token
        }, 200