from bson import ObjectId
from datetime import datetime
from database import get_db

def get_template_collection():
    return get_db()['certificate_templates']

def default_field_positions():
    """
    Exact visual field coordinates based on the Mastermind Techno Solution & Krishnaa Institute
    1588 x 2048 Master Certificate Template.
    Centered text canvas at X: 59.50% (X: 945px).
    """
    return [
        {
            "field_key": "student_name",
            "field_name": "Student Name",
            "x": 59.50,
            "y": 46.80,
            "font_size": 76,
            "font_family": "AlexBrush",
            "font_weight": "normal",
            "color": "#0e3a8c",
            "alignment": "center"
        },
        {
            "field_key": "course_name",
            "field_name": "Course Name",
            "x": 59.50,
            "y": 57.60,
            "font_size": 32,
            "font_family": "Helvetica-Bold",
            "font_weight": "bold",
            "color": "#0f172a",
            "alignment": "center"
        },
        {
            "field_key": "course_duration",
            "field_name": "Conducted Dates & Duration",
            "x": 59.50,
            "y": 60.55,
            "font_size": 24,
            "font_family": "Helvetica",
            "font_weight": "normal",
            "color": "#1e293b",
            "alignment": "center"
        }
    ]

def serialize_template(doc):
    if not doc:
        return None
    doc['id'] = str(doc['_id'])
    doc['_id'] = str(doc['_id'])
    doc['fields'] = doc.get('fields') or default_field_positions()
    doc['is_active'] = bool(doc.get('is_active', False))
    return doc

def create_template(data):
    is_active = bool(data.get('is_active', True))
    if is_active:
        get_template_collection().update_many({}, {'$set': {'is_active': False}})

    template_doc = {
        'template_name': data.get('template_name', 'Modern Mastermind Techno Solution Master Template').strip(),
        'certificate_type': data.get('certificate_type', 'Completion').strip(),
        'image_path': data.get('image_path', 'mastermind_certificate_template.png').strip(),
        'width': data.get('width', 1588),
        'height': data.get('height', 2048),
        'fields': data.get('fields') or default_field_positions(),
        'is_active': is_active,
        'created_at': datetime.utcnow().isoformat()
    }
    result = get_template_collection().insert_one(template_doc)
    template_doc['_id'] = str(result.inserted_id)
    template_doc['id'] = str(result.inserted_id)
    return template_doc

def get_template_by_id(template_id):
    try:
        doc = get_template_collection().find_one({'_id': ObjectId(template_id)})
        return serialize_template(doc)
    except Exception:
        return None

def update_template_fields(template_id, fields_data):
    fields_to_save = fields_data if (fields_data and isinstance(fields_data, list) and len(fields_data) > 0) else default_field_positions()
    result = get_template_collection().update_one(
        {'_id': ObjectId(template_id)},
        {'$set': {'fields': fields_to_save, 'updated_at': datetime.utcnow().isoformat()}}
    )
    return result.modified_count > 0

def list_templates():
    cursor = get_template_collection().find().sort([('is_active', -1), ('created_at', -1)])
    return [serialize_template(doc) for doc in cursor]


def get_active_template():
    doc = get_template_collection().find_one({'is_active': True})
    if not doc:
        doc = get_template_collection().find_one(sort=[('created_at', -1)])
    return serialize_template(doc)


def delete_template(template_id):
    try:
        result = get_template_collection().delete_one({'_id': ObjectId(template_id)})
        return result.deleted_count > 0
    except Exception:
        return False
