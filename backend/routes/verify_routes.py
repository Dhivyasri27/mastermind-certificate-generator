from flask import Blueprint, jsonify
from models.certificate import get_certificate_by_cert_id

verify_bp = Blueprint('verify', __name__, url_prefix='/api/verify')

@verify_bp.route('/<certificate_id>', methods=['GET'])
def verify_certificate(certificate_id):
    cert = get_certificate_by_cert_id(certificate_id)
    if not cert:
        return jsonify({'valid': False, 'status': 'Invalid', 'error': 'Certificate record not found or unverified.'}), 404
    
    return jsonify({
        'valid': True,
        'status': 'Valid',
        'certificate': cert,
        'message': 'Certificate is authentic and valid.'
    }), 200
