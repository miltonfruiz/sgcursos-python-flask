import os
import sys
from flask import Flask
from flask_cors import CORS
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from curso_app.config import Config
from curso_app.models import db
from curso_app.routes import routes

def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(os.path.abspath(os.getcwd()), 'curso_app/templates'),
        static_folder=os.path.join(os.path.abspath(os.getcwd()), 'curso_app/static')
    )
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    app.register_blueprint(routes)
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Base de datos inicializada correctamente.")
        except Exception as e:
            app.logger.error(f"Error al inicializar la base de datos: {e}")
    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Error no controlado: {e}")
        return {"mensaje": "Error interno del servidor", "tipo": "error"}, 500
    return app
app = create_app()
application = app
app.config['DEBUG'] = True
app.config['PROPAGATE_EXCEPTIONS'] = True

if __name__ == '__main__':
    app.run(debug=True)
