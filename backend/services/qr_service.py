import qrcode
from io import BytesIO
from PIL import Image

def generate_qr_code_image(verification_url, size=150):
    """Generates a PIL Image QR code for the given verification URL."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert('RGBA')
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    return img
