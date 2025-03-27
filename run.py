# run.py
from app import create_app, db
from flask_migrate import upgrade

app = create_app()

@app.before_first_request
def create_tables():
    """Cria as tabelas do banco de dados antes da primeira requisição"""
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)