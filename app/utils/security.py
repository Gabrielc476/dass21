# app/utils/security.py
from flask_jwt_extended import create_access_token
from datetime import timedelta
import re


def generate_jwt_token(user_id: int, expires_delta: timedelta = None) -> str:
    """
    Gera um token JWT para o usuário

    Args:
        user_id: ID do usuário
        expires_delta: Tempo de expiração (opcional)

    Returns:
        Token JWT
    """
    token = create_access_token(
        identity=user_id,
        expires_delta=expires_delta
    )
    return token


# app/utils/validators.py
import re
from typing import Tuple, Dict


class Validators:
    """Funções de validação para entradas de usuário"""

    @staticmethod
    def validate_username(username: str) -> Tuple[bool, str]:
        """
        Valida um nome de usuário

        Args:
            username: Nome de usuário para validar

        Returns:
            Tuple com (válido, mensagem de erro)
        """
        if not username:
            return False, "Nome de usuário não pode ser vazio"

        if len(username) < 3:
            return False, "Nome de usuário deve ter pelo menos 3 caracteres"

        if len(username) > 50:
            return False, "Nome de usuário não pode ter mais de 50 caracteres"

        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return False, "Nome de usuário só pode conter letras, números e sublinhados"

        return True, ""

    @staticmethod
    def validate_email(email: str) -> Tuple[bool, str]:
        """
        Valida um endereço de email

        Args:
            email: Email para validar

        Returns:
            Tuple com (válido, mensagem de erro)
        """
        if not email:
            return False, "Email não pode ser vazio"

        # Expressão regular para validação básica de email
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return False, "Email inválido"

        return True, ""

    @staticmethod
    def validate_password(password: str) -> Tuple[bool, str]:
        """
        Valida uma senha

        Args:
            password: Senha para validar

        Returns:
            Tuple com (válido, mensagem de erro)
        """
        if not password:
            return False, "Senha não pode ser vazia"

        if len(password) < 6:
            return False, "Senha deve ter pelo menos 6 caracteres"

        if len(password) > 128:
            return False, "Senha não pode ter mais de 128 caracteres"

        # Verifica se a senha tem pelo menos uma letra e um número
        if not re.search(r'[A-Za-z]', password) or not re.search(r'[0-9]', password):
            return False, "Senha deve conter pelo menos uma letra e um número"

        return True, ""

    @staticmethod
    def validate_dass21_answers(answers) -> Tuple[bool, str]:
        """
        Valida as respostas do DASS-21

        Args:
            answers: Lista de respostas para validar

        Returns:
            Tuple com (válido, mensagem de erro)
        """
        if not isinstance(answers, list):
            return False, "As respostas devem ser uma lista"

        if len(answers) != 21:
            return False, "Deve fornecer exatamente 21 respostas"

        for i, answer in enumerate(answers):
            if not isinstance(answer, int):
                return False, f"A resposta {i + 1} deve ser um número inteiro"

            if answer < 0 or answer > 3:
                return False, f"A resposta {i + 1} deve ser um valor entre 0 e 3"

        return True, ""