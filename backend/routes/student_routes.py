import os
from flask import Blueprint, request, jsonify, send_from_directory, send_file
from flask_jwt_extended import jwt_required
from config import Config
from models.student import (
    create_student,
    get_student_by_id,
    update_student,
    delete_student,
    list_students,
    find_student_by_reg_no
)
from services.excel_service import parse_student_file

student_bp = Blueprint('students', __name__, url_prefix='/api/students')

@student_bp.route('', methods=['GET'])
@jwt_required()
def get_students():
    search = request.args.get('search', '')
    department = request.args.get('department', '')
    certificate_type = request.args.get('certificate_type', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))

    result = list_students(
        search=search if search else None,
        department=department if department else None,
        certificate_type=certificate_type if certificate_type else None,
        page=page,
        limit=limit
    )
    return jsonify(result), 200

@student_bp.route('/<student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    student = get_student_by_id(student_id)
    if not student:
        return jsonify({'error': 'Student not found.'}), 404
    return jsonify(student), 200

@student_bp.route('', methods=['POST'])
@jwt_required()
def add_student():
    data = request.get_json() or {}
    
    required = ['name', 'register_number', 'department', 'college_name', 'course_name', 'certificate_type']
    missing = [f for f in required if not data.get(f, '').strip()]
    if missing:
        return jsonify({'error': f"Missing mandatory fields: {', '.join(missing)}"}), 400

    try:
        student = create_student(data)
        return jsonify({'message': 'Student added successfully.', 'student': student}), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': f"Failed to create student: {str(e)}"}), 500

@student_bp.route('/<student_id>', methods=['PUT'])
@jwt_required()
def edit_student(student_id):
    data = request.get_json() or {}
    try:
        updated = update_student(student_id, data)
        if not updated:
            return jsonify({'error': 'Student not found.'}), 404
        return jsonify({'message': 'Student updated successfully.', 'student': updated}), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': f"Failed to update student: {str(e)}"}), 500

@student_bp.route('/<student_id>', methods=['DELETE'])
@jwt_required()
def remove_student(student_id):
    success = delete_student(student_id)
    if not success:
        return jsonify({'error': 'Student not found or deletion failed.'}), 404
    return jsonify({'message': 'Student deleted successfully.'}), 200

@student_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_students():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400
    
    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'No selected file.'}), 400

    try:
        summary = parse_student_file(file, file.filename)
        return jsonify({'summary': summary}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@student_bp.route('/bulk-save', methods=['POST'])
@jwt_required()
def bulk_save_students():
    data = request.get_json()
    if isinstance(data, list):
        records = data
    elif isinstance(data, dict):
        records = data.get('records') or data.get('students') or []
    else:
        records = []

    if not records:
        return jsonify({'error': 'No student records provided.'}), 400

    inserted_students = []
    skipped_records = []

    for item in records:
        reg_no = str(item.get('register_number', '')).strip()
        if not reg_no:
            skipped_records.append("Empty Reg No")
            continue

        existing = find_student_by_reg_no(reg_no)
        if existing:
            inserted_students.append(existing)
            continue

        try:
            st = create_student(item)
            inserted_students.append(st)
        except Exception:
            skipped_records.append(reg_no)

    return jsonify({
        'message': f"Successfully processed {len(inserted_students)} students.",
        'inserted_count': len(inserted_students),
        'inserted_students': inserted_students,
        'skipped_count': len(skipped_records),
        'skipped_reg_numbers': skipped_records
    }), 201

@student_bp.route('/download-template', methods=['GET'])
def download_excel_template():
    tpl_path = os.path.join(Config.BASE_DIR, 'Student_Upload_Template.xlsx')
    if not os.path.exists(tpl_path):
        tpl_path = os.path.join(Config.BASE_DIR, '..', 'Student_Upload_Template.xlsx')
    if os.path.exists(tpl_path):
        return send_file(os.path.abspath(tpl_path), as_attachment=True, download_name="Student_Upload_Template.xlsx")
    return jsonify({'error': 'Template file not found.'}), 404
