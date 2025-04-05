# app/__init__.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

# Inicialização das extensões
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name='development'):
    """Factory pattern para criar a aplicação Flask"""
    app = Flask(__name__)

    # Configuração baseada no ambiente
    if config_name == 'development':
        app.config.from_object('app.config.DevelopmentConfig')
    elif config_name == 'production':
        app.config.from_object('app.config.ProductionConfig')
    elif config_name == 'testing':
        app.config.from_object('app.config.TestingConfig')

    # Inicialização das extensões com a aplicação
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Importação e registro dos blueprints
    from app.api.auth_routes import auth_bp
    from app.api.patient_routes import patient_bp
    from app.api.dass21_routes import dass21_bp
    from app.api.ihs2_routes import ihs2_bp
    app.register_blueprint(ihs2_bp, url_prefix='/api/ihs2')

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api/patients')
    app.register_blueprint(dass21_bp, url_prefix='/api/dass21')

    # Garantir que os diretórios de upload existam
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    return app