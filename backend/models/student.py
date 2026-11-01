from bson import ObjectId
from datetime import datetime
from database import get_db

def get_student_collection():
    return get_db()['students']

def serialize_student(doc):
    if not doc:
        return None
    doc['id'] = str(doc['_id'])
    doc['_id'] = str(doc['_id'])
    return doc

def find_student_by_reg_no(register_number, exclude_id=None):
    query = {'register_number': register_number.strip()}
    if exclude_id:
        try:
            query['_id'] = {'$ne': ObjectId(exclude_id)}
        except Exception:
            pass
    return get_student_collection().find_one(query)

def get_student_by_id(student_id):
    if not student_id:
        return None
    try:
        doc = get_student_collection().find_one({'_id': ObjectId(student_id)})
        if doc:
            return serialize_student(doc)
    except Exception:
        pass
    # Fallback to search by register number
    try:
        doc = get_student_collection().find_one({'register_number': str(student_id).strip()})
        if doc:
            return serialize_student(doc)
    except Exception:
        pass
    return None

def create_student(data):
    reg_no = data.get('register_number', '').strip()
    if find_student_by_reg_no(reg_no):
        raise ValueError(f"Student with Register Number '{reg_no}' already exists.")

    student_doc = {
        'name': data.get('name', '').strip(),
        'register_number': reg_no,
        'department': data.get('department', '').strip(),
        'year': data.get('year', 'IV').strip(),
        'college_name': data.get('college_name', '').strip(),
        'course_name': data.get('course_name', '').strip(),
        'start_date': data.get('start_date', '').strip(),
        'end_date': data.get('end_date', '').strip(),
        'duration': data.get('duration', '').strip(),
        'certificate_type': data.get('certificate_type', 'Participation').strip(),
        'date': data.get('date', datetime.utcnow().strftime('%d-%m-%Y')).strip(),
        'created_at': datetime.utcnow().isoformat()
    }
    result = get_student_collection().insert_one(student_doc)
    student_doc['_id'] = str(result.inserted_id)
    student_doc['id'] = str(result.inserted_id)
    return student_doc

def update_student(student_id, data):
    reg_no = data.get('register_number', '').strip()
    if reg_no:
        existing = find_student_by_reg_no(reg_no, exclude_id=student_id)
        if existing:
            raise ValueError(f"Student with Register Number '{reg_no}' already exists.")

    update_fields = {
        'name': data.get('name', '').strip(),
        'register_number': reg_no,
        'department': data.get('department', '').strip(),
        'year': data.get('year', '').strip(),
        'college_name': data.get('college_name', '').strip(),
        'course_name': data.get('course_name', '').strip(),
        'certificate_type': data.get('certificate_type', '').strip(),
        'date': data.get('date', '').strip(),
        'updated_at': datetime.utcnow().isoformat()
    }
    # remove empty keys if not provided
    update_fields = {k: v for k, v in update_fields.items() if v != ''}

    result = get_student_collection().update_one(
        {'_id': ObjectId(student_id)},
        {'$set': update_fields}
    )
    if result.matched_count == 0:
        return None
    return get_student_by_id(student_id)

def delete_student(student_id):
    try:
        result = get_student_collection().delete_one({'_id': ObjectId(student_id)})
        return result.deleted_count > 0
    except Exception:
        return False

def list_students(search=None, department=None, certificate_type=None, page=1, limit=10):
    query = {}
    if search:
        search_rgx = {'$regex': search.strip(), '$options': 'i'}
        query['$or'] = [
            {'name': search_rgx},
            {'register_number': search_rgx},
            {'course_name': search_rgx}
        ]
    if department:
        query['department'] = department
    if certificate_type:
        query['certificate_type'] = certificate_type

    collection = get_student_collection()
    total_count = collection.count_documents(query)

    skip = (page - 1) * limit
    cursor = collection.find(query).sort('created_at', -1).skip(skip).limit(limit)

    students = [serialize_student(doc) for doc in cursor]

    return {
        'students': students,
        'total': total_count,
        'page': page,
        'limit': limit,
        'pages': (total_count + limit - 1) // limit if limit > 0 else 1
    }
