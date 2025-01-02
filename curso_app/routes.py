from flask import Blueprint, jsonify, request, render_template
from flask_cors import CORS
from curso_app.models import db, Curso, Estudiante, Valoracion
from sqlalchemy import func
from sqlalchemy.orm import joinedload

routes = Blueprint('routes', __name__)
CORS(routes, resources={
    r"/*": {
        "origins": ["https://sgcursos.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
    }
})

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/api/cursos/<string:nombre>', methods=['OPTIONS'])
def preflight(nombre):
    response = jsonify({'message': 'Preflight request successful'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response, 200

#-------------------------------- * Rutas para Cursos * -----------------------------#
@routes.route('/api/cursos', methods=['GET', 'POST'])
def agregar_curso():
    try:
        if request.method == 'POST':
            data = request.json
            curso_corregido = data.get('nombre', '').capitalize()
            profesor_corregido = data.get('profesor', '').capitalize()
            if not curso_corregido or not profesor_corregido:
                return jsonify({"mensaje": "Todos los campos son obligatorios.", "tipo": "error"}), 400
            if Curso.query.filter_by(nombre=curso_corregido).first():
                return jsonify({"mensaje": "¡Ese curso ya existe!", "tipo": "error"}), 400
            nuevo_curso = Curso(nombre=curso_corregido, profesor=profesor_corregido)
            db.session.add(nuevo_curso)
            db.session.commit()
            return jsonify({"mensaje": "¡Curso agregado correctamente!", "tipo": "success", "curso": nuevo_curso.to_dict()}), 201
    except Exception as e:
        print(f"Error al agregar curso: {e}")  # Verifica los logs
        return jsonify({"mensaje": "Error interno del servidor", "tipo": "error", "detalles": str(e)}), 500


@routes.route('/api/cursos/<string:nombre>', methods=['PUT'])
def editar_curso(nombre):
    curso_nombre = nombre.strip().lower()
    curso = Curso.query.filter(func.lower(Curso.nombre) == curso_nombre).first()
    if not curso:
        return jsonify({"mensaje": "Curso no encontrado", "tipo": "error"}), 404
    datos_actualizados = request.json
    curso.nombre = datos_actualizados.get('nombre', curso.nombre).capitalize()
    curso.profesor = datos_actualizados.get('profesor', curso.profesor).capitalize()
    db.session.commit()
    return jsonify({"mensaje": "Curso actualizado correctamente", "tipo": "success", "curso": curso.to_dict()}), 200

@routes.route('/api/cursos/<string:nombre>', methods=['DELETE'])
def eliminar_curso(nombre):
    try:
        curso_nombre = nombre.strip().lower()
        curso = Curso.query.filter(func.lower(Curso.nombre) == curso_nombre).first()
        if not curso:
            return jsonify({"mensaje": "Curso no encontrado", "tipo": "error"}), 404
        db.session.delete(curso)
        db.session.commit()
        return jsonify({"mensaje": f"Curso '{curso.nombre}' eliminado correctamente", "tipo": "success"}), 200
    except Exception as e:
        print(f"Error al eliminar curso: {e}")
        return jsonify({"mensaje": "Error interno del servidor", "tipo": "error"}), 500

#------------------------------ * Rutas para Estudiantes * --------------------------#
@routes.route('/api/estudiantes', methods=['POST'])
def agregar_estudiante():
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        edad = data.get('edad')
        nota = data.get('nota')
        curso_index = data.get('curso_id')
        if not nombre or not isinstance(nombre, str):
            return jsonify({"mensaje": "Nombre inválido", "tipo": "error"}), 400
        if not isinstance(edad, int) or edad <= 0:
            return jsonify({"mensaje": "Edad inválida", "tipo": "error"}), 400
        if not isinstance(nota, (int, float)) or nota < 0 or nota > 10:
            return jsonify({"mensaje": "Nota inválida", "tipo": "error"}), 400
        if not isinstance(curso_index, int):
            return jsonify({"mensaje": "Curso no válido", "tipo": "error"}), 400
        cursos = Curso.query.order_by(Curso.id).all()
        if curso_index < 0 or curso_index >= len(cursos):
            return jsonify({"mensaje": "Curso no encontrado", "tipo": "error"}), 404
        curso = cursos[curso_index]
        estudiante_existente = next(
            (est for est in curso.estudiantes if est.nombre.lower() == nombre.lower()), None
        )
        if estudiante_existente:
            return jsonify({"mensaje": "¡El estudiante ya existe!", "tipo": "error"}), 400
        nuevo_estudiante = Estudiante(nombre=nombre, edad=edad, nota=nota)
        curso.estudiantes.append(nuevo_estudiante)
        db.session.commit()
        return jsonify({
            "mensaje": f"¡Estudiante {nombre} agregado!",
            "tipo": "success",
            "estudiante": nuevo_estudiante.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error al agregar estudiante: {str(e)}")
        return jsonify({"mensaje": f"Error interno: {str(e)}", "tipo": "error"}), 500

@routes.route('/api/estudiantes/<int:id>', methods=['DELETE'])
def eliminar_estudiante(id):
    try:
        if not isinstance(id, int) or id <= 0:
            return jsonify({"mensaje": "ID no válido", "tipo": "error"}), 400
        estudiante = Estudiante.query.get(id)
        if not estudiante:
            print(f"Estudiante con ID {id} no encontrado en la base de datos.")
            return jsonify({"mensaje": f"Estudiante con ID {id} no encontrado", "tipo": "error"}), 404
        curso = estudiante.curso
        if not curso:
            print(f"El estudiante con ID {id} no tiene un curso asociado.")
            return jsonify({"mensaje": "El curso del estudiante no fue encontrado", "tipo": "error"}), 400
        db.session.delete(estudiante)
        db.session.commit()
        nuevo_promedio = curso.obtener_promedio()
        return jsonify({
            "mensaje": f"¡Estudiante '{estudiante.nombre}' eliminado!",
            "tipo": "success",
            "nuevo_promedio": nuevo_promedio
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error al eliminar estudiante con ID {id}: {e}")
        return jsonify({
            "mensaje": "Error al eliminar estudiante",
            "tipo": "error",
            "detalles": str(e)
        }), 500

@routes.route('/api/estudiantes/<int:id>', methods=['PUT'])
def editar_estudiante(id):
    estudiante = Estudiante.query.get(id)
    if not estudiante:
        return jsonify({"mensaje": "Estudiante no encontrado", "tipo": "error"}), 404
    data = request.get_json()
    nombre = data.get('nombre')
    edad = data.get('edad')
    nota = data.get('nota')
    if not nombre or edad <= 0 or nota < 0 or nota > 10:
        return jsonify({"mensaje": "Datos incorrectos", "tipo": "error"}), 400
    estudiante.nombre = nombre
    estudiante.edad = edad
    estudiante.nota = nota
    db.session.commit()
    return jsonify({"mensaje": "¡Estudiante actualizado!", "tipo": "success", "estudiante": estudiante.to_dict()}), 200

@routes.route('/cursos', methods=['GET'])
def obtener_cursos():
    cursos = Curso.query.all()
    cursos_data = [curso.to_dict() for curso in cursos]
    return jsonify(cursos_data)

@routes.route('/api/valoraciones', methods=['POST'])
def enviar_valoracion():
    data = request.json
    correo = data.get('correo')
    comentario = data.get('comentario')
    puntaje = data.get('valoracion')
    if not (correo and comentario and puntaje):
        return jsonify({"mensaje": "Todos los campos son obligatorios.", "tipo": "error"}), 400
    if Valoracion.query.filter_by(correo=correo).first():
        return jsonify({"mensaje": "Este correo ya envió una valoración.", "tipo": "error"}), 400
    nueva_valoracion = Valoracion(correo=correo, comentario=comentario, puntaje=puntaje)
    db.session.add(nueva_valoracion)
    db.session.commit()
    return jsonify({"mensaje": "¡Gracias por tu valoración!", "tipo": "success"}), 201

@routes.route('/api/valoraciones', methods=['GET'])
def obtener_valoraciones():
    valoraciones = Valoracion.query.all()
    total_puntajes = sum(v.puntaje for v in valoraciones)
    cantidad = len(valoraciones)
    promedio = total_puntajes / cantidad if cantidad > 0 else 0
    valoraciones_json = [
        {
            "correo": v.correo,
            "comentario": v.comentario,
            "puntaje": v.puntaje,
            "fecha": v.fecha.strftime("%Y-%m-%d %H:%M")
        }
        for v in valoraciones
    ]
    return jsonify({"promedio": promedio, "valoraciones": valoraciones_json}), 200
