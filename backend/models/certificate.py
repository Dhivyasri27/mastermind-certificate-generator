from bson import ObjectId
from datetime import datetime
import random
from database import get_db

def get_certificate_collection():
    return get_db()['generated_certificates']

def serialize_certificate(doc):
    if not doc:
        return None
    doc['id'] = str(doc['_id'])
    doc['_id'] = str(doc['_id'])
    return doc

def generate_unique_cert_id():
    year = datetime.utcnow().strftime('%Y')
    count = get_certificate_collection().count_documents({}) + 1
    random_suffix = random.randint(100, 999)
    return f"CERT-{year}-{count:04d}{random_suffix}"

def create_certificate_record(data):
    cert_id = data.get('certificate_id') or generate_unique_cert_id()
    doc = {
        'certificate_id': cert_id,
        'student_id': str(data.get('student_id', '')),
        'student_name': data.get('student_name', ''),
        'register_number': data.get('register_number', ''),
        'department': data.get('department', ''),
        'course_name': data.get('course_name', ''),
        'college_name': data.get('college_name', ''),
        'certificate_type': data.get('certificate_type', ''),
        'template_id': str(data.get('template_id', '')),
        'template_name': data.get('template_name', ''),
        'file_name': data.get('file_name', ''),
        'verification_url': data.get('verification_url', ''),
        'generated_at': datetime.utcnow().isoformat(),
        'status': 'Valid'
    }
    result = get_certificate_collection().insert_one(doc)
    doc['_id'] = str(result.inserted_id)
    doc['id'] = str(result.inserted_id)
    return doc

def get_certificate_by_cert_id(cert_id):
    doc = get_certificate_collection().find_one({'certificate_id': cert_id.strip()})
    return serialize_certificate(doc)

def get_certificate_by_id(db_id):
    try:
        doc = get_certificate_collection().find_one({'_id': ObjectId(db_id)})
        return serialize_certificate(doc)
    except Exception:
        return None

def list_certificates(search=None, department=None, certificate_type=None, page=1, limit=10):
    query = {}
    if search:
        search_rgx = {'$regex': search.strip(), '$options': 'i'}
        query['$or'] = [
            {'student_name': search_rgx},
            {'register_number': search_rgx},
            {'certificate_id': search_rgx},
            {'course_name': search_rgx}
        ]
    if department:
        query['department'] = department
    if certificate_type:
        query['certificate_type'] = certificate_type

    collection = get_certificate_collection()
    total_count = collection.count_documents(query)

    skip = (page - 1) * limit
    cursor = collection.find(query).sort('generated_at', -1).skip(skip).limit(limit)

    certificates = [serialize_certificate(doc) for doc in cursor]

    return {
        'certificates': certificates,
        'total': total_count,
        'page': page,
        'limit': limit,
        'pages': (total_count + limit - 1) // limit if limit > 0 else 1
    }

def delete_certificate_record(db_id):
    try:
        result = get_certificate_collection().delete_one({'_id': ObjectId(db_id)})
        return result.deleted_count > 0
    except Exception:
        return False
