import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.insert(0, BASE_DIR)

from services.certificate_generator import render_certificate_image
from models.template import default_field_positions
from config import Config

tpl_path = os.path.join(Config.UPLOAD_FOLDER, 'mastermind_certificate_template.png')
field_configs = default_field_positions()

# Short
student_short = {
    'name': 'Arun Kumar',
    'course_name': 'ARTIFICIAL INTELLIGENCE WITH PYTHON',
    'start_date': '2025-04-07',
    'end_date': '2025-04-27',
    'duration': '100 Hrs'
}
im_short = render_certificate_image(tpl_path, student_short, field_configs)
im_short.save(os.path.join(Config.GENERATED_FOLDER, 'test_visual_arun_kumar.png'), 'PNG')

# Long
student_long = {
    'name': 'Dr. Venkatasubramanian Ramakrishnan',
    'course_name': 'ADVANCED ARTIFICIAL INTELLIGENCE, MACHINE LEARNING AND DEEP LEARNING WITH CLOUD COMPUTING',
    'start_date': '2025-01-10',
    'end_date': '2025-06-30',
    'duration': '120 Hours'
}
im_long = render_certificate_image(tpl_path, student_long, field_configs)
im_long.save(os.path.join(Config.GENERATED_FOLDER, 'test_visual_long_name.png'), 'PNG')
print("Saved visual test images!")
