import os
import re
from PIL import Image, ImageDraw, ImageFont
from config import Config

SCRIPT_FONT_PATH = os.path.join(Config.BASE_DIR, 'fonts', 'AlexBrush-Regular.ttf')

SYSTEM_FONT_PATHS = [
    SCRIPT_FONT_PATH,
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\arialbd.ttf",
    "C:\\Windows\\Fonts\\calibri.ttf",
    "C:\\Windows\\Fonts\\calibrib.ttf",
    "C:\\Windows\\Fonts\\times.ttf",
    "C:\\Windows\\Fonts\\timesbd.ttf",
    "C:\\Windows\\Fonts\\georgia.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
]

def load_font(font_family="Helvetica", font_size=24, font_weight="normal"):
    """Attempts to load best matching TrueType font or fallback to default."""
    size = max(10, int(font_size))
    is_bold = (font_weight.lower() == 'bold') or ('bold' in font_family.lower())

    # Script font matching for elegant student name
    if 'script' in font_family.lower() or 'alex' in font_family.lower() or 'brush' in font_family.lower() or font_family == 'AlexBrush':
        if os.path.exists(SCRIPT_FONT_PATH):
            try:
                return ImageFont.truetype(SCRIPT_FONT_PATH, size=size)
            except Exception:
                pass

    font_candidates = []
    if is_bold:
        font_candidates = [
            "C:\\Windows\\Fonts\\arialbd.ttf",
            "C:\\Windows\\Fonts\\calibrib.ttf",
            "C:\\Windows\\Fonts\\timesbd.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        ]
    else:
        font_candidates = [
            "C:\\Windows\\Fonts\\arial.ttf",
            "C:\\Windows\\Fonts\\calibri.ttf",
            "C:\\Windows\\Fonts\\times.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        ]

    for fp in font_candidates + SYSTEM_FONT_PATHS:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size=size)
            except Exception:
                pass

    try:
        return ImageFont.load_default(size=size)
    except Exception:
        return ImageFont.load_default()

def format_date_str(d_str):
    """Normalizes dates to DD.MM.YYYY format."""
    if not d_str:
        return ''
    s = str(d_str).strip()
    if s.lower() in ('none', 'null', 'nan', 'undefined', ''):
        return ''
    # YYYY-MM-DD or YYYY.MM.DD
    m_iso = re.match(r'^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$', s)
    if m_iso:
        yyyy, mm, dd = m_iso.groups()
        return f"{int(dd):02d}.{int(mm):02d}.{yyyy}"
    # DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
    m_dmy = re.match(r'^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$', s)
    if m_dmy:
        dd, mm, yyyy = m_dmy.groups()
        return f"{int(dd):02d}.{int(mm):02d}.{yyyy}"
    return s

def format_duration_str(dur_str):
    """Formats duration consistently without undefined or duplicate units."""
    if not dur_str:
        return ''
    s = str(dur_str).strip()
    if s.lower() in ('none', 'null', 'nan', 'undefined', ''):
        return ''
    # Pure numbers: e.g. "100" -> "100 Hrs."
    if s.isdigit():
        return f"{s} Hrs."
    # E.g. "100 Hrs", "100 hrs", "100 hours" -> "100 Hrs."
    m_hrs = re.match(r'^(\d+)\s*(?:hrs?|hours?)\.?$', s, re.IGNORECASE)
    if m_hrs:
        return f"{m_hrs.group(1)} Hrs."
    # E.g. "30 Days", "30 days" -> "30 Days"
    m_days = re.match(r'^(\d+)\s*days?\.?$', s, re.IGNORECASE)
    if m_days:
        return f"{m_days.group(1)} Days"
    return s

def build_conducted_text(start_date, end_date, duration):
    """
    Constructs the line: 'Conducted from [start date] to [end date] ([duration] Hrs.)'
    Handles missing or partial values gracefully without crashing or showing undefined/NaN.
    """
    s_dt = format_date_str(start_date)
    e_dt = format_date_str(end_date)
    d_dur = format_duration_str(duration)

    if s_dt and e_dt:
        base = f"Conducted from {s_dt} to {e_dt}"
        if d_dur:
            return f"{base} ({d_dur})"
        return base
    elif s_dt:
        base = f"Conducted from {s_dt}"
        if d_dur:
            return f"{base} ({d_dur})"
        return base
    elif e_dt:
        base = f"Completed on {e_dt}"
        if d_dur:
            return f"{base} ({d_dur})"
        return base
    elif d_dur:
        return f"Duration: {d_dur}"
    return ""

def render_certificate_image(template_image_path, student_data, field_configurations=None, verification_url=None):
    """
    Dynamically renders student name, course name, and conducted duration/dates into
    the exact positions on the blank Mastermind Techno Solution & Krishnaa Institute certificate.

    Preserves all static graphics, branding, borders, signatures, logos, seals, and QR code intact.
    Applies auto-scaling and controlled line management to prevent overlapping or clipping.
    """
    if not os.path.exists(template_image_path):
        # Fallback to standard template location if path mismatch
        fallback_path = os.path.join(Config.UPLOAD_FOLDER, 'mastermind_certificate_template.png')
        if os.path.exists(fallback_path):
            template_image_path = fallback_path
        else:
            raise FileNotFoundError(f"Certificate template image not found: {template_image_path}")

    with Image.open(template_image_path) as base_img:
        img = base_img.convert('RGBA')
        width, height = img.size
        scale = width / 1588.0

        draw = ImageDraw.Draw(img)

        # 1. Extract and sanitize dynamic values
        name = str(student_data.get('name', '') or '').strip()
        course_raw = str(student_data.get('course_name', '') or '').strip()
        course_name = course_raw.upper()
        
        start_date = student_data.get('start_date') or student_data.get('date') or ''
        end_date = student_data.get('end_date') or ''
        duration = student_data.get('duration') or ''
        conducted_text = build_conducted_text(start_date, end_date, duration)

        # 2. Baseline coordinates (centered at X: 59.50% / 945px on 1588x2048 canvas)
        field_configs = {}
        if field_configurations and isinstance(field_configurations, list):
            for fc in field_configurations:
                k = fc.get('field_key') or fc.get('name')
                if k:
                    field_configs[k] = fc

        # -------------------------------------------------------------------------
        # A. STUDENT NAME
        # Placed on the horizontal line beneath 'This is to Certify that'
        # Elegant royal blue script font (#0e3a8c), centered horizontally
        # -------------------------------------------------------------------------
        if name:
            cfg = field_configs.get('student_name', {})
            x_pct = float(cfg.get('x', 59.50))
            y_pct = float(cfg.get('y', 46.80))
            pos_x = (x_pct / 100.0) * width
            pos_y = (y_pct / 100.0) * height

            color = cfg.get('color') or '#0e3a8c'
            font_size = int(cfg.get('font_size', 76) * scale)
            max_name_width = int(780 * scale)

            # Auto-scale font size if name is long
            font = load_font("AlexBrush", font_size, "normal")
            bbox = draw.textbbox((0, 0), name, font=font)
            text_width = bbox[2] - bbox[0]
            if text_width > max_name_width:
                scaled_size = max(int(36 * scale), int(font_size * (max_name_width / float(text_width))))
                font = load_font("AlexBrush", scaled_size, "normal")
                bbox = draw.textbbox((0, 0), name, font=font)
                text_width = bbox[2] - bbox[0]

            text_height = bbox[3] - bbox[1]
            start_x = pos_x - (text_width / 2.0)
            start_y = pos_y - (text_height / 2.0)
            draw.text((start_x, start_y), name, font=font, fill=color)

        # -------------------------------------------------------------------------
        # B. COURSE NAME
        # Placed after 'has successfully completed the Certificate Course on'
        # Bold uppercase text (#0f172a), centered horizontally with adequate spacing
        # -------------------------------------------------------------------------
        if course_name:
            cfg = field_configs.get('course_name', {})
            x_pct = float(cfg.get('x', 59.50))
            y_pct = float(cfg.get('y', 57.60))
            pos_x = (x_pct / 100.0) * width
            pos_y = (y_pct / 100.0) * height

            color = cfg.get('color') or '#0f172a'
            font_size = int(cfg.get('font_size', 32) * scale)
            max_course_width = int(920 * scale)

            font = load_font("Helvetica-Bold", font_size, "bold")
            bbox = draw.textbbox((0, 0), course_name, font=font)
            text_width = bbox[2] - bbox[0]

            # If course name is moderately long, scale font size
            if text_width > max_course_width:
                new_size = int(font_size * (max_course_width / float(text_width)))
                if new_size >= int(20 * scale):
                    font = load_font("Helvetica-Bold", new_size, "bold")
                    bbox = draw.textbbox((0, 0), course_name, font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]
                    start_x = pos_x - (text_width / 2.0)
                    start_y = pos_y - (text_height / 2.0)
                    draw.text((start_x, start_y), course_name, font=font, fill=color)
                else:
                    # If exceptionally long, wrap into 2 lines
                    words = course_name.split()
                    mid = len(words) // 2
                    line1 = " ".join(words[:mid])
                    line2 = " ".join(words[mid:])
                    wrap_font = load_font("Helvetica-Bold", int(22 * scale), "bold")
                    b1 = draw.textbbox((0, 0), line1, font=wrap_font)
                    b2 = draw.textbbox((0, 0), line2, font=wrap_font)
                    w1 = b1[2] - b1[0]
                    w2 = b2[2] - b2[0]
                    line_gap = int(16 * scale)
                    draw.text((pos_x - (w1 / 2.0), pos_y - line_gap), line1, font=wrap_font, fill=color)
                    draw.text((pos_x - (w2 / 2.0), pos_y + 2), line2, font=wrap_font, fill=color)
            else:
                text_height = bbox[3] - bbox[1]
                start_x = pos_x - (text_width / 2.0)
                start_y = pos_y - (text_height / 2.0)
                draw.text((start_x, start_y), course_name, font=font, fill=color)

        # -------------------------------------------------------------------------
        # C. COURSE DURATION AND DATES
        # Placed in the original line position: 'Conducted from [start] to [end] ([dur] Hrs.)'
        # Consistent styling (#1e293b), centered horizontally
        # -------------------------------------------------------------------------
        if conducted_text:
            cfg = (
                field_configs.get('course_duration')
                or field_configs.get('conducted_dates')
                or field_configs.get('duration')
                or field_configs.get('start_date')
                or {}
            )
            x_pct = float(cfg.get('x', 59.50))
            y_pct = float(cfg.get('y', 60.55))
            pos_x = (x_pct / 100.0) * width
            pos_y = (y_pct / 100.0) * height

            color = cfg.get('color') or '#1e293b'
            font_size = int(cfg.get('font_size', 24) * scale)
            max_dates_width = int(920 * scale)

            font = load_font("Helvetica", font_size, "normal")
            bbox = draw.textbbox((0, 0), conducted_text, font=font)
            text_width = bbox[2] - bbox[0]
            if text_width > max_dates_width:
                scaled_size = max(int(16 * scale), int(font_size * (max_dates_width / float(text_width))))
                font = load_font("Helvetica", scaled_size, "normal")
                bbox = draw.textbbox((0, 0), conducted_text, font=font)
                text_width = bbox[2] - bbox[0]

            text_height = bbox[3] - bbox[1]
            start_x = pos_x - (text_width / 2.0)
            start_y = pos_y - (text_height / 2.0)
            draw.text((start_x, start_y), conducted_text, font=font, fill=color)

        # Note: Static branding, seals, signatures, and QR code are preserved
        # directly from the template and are untouched.

        return img.convert('RGB')

def generate_certificate_pdf(template_image_path, student_data, field_configurations, cert_id, output_pdf_filename):
    """
    Generates high-resolution PDF file for a given student and template.
    Preserves 100% crisp resolution at 300 DPI without compression artifacts.
    """
    verification_url = f"{Config.FRONTEND_URL}/verify/{cert_id}"
    rendered_img = render_certificate_image(
        template_image_path=template_image_path,
        student_data=student_data,
        field_configurations=field_configurations,
        verification_url=verification_url
    )

    output_path = os.path.join(Config.GENERATED_FOLDER, output_pdf_filename)
    rendered_img.save(output_path, "PDF", resolution=300.0, quality=100)
    return output_path
