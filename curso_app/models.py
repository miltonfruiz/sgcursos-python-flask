from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Curso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    profesor = db.Column(db.String(100), nullable=False)
    estudiantes = db.relationship(
        'Estudiante',
        backref='curso',
        lazy=True,
        cascade='all, delete-orphan'
    )
    def __repr__(self):
        return f'<Curso {self.nombre}>'
    def obtener_promedio(self):
        total_notas = sum([est.nota for est in self.estudiantes])
        return total_notas / len(self.estudiantes) if len(self.estudiantes) > 0 else "N/A"
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'profesor': self.profesor,
            'estudiantes': [est.to_dict() for est in self.estudiantes],
            'promedio': self.obtener_promedio()
        }

class Estudiante(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    edad = db.Column(db.Integer, nullable=False)
    nota = db.Column(db.Float, nullable=False)
    curso_id = db.Column(db.Integer, db.ForeignKey('curso.id'), nullable=False)
    def __repr__(self):
        return f'<Estudiante {self.nombre}>'
    def presentarse(self):
        return f'{self.nombre} ({self.edad} años) - Nota: {self.nota}'
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'edad': self.edad,
            'nota': self.nota
        }

class Valoracion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    correo = db.Column(db.String(120), unique=True, nullable=False)
    comentario = db.Column(db.Text, nullable=False)
    puntaje = db.Column(db.Integer, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
