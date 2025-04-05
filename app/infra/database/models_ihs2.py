# app/infra/database/models_ihs2.py
from app import db
from datetime import datetime


class IHS2Assessment(db.Model):
    """Modelo para avaliações IHS-2"""
    __tablename__ = 'ihs2_assessments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    # Scores for each factor
    f1_score = db.Column(db.Float, nullable=False)  # Conversação e desenvoltura social
    f2_score = db.Column(db.Float, nullable=False)  # Expressão de sentimentos positivos
    f3_score = db.Column(db.Float, nullable=False)  # Assertividade de enfrentamento
    f4_score = db.Column(db.Float, nullable=False)  # Autoexposição a desconhecidos e situações novas
    f5_score = db.Column(db.Float, nullable=False)  # Autocontrole da agressividade
    total_score = db.Column(db.Float, nullable=False)  # Total score

    # Fields to store individual item responses (0-4 for each question)
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
    q22 = db.Column(db.Integer, nullable=False)
    q23 = db.Column(db.Integer, nullable=False)
    q24 = db.Column(db.Integer, nullable=False)
    q25 = db.Column(db.Integer, nullable=False)
    q26 = db.Column(db.Integer, nullable=False)
    q27 = db.Column(db.Integer, nullable=False)
    q28 = db.Column(db.Integer, nullable=False)
    q29 = db.Column(db.Integer, nullable=False)
    q30 = db.Column(db.Integer, nullable=False)
    q31 = db.Column(db.Integer, nullable=False)
    q32 = db.Column(db.Integer, nullable=False)
    q33 = db.Column(db.Integer, nullable=False)
    q34 = db.Column(db.Integer, nullable=False)
    q35 = db.Column(db.Integer, nullable=False)
    q36 = db.Column(db.Integer, nullable=False)
    q37 = db.Column(db.Integer, nullable=False)
    q38 = db.Column(db.Integer, nullable=False)

    # Metadata
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    def to_dict(self):
        """Converte a avaliação para um dicionário"""
        answers = [
            self.q1, self.q2, self.q3, self.q4, self.q5, self.q6, self.q7,
            self.q8, self.q9, self.q10, self.q11, self.q12, self.q13, self.q14,
            self.q15, self.q16, self.q17, self.q18, self.q19, self.q20, self.q21,
            self.q22, self.q23, self.q24, self.q25, self.q26, self.q27, self.q28,
            self.q29, self.q30, self.q31, self.q32, self.q33, self.q34, self.q35,
            self.q36, self.q37, self.q38
        ]

        # Get factor scores and percentiles
        def get_percentile(score, factor):
            """Determines the percentile based on score and normative data"""
            # These are example values - replace with actual normative data
            if factor == 'F1':
                if score <= 16: return "< 25%"
                if score <= 21: return "25-50%"
                if score <= 25: return "50-75%"
                return "> 75%"
            elif factor == 'F2':
                if score <= 14: return "< 25%"
                if score <= 19: return "25-50%"
                if score <= 24: return "50-75%"
                return "> 75%"
            elif factor == 'F3':
                if score <= 15: return "< 25%"
                if score <= 20: return "25-50%"
                if score <= 26: return "50-75%"
                return "> 75%"
            elif factor == 'F4':
                if score <= 14: return "< 25%"
                if score <= 19: return "25-50%"
                if score <= 24: return "50-75%"
                return "> 75%"
            elif factor == 'F5':
                if score <= 10: return "< 25%"
                if score <= 14: return "25-50%"
                if score <= 18: return "50-75%"
                return "> 75%"
            else:  # total
                if score <= 70: return "< 25%"
                if score <= 90: return "25-50%"
                if score <= 110: return "50-75%"
                return "> 75%"

        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'date': self.date.isoformat(),
            'assessment_type': 'IHS2',
            'factor_scores': {
                'F1': self.f1_score,
                'F2': self.f2_score,
                'F3': self.f3_score,
                'F4': self.f4_score,
                'F5': self.f5_score,
            },
            'factor_percentiles': {
                'F1': get_percentile(self.f1_score, 'F1'),
                'F2': get_percentile(self.f2_score, 'F2'),
                'F3': get_percentile(self.f3_score, 'F3'),
                'F4': get_percentile(self.f4_score, 'F4'),
                'F5': get_percentile(self.f5_score, 'F5'),
            },
            'total_score': self.total_score,
            'total_percentile': get_percentile(self.total_score, 'total'),
            'answers': answers
        }