from app.infra.database.models import User
from app import db
from typing import Optional, List


class UserRepository:
    """Repositório para operações com usuários"""

    @staticmethod
    def create(username: str, email: str, password: str) -> User:
        """Cria um novo usuário"""
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_by_id(user_id: int) -> Optional[User]:
        """Busca um usuário pelo ID"""
        return User.query.get(user_id)

    @staticmethod
    def get_by_username(username: str) -> Optional[User]:
        """Busca um usuário pelo nome de usuário"""
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        """Busca um usuário pelo email"""
        return User.query.filter_by(email=email).first()

    @staticmethod
    def update(user: User) -> User:
        """Atualiza um usuário"""
        db.session.commit()
        return user

    @staticmethod
    def delete(user: User) -> bool:
        """Remove um usuário"""
        db.session.delete(user)
        db.session.commit()
        return True