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


