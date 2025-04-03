# app/infra/database/repositories/patient_repository.py
from app.infra.database.models import Patient
from app import db
from typing import Optional, List


class PatientRepository:
    """Repositório para operações com pacientes"""

    @staticmethod
    def create(name: str, age: int = None, gender: str = None, income: float = None,
               course: str = None, profession: str = None, created_by: int = None) -> Patient:
        """Cria um novo paciente"""
        patient = Patient(name=name, age=age, gender=gender, income=income,
                        course=course, profession=profession, created_by=created_by)
        db.session.add(patient)
        db.session.commit()
        return patient

    @staticmethod
    def get_by_id(patient_id: int) -> Optional[Patient]:
        """Busca um paciente pelo ID"""
        return Patient.query.get(patient_id)

    @staticmethod
    def get_all(created_by: int = None) -> List[Patient]:
        """Busca todos os pacientes, opcionalmente filtrados por criador"""
        if created_by:
            return Patient.query.filter_by(created_by=created_by).all()
        return Patient.query.all()

    @staticmethod
    def search(term: str, created_by: int = None) -> List[Patient]:
        """Busca pacientes pelo nome"""
        query = Patient.query.filter(Patient.name.ilike(f'%{term}%'))
        if created_by:
            query = query.filter_by(created_by=created_by)
        return query.all()

    @staticmethod
    def update(patient: Patient) -> Patient:
        """Atualiza um paciente"""
        db.session.commit()
        return patient

    @staticmethod
    def delete(patient: Patient) -> bool:
        """Remove um paciente"""
        db.session.delete(patient)
        db.session.commit()
        return True