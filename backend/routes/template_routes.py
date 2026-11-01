import os
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required
from config import Config
from models.template import (
    create_template,
    get_template_by_id,
    update_template_fields,
    list_templates,
    delete_template,
    default_field_positions
)

template_bp = Blueprint('templates', __name__, url_prefix='/api/templates')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_IMAGE_EXTENSIONS

@template_bp.route('', methods=['GET'])
@jwt_required()
def get_all_templates():
    templates = list_templates()
    return jsonify({'templates': templates}), 200

@template_bp.route('/<template_id>', methods=['GET'])
@jwt_required()
def get_single_template(template_id):
    tpl = get_template_by_id(template_id)
    if not tpl:
        return jsonify({'error': 'Template not found.'}), 404
    return jsonify(tpl), 200

@template_bp.route('', methods=['POST'])
@jwt_required()
def upload_template():
    file = request.files.get('image') or request.files.get('file')
    if file is None or file.filename == '':
        return jsonify({'error': 'No image file uploaded.'}), 400

    template_name = request.form.get('template_name', '').strip()
    certificate_type = request.form.get('certificate_type', 'Participation').strip()

    if not template_name:
        return jsonify({'error': 'Template name is required.'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Unique filename prefix
        unique_filename = f"{template_name.replace(' ', '_').lower()}_{filename}"
        filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
        file.save(filepath)

        data = {
            'template_name': template_name,
            'certificate_type': certificate_type,
            'image_path': unique_filename,
            'fields': default_field_positions(),
            'is_active': True
        }

        tpl = create_template(data)
        return jsonify({'message': 'Certificate template uploaded successfully.', 'template': tpl}), 201
    else:
        return jsonify({'error': 'Invalid file format. Supported formats: PNG, JPG, JPEG.'}), 400

@template_bp.route('/<template_id>/fields', methods=['PUT'])
@jwt_required()
def save_field_positions(template_id):
    data = request.get_json() or {}
    fields = data.get('fields', [])

    if not isinstance(fields, list):
        return jsonify({'error': 'Fields must be a list.'}), 400

    tpl = get_template_by_id(template_id)
    if not tpl:
        return jsonify({'error': 'Template not found.'}), 404

    success = update_template_fields(template_id, fields)
    return jsonify({'message': 'Field coordinates updated successfully.'}), 200

@template_bp.route('/<template_id>', methods=['DELETE'])
@jwt_required()
def remove_template(template_id):
    tpl = get_template_by_id(template_id)
    if not tpl:
        return jsonify({'error': 'Template not found.'}), 404

    # Remove image file if present
    if tpl.get('image_path'):
        imgPath = os.path.join(Config.UPLOAD_FOLDER, tpl['image_path'])
        if os.path.exists(imgPath):
            try:
                os.remove(imgPath)
            except Exception:
                pass

    delete_template(template_id)
    return jsonify({'message': 'Template deleted successfully.'}), 200

@template_bp.route('/file/<filename>', methods=['GET'])
def serve_template_file(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)
