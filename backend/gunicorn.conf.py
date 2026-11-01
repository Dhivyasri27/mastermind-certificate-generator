import os

# Automatically bind to Render's assigned PORT or fallback to 5000
port = os.getenv('PORT', '5000')
bind = f"0.0.0.0:{port}"

# Concurrency & Performance
workers = int(os.getenv('WEB_CONCURRENCY', '2'))
threads = int(os.getenv('PYTHON_THREADS', '4'))
timeout = 120  # Extended timeout for 300 DPI PDF rendering and bulk ZIP bundling
keepalive = 5

# Logging to standard output/error for Render log stream
accesslog = '-'
errorlog = '-'
loglevel = 'info'
