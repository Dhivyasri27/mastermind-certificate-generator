from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.admin import find_admin_by_email, verify_password

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and Password are required.'}), 400

    admin = find_admin_by_email(email)
    if not admin or not verify_password(admin['password'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    access_token = create_access_token(identity=admin['email'])
    return jsonify({
        'message': 'Login successful.',
        'access_token': access_token,
        'user': {
            'email': admin['email'],
            'name': admin.get('name', 'Administrator'),
            'role': admin.get('role', 'admin')
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_email = get_jwt_identity()
    admin = find_admin_by_email(current_email)
    if not admin:
        return jsonify({'error': 'Admin user not found.'}), 404
    
    return jsonify({
        'user': {
            'email': admin['email'],
            'name': admin.get('name', 'Administrator'),
            'role': admin.get('role', 'admin')
        }
    }), 200
