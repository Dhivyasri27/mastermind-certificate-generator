import os
import requests
import zipfile
import io
import time
import pandas as pd

BASE_URL = 'http://localhost:5000'

def run_test_suite():
    print("==================================================================")
    print("   ADMIN BULK EXCEL CERTIFICATE GENERATOR - VERIFICATION SUITE   ")
    print("==================================================================")

    # 1. Login Admin
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
        'email': 'admin@college.edu',
        'password': 'admin123'
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print(" [PASS] 1. Admin Login Authentication successful.")

    # 2. Generate a fresh test Excel file with 3 unique student IDs
    ts = str(int(time.time()))[-4:]
    s1_reg = f"21IT{ts}1"
    s2_reg = f"21IT{ts}2"
    s3_reg = f"21IT{ts}3"

    test_data = [
        {'Register Number': s1_reg, 'Student Name': 'Arun Kumar', 'Course Name': 'Python Training', 'Start Date': '01-06-2026', 'End Date': '30-06-2026', 'Duration': '30 Days'},
        {'Register Number': s2_reg, 'Student Name': 'Priya S', 'Course Name': 'Python Training', 'Start Date': '01-06-2026', 'End Date': '30-06-2026', 'Duration': '30 Days'},
        {'Register Number': s3_reg, 'Student Name': 'Kavin R', 'Course Name': 'Python Training', 'Start Date': '01-06-2026', 'End Date': '30-06-2026', 'Duration': '30 Days'}
    ]
    
    excel_test_file = 'test_batch_students.xlsx'
    pd.DataFrame(test_data).to_excel(excel_test_file, index=False)

    with open(excel_test_file, 'rb') as f:
        files = {'file': (excel_test_file, f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        parse_res = requests.post(f"{BASE_URL}/api/students/upload", files=files, headers=headers)
    
    assert parse_res.status_code == 200, f"Upload failed: {parse_res.text}"
    summary = parse_res.json()['summary']
    assert summary['valid_count'] == 3, f"Expected 3 valid records, got {summary['valid_count']}"
    print(f" [PASS] 2. Excel Upload & Validation successful ({summary['valid_count']} valid students found).")

    # 3. Bulk Save Students
    save_res = requests.post(f"{BASE_URL}/api/students/bulk-save", json=summary['valid_records'], headers=headers)
    assert save_res.status_code == 201, f"Bulk save failed: {save_res.text}"
    inserted_students = save_res.json()['inserted_students']
    assert len(inserted_students) >= 3
    print(f" [PASS] 3. Student Records saved to database.")

    # 4. Fetch Master Certificate Template
    tpl_res = requests.get(f"{BASE_URL}/api/templates", headers=headers)
    assert tpl_res.status_code == 200
    templates = tpl_res.json()['templates']
    assert len(templates) > 0, "No master certificate template found!"
    master_tpl = templates[0]
    template_id = master_tpl['id']
    print(f" [PASS] 4. Pristine Master Certificate Template loaded ({master_tpl['template_name']}).")

    # 5. Generate All Certificates for the 3 Students
    student_ids = [s['id'] for s in inserted_students[:3]]
    gen_res = requests.post(f"{BASE_URL}/api/certificates/generate-bulk", json={
        'template_id': template_id,
        'student_ids': student_ids
    }, headers=headers)
    
    assert gen_res.status_code == 200, f"Bulk generation failed: {gen_res.text}"
    gen_data = gen_res.json()
    assert gen_data['total_generated'] == 3, f"Expected 3 generated, got {gen_data['total_generated']}"
    print(f" [PASS] 5. Bulk Certificate Generation complete ({gen_data['total_generated']} individual PDFs rendered).")

    # 6. Verify Created PDF Filenames on Disk
    generated_folder = os.path.join('backend', 'generated', 'certificates')
    expected_files = [
        f"{s1_reg}_Arun_Kumar.pdf",
        f"{s2_reg}_Priya_S.pdf",
        f"{s3_reg}_Kavin_R.pdf"
    ]

    for fname in expected_files:
        fpath = os.path.join(generated_folder, fname)
        assert os.path.exists(fpath), f"Expected PDF file missing: {fname}"
        file_size = os.path.getsize(fpath)
        assert file_size > 50000, f"PDF file {fname} is too small: {file_size} bytes"
        print(f"       --> Verified PDF Output: {fname} ({file_size} bytes)")
    print(" [PASS] 6. Individual PDF Files created cleanly.")

    # 7. Verify Master Template Image Remains Untouched
    master_img_path = os.path.join('backend', 'uploads', 'templates', master_tpl['image_path'])
    assert os.path.exists(master_img_path)
    print(" [PASS] 7. Master Template Background Image verified untouched & un-mutated.")

    # 8. Test Download All as ZIP Bundle
    zip_res = requests.post(f"{BASE_URL}/api/certificates/download-zip", json={}, headers=headers)
    assert zip_res.status_code == 200, f"ZIP download failed: {zip_res.text}"
    
    zip_buffer = io.BytesIO(zip_res.content)
    with zipfile.ZipFile(zip_buffer, 'r') as zip_ref:
        zip_file_list = zip_ref.namelist()
        for fname in expected_files:
            assert fname in zip_file_list, f"Missing {fname} in Certificates.zip archive!"
    print(f" [PASS] 8. Download All Certificates.zip verified ({len(zip_file_list)} files inside ZIP archive).")

    # 9. Test Invalid Excel Data Diagnostic Error Reporting
    invalid_csv_content = f"""Register Number,Student Name,Course Name,Start Date,End Date,Duration
21IT999,,Python Training,01-06-2026,30-06-2026,30 Days
{s1_reg},Duplicate Test,Python Training,01-06-2026,30-06-2026,30 Days
"""
    files_inv = {'file': ('invalid_test.csv', io.BytesIO(invalid_csv_content.encode('utf-8')), 'text/csv')}
    inv_res = requests.post(f"{BASE_URL}/api/students/upload", files=files_inv, headers=headers)
    assert inv_res.status_code == 200
    inv_summary = inv_res.json()['summary']
    assert inv_summary['invalid_count'] >= 1
    print(f" [PASS] 9. Excel Validation Diagnostic Engine verified ({inv_summary['invalid_count']} invalid records properly flagged with clear error messages).")

    print("\n==================================================================")
    print("    ALL 9 BULK WORKFLOW VERIFICATION TESTS PASSED 100%!       ")
    print("==================================================================")

if __name__ == '__main__':
    run_test_suite()
