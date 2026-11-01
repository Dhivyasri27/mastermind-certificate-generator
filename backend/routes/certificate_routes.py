import os
import zipfile
import re
from flask import Blueprint, request, jsonify, send_from_directory, send_file
from flask_jwt_extended import jwt_required
from config import Config
from models.student import (
    get_student_by_id,
    list_students,
    get_student_collection,
    create_student,
    find_student_by_reg_no
)
from models.template import get_template_by_id
from models.certificate import (
    create_certificate_record,
    list_certificates,
    get_certificate_by_id,
    delete_certificate_record,
    generate_unique_cert_id
)
from services.certificate_generator import generate_certificate_pdf

certificate_bp = Blueprint('certificates', __name__, url_prefix='/api/certificates')

def sanitize_filename_part(text):
    if not text:
        return ''
    cleaned = re.sub(r'[^\w\s\-]', '', str(text))
    return cleaned.strip().replace(' ', '_')

@certificate_bp.route('', methods=['GET'])
@jwt_required()
def get_all_certificates():
    search = request.args.get('search', '')
    department = request.args.get('department', '')
    certificate_type = request.args.get('certificate_type', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))

    result = list_certificates(
        search=search if search else None,
        department=department if department else None,
        certificate_type=certificate_type if certificate_type else None,
        page=page,
        limit=limit
    )
    return jsonify(result), 200

@certificate_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_individual():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    template_id = data.get('template_id')

    student_data_payload = data.get('student_data') or (data if data.get('name') else None)

    if not student_id and not student_data_payload:
        return jsonify({'error': 'Student ID or student details are required.'}), 400

    student = get_student_by_id(student_id) if student_id else None
    if not student and student_data_payload:
        reg_no = student_data_payload.get('register_number', '').strip()
        if not reg_no:
            reg_no = 'REG' + generate_unique_cert_id()[-6:]
        student_data_payload['register_number'] = reg_no
        try:
            student = create_student(student_data_payload)
        except Exception:
            student = find_student_by_reg_no(reg_no) or student_data_payload
            if isinstance(student, dict) and 'id' not in student:
                student['id'] = str(student.get('_id', reg_no))

    if not student:
        return jsonify({'error': 'Student record not found.'}), 404

    template = get_template_by_id(template_id) if template_id else None
    if not template:
        from models.template import get_active_template
        template = get_active_template()
    if not template:
        return jsonify({'error': 'Certificate template not found.'}), 404

    tpl_image_path = os.path.join(Config.UPLOAD_FOLDER, template['image_path'])
    if not os.path.exists(tpl_image_path):
        return jsonify({'error': 'Template background image file missing from server.'}), 400

    cert_id = generate_unique_cert_id()
    
    # Filename format: 21IT001_Arun_Kumar.pdf
    reg_clean = sanitize_filename_part(student.get('register_number', 'REG'))
    name_clean = sanitize_filename_part(student.get('name', 'Student'))
    pdf_filename = f"{reg_clean}_{name_clean}.pdf"

    try:
        generate_certificate_pdf(
            template_image_path=tpl_image_path,
            student_data=student,
            field_configurations=template.get('fields', []),
            cert_id=cert_id,
            output_pdf_filename=pdf_filename
        )

        cert_record = create_certificate_record({
            'certificate_id': cert_id,
            'student_id': student['id'],
            'student_name': student.get('name'),
            'register_number': student.get('register_number'),
            'department': student.get('department'),
            'course_name': student.get('course_name'),
            'college_name': student.get('college_name'),
            'certificate_type': student.get('certificate_type'),
            'template_id': template['id'],
            'template_name': template.get('template_name'),
            'file_name': pdf_filename,
            'verification_url': f"{Config.FRONTEND_URL}/verify/{cert_id}"
        })

        return jsonify({
            'message': 'Certificate generated successfully.',
            'certificate': cert_record,
            'download_url': f"/api/certificates/download/{pdf_filename}"
        }), 201
    except Exception as e:
        return jsonify({'error': f"Certificate generation failed: {str(e)}"}), 500

@certificate_bp.route('/generate-bulk', methods=['POST'])
@jwt_required()
def generate_bulk():
    data = request.get_json() or {}
    template_id = data.get('template_id')
    student_ids = data.get('student_ids', [])

    if not template_id or not student_ids or not isinstance(student_ids, list):
        return jsonify({'error': 'Template ID and a list of Student IDs are required.'}), 400

    template = get_template_by_id(template_id)
    if not template:
        return jsonify({'error': 'Certificate template not found.'}), 404

    tpl_image_path = os.path.join(Config.UPLOAD_FOLDER, template['image_path'])
    if not os.path.exists(tpl_image_path):
        return jsonify({'error': 'Template background image file missing from server.'}), 400

    generated_records = []
    failed_students = []

    CHUNK_SIZE = 50
    for i in range(0, len(student_ids), CHUNK_SIZE):
        chunk = student_ids[i:i + CHUNK_SIZE]
        for sid in chunk:
            student = get_student_by_id(sid)
            if not student:
                failed_students.append({'student_id': sid, 'reason': 'Student not found'})
                continue
            
            try:
                cert_id = generate_unique_cert_id()
                reg_clean = sanitize_filename_part(student.get('register_number', 'REG'))
                name_clean = sanitize_filename_part(student.get('name', 'Student'))
                pdf_filename = f"{reg_clean}_{name_clean}.pdf"

                generate_certificate_pdf(
                    template_image_path=tpl_image_path,
                    student_data=student,
                    field_configurations=template.get('fields', []),
                    cert_id=cert_id,
                    output_pdf_filename=pdf_filename
                )

                cert_record = create_certificate_record({
                    'certificate_id': cert_id,
                    'student_id': student['id'],
                    'student_name': student.get('name'),
                    'register_number': student.get('register_number'),
                    'department': student.get('department'),
                    'course_name': student.get('course_name'),
                    'college_name': student.get('college_name'),
                    'certificate_type': student.get('certificate_type'),
                    'template_id': template['id'],
                    'template_name': template.get('template_name'),
                    'file_name': pdf_filename,
                    'verification_url': f"{Config.FRONTEND_URL}/verify/{cert_id}"
                })
                generated_records.append(cert_record)
            except Exception as ex:
                failed_students.append({'student_id': sid, 'reason': str(ex)})

    return jsonify({
        'message': f"Bulk generation completed: {len(generated_records)} generated, {len(failed_students)} failed.",
        'total_requested': len(student_ids),
        'total_generated': len(generated_records),
        'total_failed': len(failed_students),
        'generated_certificates': generated_records,
        'failed_students': failed_students
    }), 200

@certificate_bp.route('/download/<filename>', methods=['GET'])
def download_certificate_file(filename):
    return send_from_directory(Config.GENERATED_FOLDER, filename, as_attachment=True)

@certificate_bp.route('/download-zip', methods=['GET', 'POST'])
@jwt_required()
def download_zip():
    data = request.get_json() or {}
    cert_ids = data.get('certificate_ids', [])

    zip_filename = "Certificates.zip"
    zip_filepath = os.path.join(Config.GENERATED_FOLDER, zip_filename)

    if cert_ids:
        records = [get_certificate_by_id(cid) for cid in cert_ids if get_certificate_by_id(cid)]
    else:
        result = list_certificates(limit=1000)
        records = result.get('certificates', [])

    if not records:
        return jsonify({'error': 'No generated certificates available to download.'}), 404

    with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for rec in records:
            fname = rec.get('file_name')
            if fname:
                fpath = os.path.join(Config.GENERATED_FOLDER, fname)
                if os.path.exists(fpath):
                    zipf.write(fpath, arcname=fname)

    return send_file(zip_filepath, as_attachment=True, download_name=zip_filename)

@certificate_bp.route('/<certificate_db_id>', methods=['DELETE'])
@jwt_required()
def delete_certificate(certificate_db_id):
    cert = get_certificate_by_id(certificate_db_id)
    if not cert:
        return jsonify({'error': 'Certificate record not found.'}), 404

    fname = cert.get('file_name')
    if fname:
        fpath = os.path.join(Config.GENERATED_FOLDER, fname)
        if os.path.exists(fpath):
            try:
                os.remove(fpath)
            except Exception:
                pass

    delete_certificate_record(certificate_db_id)
    return jsonify({'message': 'Certificate record deleted.'}), 200
