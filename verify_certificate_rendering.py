import os
import sys

# Ensure backend directory is in path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.insert(0, BASE_DIR)

from services.certificate_generator import (
    render_certificate_image,
    generate_certificate_pdf,
    format_date_str,
    format_duration_str,
    build_conducted_text
)
from models.template import default_field_positions
from config import Config

def test_rendering():
    print("=" * 70)
    print("     TESTING MASTER CERTIFICATE RENDERING ENGINE")
    print("=" * 70)

    tpl_path = os.path.join(Config.UPLOAD_FOLDER, 'mastermind_certificate_template.png')
    assert os.path.exists(tpl_path), f"Template not found at {tpl_path}"
    print(f"[OK] Master template confirmed exists: {tpl_path}")

    field_configs = default_field_positions()

    # 1. Date & Duration helper unit tests
    print("\n--- 1. Testing Date & Duration Text Formatting ---")
    assert format_date_str("2025-04-07") == "07.04.2025"
    assert format_date_str("01-06-2026") == "01.06.2026"
    assert format_date_str("07.04.2025") == "07.04.2025"
    assert format_date_str("none") == ""
    assert format_date_str(None) == ""

    assert format_duration_str("100") == "100 Hrs."
    assert format_duration_str("100 Hrs") == "100 Hrs."
    assert format_duration_str("100 hours") == "100 Hrs."
    assert format_duration_str("30 Days") == "30 Days"
    assert format_duration_str(None) == ""

    txt1 = build_conducted_text("2025-04-07", "2025-04-27", "100 Hrs")
    assert txt1 == "Conducted from 07.04.2025 to 27.04.2025 (100 Hrs.)", f"Got: {txt1}"
    print(f"  [PASS] Standard text: '{txt1}'")

    txt2 = build_conducted_text("01-06-2026", "30-06-2026", "30 Days")
    assert txt2 == "Conducted from 01.06.2026 to 30.06.2026 (30 Days)", f"Got: {txt2}"
    print(f"  [PASS] Alternative text: '{txt2}'")

    txt3 = build_conducted_text(None, None, None)
    assert txt3 == ""
    print("  [PASS] None/empty handled gracefully with zero NaN/undefined")

    # 2. Test Case 1: Short name and short course title
    print("\n--- 2. Test Case 1: Short Name & Course Title ---")
    student_short = {
        'name': 'Arun K',
        'course_name': 'Python',
        'start_date': '07.04.2025',
        'end_date': '27.04.2025',
        'duration': '100 Hrs'
    }
    img_short = render_certificate_image(tpl_path, student_short, field_configs)
    assert img_short.size == (1588, 2048)
    pdf_short = generate_certificate_pdf(tpl_path, student_short, field_configs, "CERT-TEST-001", "test_cert_short.pdf")
    assert os.path.exists(pdf_short) and os.path.getsize(pdf_short) > 50000
    print(f"  [PASS] Short student certificate generated ({os.path.getsize(pdf_short)} bytes)")

    # 3. Test Case 2: Long name and long course title (auto-scaling test)
    print("\n--- 3. Test Case 2: Long Name & Multi-word Long Course Title ---")
    student_long = {
        'name': 'Dr. Venkatasubramanian Ramakrishnan Sundaramurthy',
        'course_name': 'ADVANCED ARTIFICIAL INTELLIGENCE, MACHINE LEARNING AND DEEP LEARNING WITH CLOUD COMPUTING ARCHITECTURE',
        'start_date': '2025-01-10',
        'end_date': '2025-06-30',
        'duration': '120 Hours'
    }
    img_long = render_certificate_image(tpl_path, student_long, field_configs)
    assert img_long.size == (1588, 2048)
    pdf_long = generate_certificate_pdf(tpl_path, student_long, field_configs, "CERT-TEST-002", "test_cert_long.pdf")
    assert os.path.exists(pdf_long) and os.path.getsize(pdf_long) > 50000
    print(f"  [PASS] Long student certificate with auto-scaled font generated ({os.path.getsize(pdf_long)} bytes)")

    # 4. Test Case 3: Different start dates, end dates, and course durations
    print("\n--- 4. Test Case 3: Different Dates and Durations ---")
    student_dates = {
        'name': 'Kavitha M',
        'course_name': 'FULL STACK WEB DEVELOPMENT',
        'start_date': '15/08/2025',
        'end_date': '15/10/2025',
        'duration': '60 Days'
    }
    pdf_dates = generate_certificate_pdf(tpl_path, student_dates, field_configs, "CERT-TEST-003", "test_cert_dates.pdf")
    assert os.path.exists(pdf_dates) and os.path.getsize(pdf_dates) > 50000
    print(f"  [PASS] Custom dates & 60 Days duration generated ({os.path.getsize(pdf_dates)} bytes)")

    # 5. Test Case 4: Missing or invalid student details (robustness test)
    print("\n--- 5. Test Case 4: Missing / Invalid Details Graceful Handling ---")
    student_missing = {
        'name': '',
        'course_name': None,
        'start_date': 'undefined',
        'end_date': 'null',
        'duration': 'NaN'
    }
    img_missing = render_certificate_image(tpl_path, student_missing, field_configs)
    assert img_missing.size == (1588, 2048)
    pdf_missing = generate_certificate_pdf(tpl_path, student_missing, field_configs, "CERT-TEST-004", "test_cert_missing.pdf")
    assert os.path.exists(pdf_missing) and os.path.getsize(pdf_missing) > 50000
    print(f"  [PASS] Missing details handled with zero crashes ({os.path.getsize(pdf_missing)} bytes)")

    # 6. Test Case 5: Multiple certificate generations in succession
    print("\n--- 6. Test Case 5: Successive Batch Generation for Multiple Students ---")
    batch = [
        {'name': 'Student One', 'course_name': 'DATA SCIENCE WITH PYTHON', 'start_date': '2025-04-01', 'end_date': '2025-04-20', 'duration': '80 Hrs'},
        {'name': 'Student Two', 'course_name': 'CYBER SECURITY & ETHICAL HACKING', 'start_date': '2025-05-01', 'end_date': '2025-05-25', 'duration': '90 Hrs'},
        {'name': 'Student Three', 'course_name': 'CLOUD DEVOPS ENGINEERING', 'start_date': '2025-06-01', 'end_date': '2025-06-30', 'duration': '100 Hrs'}
    ]
    for idx, s in enumerate(batch, 1):
        p = generate_certificate_pdf(tpl_path, s, field_configs, f"CERT-SEQ-{idx}", f"test_cert_seq_{idx}.pdf")
        assert os.path.exists(p)
        print(f"  [PASS] Successive student {idx} ({s['name']}) -> {os.path.basename(p)}")

    print("\n" + "=" * 70)
    print("     ALL 6 CERTIFICATE RENDERING ENGINE TESTS PASSED 100%!")
    print("=" * 70)

if __name__ == '__main__':
    test_rendering()
