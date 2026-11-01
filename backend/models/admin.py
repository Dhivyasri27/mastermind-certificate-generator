from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from database import get_db

def get_admin_collection():
    return get_db()['admins']

def find_admin_by_email(email):
    return get_admin_collection().find_one({'email': email.lower().strip()})

def create_admin(email, password, name="Administrator"):
    db = get_admin_collection()
    existing = find_admin_by_email(email)
    if existing:
        return existing
    
    hashed_password = generate_password_hash(password)
    admin_doc = {
        'email': email.lower().strip(),
        'password': hashed_password,
        'name': name,
        'role': 'admin',
        'created_at': datetime.utcnow().isoformat()
    }
    result = db.insert_one(admin_doc)
    admin_doc['_id'] = str(result.inserted_id)
    return admin_doc

def verify_password(stored_hash, password):
    return check_password_hash(stored_hash, password)
