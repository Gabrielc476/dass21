# app/infra/database/models.py
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """Modelo de usuário para autenticação"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, index=True)
    email = db.Column(db.String(120), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        """Define a senha do usuário com hash"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica a senha do usuário"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Converte o usuário para um dicionário (sem senha)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class Patient(db.Model):
    """Modelo para pacientes"""
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(50))
    gender_other = db.Column(db.String(100))  # Para quando 'outro' for selecionado
    ethnicity = db.Column(db.String(50))  # Etnia
    ethnicity_other = db.Column(db.String(100))  # Para quando 'outro' for selecionado em etnia
    marital_status = db.Column(db.String(50))  # Estado Civil
    city_state = db.Column(db.String(100))  # Cidade/Estado
    income = db.Column(db.Float)  # Renda (valor numérico)
    income_range = db.Column(db.String(50))  # Faixa de renda
    education_institution = db.Column(db.String(100))  # Instituição de Ensino
    course = db.Column(db.String(100))  # Curso de Graduação
    period = db.Column(db.Integer)  # Período
    profession = db.Column(db.String(100))  # Profissão
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos
    assessments = db.relationship('DASS21Assessment', backref='patient', lazy='dynamic')

    def to_dict(self):
        """Converte o paciente para um dicionário"""
        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'gender': self.gender,
            'gender_other': self.gender_other,
            'ethnicity': self.ethnicity,
            'ethnicity_other': self.ethnicity_other,
            'marital_status': self.marital_status,
            'city_state': self.city_state,
            'income': self.income,
            'income_range': self.income_range,
            'education_institution': self.education_institution,
            'course': self.course,
            'period': self.period,
            'profession': self.profession,
            'created_at': self.created_at.isoformat()
        }

class DASS21Assessment(db.Model):
    """Modelo para avaliações DASS-21"""
    __tablename__ = 'dass21_assessments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    # Pontuações
    depression_score = db.Column(db.Float, nullable=False)
    anxiety_score = db.Column(db.Float, nullable=False)
    stress_score = db.Column(db.Float, nullable=False)

    # Campos para armazenar as respostas individuais (0-3 para cada questão)
    q1 = db.Column(db.Integer, nullable=False)
    q2 = db.Column(db.Integer, nullable=False)
    q3 = db.Column(db.Integer, nullable=False)
    q4 = db.Column(db.Integer, nullable=False)
    q5 = db.Column(db.Integer, nullable=False)
    q6 = db.Column(db.Integer, nullable=False)
    q7 = db.Column(db.Integer, nullable=False)
    q8 = db.Column(db.Integer, nullable=False)
    q9 = db.Column(db.Integer, nullable=False)
    q10 = db.Column(db.Integer, nullable=False)
    q11 = db.Column(db.Integer, nullable=False)
    q12 = db.Column(db.Integer, nullable=False)
    q13 = db.Column(db.Integer, nullable=False)
    q14 = db.Column(db.Integer, nullable=False)
    q15 = db.Column(db.Integer, nullable=False)
    q16 = db.Column(db.Integer, nullable=False)
    q17 = db.Column(db.Integer, nullable=False)
    q18 = db.Column(db.Integer, nullable=False)
    q19 = db.Column(db.Integer, nullable=False)
    q20 = db.Column(db.Integer, nullable=False)
    q21 = db.Column(db.Integer, nullable=False)

    # Metadados
    ocr_processed = db.Column(db.Boolean, default=False)
    image_path = db.Column(db.String(255), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    def to_dict(self):
        """Converte a avaliação para um dicionário"""
        answers = [
            self.q1, self.q2, self.q3, self.q4, self.q5, self.q6, self.q7,
            self.q8, self.q9, self.q10, self.q11, self.q12, self.q13, self.q14,
            self.q15, self.q16, self.q17, self.q18, self.q19, self.q20, self.q21
        ]

        def get_level(score, category):
            """Determina o nível com base na pontuação e categoria"""
            if category == 'depression':
                if score <= 9: return "Normal"
                if score <= 13: return "Leve"
                if score <= 20: return "Moderado"
                if score <= 27: return "Severo"
                return "Extremamente Severo"
            elif category == 'anxiety':
                if score <= 7: return "Normal"
                if score <= 9: return "Leve"
                if score <= 14: return "Moderado"
                if score <= 19: return "Severo"
                return "Extremamente Severo"
            else:  # stress
                if score <= 14: return "Normal"
                if score <= 18: return "Leve"
                if score <= 25: return "Moderado"
                if score <= 33: return "Severo"
                return "Extremamente Severo"

        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'date': self.date.isoformat(),
            'depression': {
                'score': self.depression_score,
                'level': get_level(self.depression_score, 'depression')
            },
            'anxiety': {
                'score': self.anxiety_score,
                'level': get_level(self.anxiety_score, 'anxiety')
            },
            'stress': {
                'score': self.stress_score,
                'level': get_level(self.stress_score, 'stress')
            },
            'answers': answers,
            'ocr_processed': self.ocr_processed
        }