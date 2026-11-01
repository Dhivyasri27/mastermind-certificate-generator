import os
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

class Config:
    BASE_DIR = BASE_DIR
    SECRET_KEY = os.getenv('SECRET_KEY', 'student_cert_secret_key_2026_super_secure')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'student_cert_jwt_secret_key_2026_jwt')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # MongoDB Atlas connection string and database configuration
    MONGO_URI = os.getenv('MONGO_URI', '')
    DB_NAME = os.getenv('DB_NAME', 'mastermind_certificate_db')
    ALLOW_MOCK_DB = os.getenv('ALLOW_MOCK_DB', 'true').lower() in ('true', '1', 'yes')

    # Base URLs for dynamic QR codes and verification
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # Upload directories
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'templates')
    GENERATED_FOLDER = os.path.join(BASE_DIR, 'generated', 'certificates')
    
    # Allowed Extensions
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    ALLOWED_DATA_EXTENSIONS = {'csv', 'xlsx', 'xls'}

# Ensure required directories exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.GENERATED_FOLDER, exist_ok=True)
