import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "secret_key_default")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///cursos.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
