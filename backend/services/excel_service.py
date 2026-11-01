import csv
import io
import os
import re
from models.student import find_student_by_reg_no

def normalize_key(k):
    if not k:
        return ''
    s = str(k).strip().lower()
    s = re.sub(r'[\s_\-\.\:]+', '_', s)
    return s.strip('_')

# Flexible column aliases mapping
COLUMN_ALIASES = {
    'register_number': ['register_number', 'register_no', 'register_num', 'reg_no', 'reg_number', 'reg_num', 'registration_number', 'roll_no', 'roll_number', 'reg_id'],
    'student_name': ['student_name', 'name', 'student', 'full_name', 'student_full_name', 'candidate_name'],
    'course_name': ['course_name', 'course', 'course_title', 'training', 'training_program', 'event', 'program'],
    'start_date': ['start_date', 'from_date', 'startdate', 'fromdate', 'start_dt', 'from_dt'],
    'end_date': ['end_date', 'to_date', 'enddate', 'todate', 'end_dt', 'to_dt'],
    'duration': ['duration', 'days', 'hours', 'course_duration', 'period'],
    'department': ['department', 'dept', 'branch', 'stream'],
    'college_name': ['college_name', 'college', 'institution', 'institution_name'],
    'certificate_type': ['certificate_type', 'cert_type', 'type']
}

def extract_value_by_alias(row_dict, target_field):
    aliases = COLUMN_ALIASES.get(target_field, [target_field])
    for norm_k, raw_val in row_dict.items():
        if norm_k in aliases:
            if raw_val is not None and not (isinstance(raw_val, float) and str(raw_val) == 'nan'):
                val_str = str(raw_val).strip()
                if val_str:
                    return val_str
    return ''

def parse_student_file(file_path_or_stream, filename):
    """
    Parses CSV or XLSX file containing student details.
    Flexible matching for columns: Register Number, Student Name, Course Name, Start Date, End Date, Duration.
    Returns preview summary with valid records, invalid records, and duplicate register numbers.
    """
    ext = os.path.splitext(filename)[1].lower()
    raw_rows = []

    try:
        if ext in ['.xlsx', '.xls']:
            import pandas as pd
            df = pd.read_excel(file_path_or_stream)
            raw_rows = df.to_dict(orient='records')
        else:
            # Assume CSV
            if isinstance(file_path_or_stream, str):
                with open(file_path_or_stream, mode='r', encoding='utf-8-sig') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        raw_rows.append(row)
            else:
                stream = io.StringIO(file_path_or_stream.read().decode('utf-8-sig', errors='ignore'))
                reader = csv.DictReader(stream)
                for row in reader:
                    raw_rows.append(row)
    except Exception as e:
        raise ValueError(f"Failed to read Excel/CSV file: {str(e)}")

    valid_records = []
    invalid_records = []
    duplicate_reg_nos = set()
    seen_in_file = set()

    for idx, raw in enumerate(raw_rows, start=1):
        if not raw:
            continue

        # Normalize raw dictionary keys
        norm_row = {normalize_key(k): v for k, v in raw.items() if k is not None}

        # Ignore completely empty rows
        all_vals = "".join(str(v).strip() for v in norm_row.values() if v is not None)
        if not all_vals or all_vals == 'nan':
            continue

        # Extract values using aliases
        name = extract_value_by_alias(norm_row, 'student_name')
        reg_no = extract_value_by_alias(norm_row, 'register_number')
        course = extract_value_by_alias(norm_row, 'course_name')
        start_date = extract_value_by_alias(norm_row, 'start_date')
        end_date = extract_value_by_alias(norm_row, 'end_date')
        duration = extract_value_by_alias(norm_row, 'duration')
        
        dept = extract_value_by_alias(norm_row, 'department') or 'Information Technology'
        college = extract_value_by_alias(norm_row, 'college_name') or 'Krishnaa Institute of Skill Development & Entrepreneurship'
        cert_type = extract_value_by_alias(norm_row, 'certificate_type') or 'Completion'
        issue_date = end_date if end_date else '27.04.2025'

        errors = []
        if not name:
            errors.append(f"Row {idx}: Student Name is missing.")
        if not reg_no:
            errors.append(f"Row {idx}: Register Number is missing.")
        if not course:
            errors.append(f"Row {idx}: Course Name is missing.")
        if not start_date:
            errors.append(f"Row {idx}: Start Date is missing.")
        if not end_date:
            errors.append(f"Row {idx}: End Date is missing.")
        if not duration:
            errors.append(f"Row {idx}: Duration is missing.")

        # Check duplicates
        if reg_no:
            if reg_no in seen_in_file:
                errors.append(f"Row {idx}: Duplicate Register Number '{reg_no}' in uploaded file.")
                duplicate_reg_nos.add(reg_no)
            else:
                seen_in_file.add(reg_no)

            db_student = find_student_by_reg_no(reg_no)
            if db_student:
                errors.append(f"Row {idx}: Register Number '{reg_no}' already exists in database.")
                duplicate_reg_nos.add(reg_no)

        record = {
            'row_index': idx,
            'name': name,
            'register_number': reg_no,
            'department': dept,
            'college_name': college,
            'course_name': course,
            'start_date': start_date,
            'end_date': end_date,
            'duration': duration,
            'certificate_type': cert_type,
            'date': issue_date,
            'is_valid': len(errors) == 0,
            'errors': errors
        }

        if len(errors) == 0:
            valid_records.append(record)
        else:
            invalid_records.append(record)

    return {
        'total_records': len(valid_records) + len(invalid_records),
        'valid_count': len(valid_records),
        'invalid_count': len(invalid_records),
        'duplicate_count': len(duplicate_reg_nos),
        'duplicate_reg_numbers': list(duplicate_reg_nos),
        'valid_records': valid_records,
        'invalid_records': invalid_records
    }
