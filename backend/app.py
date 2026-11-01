import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.template_routes import template_bp
from routes.certificate_routes import certificate_bp
from routes.verify_routes import verify_bp
from seed_data import seed_database

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure CORS for local development and hosted frontend origins
    CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["*"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Setup JWT
    JWTManager(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(template_bp)
    app.register_blueprint(certificate_bp)
    app.register_blueprint(verify_bp)

    # Automatically ensure database is seeded on initialization
    try:
        seed_database()
    except Exception as e:
        app.logger.warning(f"Database seeding warning: {e}")

    @app.route('/', methods=['GET'])
    def root_health():
        return jsonify({
            'status': 'healthy',
            'service': 'Mastermind Certificate Generator API',
            'version': '1.0.0'
        }), 200

    @app.route('/healthz', methods=['GET'])
    def healthz():
        return jsonify({'status': 'ok'}), 200

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'app': 'Student Certificate Generator System API',
            'version': '1.0.0'
        }), 200

    # Serve uploads and generated files statically for API testing
    @app.route('/uploads/templates/<path:filename>')
    def serve_uploaded_template(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    @app.route('/generated/certificates/<path:filename>')
    def serve_generated_certificate(filename):
        return send_from_directory(Config.GENERATED_FOLDER, filename)

    return app

app = create_app()

if __name__ == '__main__':
    # Auto-seed database on startup
    try:
        seed_database()
    except Exception as e:
        print(f"Warning: Database seeding skipped on startup: {e}")

    port = int(os.getenv('PORT', 5000))
    print(f"--> Starting Flask REST API server on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
