import os
import shutil
from PIL import Image
from models.admin import create_admin, find_admin_by_email
from models.template import create_template, list_templates, default_field_positions, get_template_collection
from config import Config

def seed_database():
    print("--> Seeding database with Pristine Master Certificate Template...")
    
    # 1. Admin Account
    admin_email = "admin@college.edu"
    if not find_admin_by_email(admin_email):
        create_admin(admin_email, "admin123", name="Chief Administrator")
        print(f"  [OK] Admin created: {admin_email} / admin123")

    # 2. Master Template Image Integrity Verification
    tpl_filename = "mastermind_certificate_template.png"
    filepath = os.path.join(Config.UPLOAD_FOLDER, tpl_filename)
    frontend_pub = os.path.join(Config.BASE_DIR, '..', 'frontend', 'public', tpl_filename)
    frontend_dist = os.path.join(Config.BASE_DIR, '..', 'frontend', 'dist', tpl_filename)

    # User uploaded template path (for initial generation if file is missing)
    user_uploaded_path = r'C:\Users\DHIVYASRI V\.gemini\antigravity-ide\brain\4ae82695-8603-4a64-9bb0-3ad9dad29e9c\.user_uploaded\media_1791549552061.jpg'

    if not os.path.exists(filepath):
        if os.path.exists(user_uploaded_path):
            try:
                with Image.open(user_uploaded_path) as uimg:
                    hires_img = uimg.convert('RGB').resize((1588, 2048), Image.Resampling.LANCZOS)
                    hires_img.save(filepath, 'PNG', optimize=True)
                    if os.path.exists(os.path.dirname(frontend_pub)):
                        hires_img.save(frontend_pub, 'PNG', optimize=True)
                    print("  [OK] Converted and created master certificate template (1588x2048).")
            except Exception as e:
                print(f"  [WARN] Could not convert uploaded image: {e}")
        elif os.path.exists(frontend_pub):
            shutil.copy2(frontend_pub, filepath)
    elif os.path.exists(filepath) and not os.path.exists(frontend_pub):
        if os.path.exists(os.path.dirname(frontend_pub)):
            shutil.copy2(filepath, frontend_pub)

    # 3. Seed / Update Master Template Record
    existing_templates = list_templates()
    
    if not existing_templates:
        create_template({
            'template_name': 'Mastermind Techno Solution & Krishnaa Institute Master Template',
            'certificate_type': 'Completion',
            'image_path': tpl_filename,
            'width': 1588,
            'height': 2048,
            'fields': default_field_positions(),
            'is_active': True
        })
        print("  [OK] Master Certificate Template seeded with pristine baseline coordinates.")
    else:
        get_template_collection().update_many({}, {
            '$set': {
                'fields': default_field_positions(),
                'image_path': tpl_filename,
                'width': 1588,
                'height': 2048,
                'is_active': True
            }
        })
        print("  [OK] Updated all templates to new pristine master template & baseline coordinates.")

if __name__ == '__main__':
    seed_database()
