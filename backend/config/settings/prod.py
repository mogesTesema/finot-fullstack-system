from .base import *

DEBUG = False

# Ensure SECRET_KEY is set in prod securely
if SECRET_KEY == "unsafe-dev-fallback-key":
    raise ValueError("SECRET_KEY must be set in production.")

# Strict security settings for Production
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# We use whitenoise in prod for static assets
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Legacy settings required by django-cloudinary-storage which hasn't fully updated to Django 5.1
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Real Email Setup
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Safe host parsing list
allowed_hosts_from_env = os.environ.get("ALLOWED_HOSTS", "")
allowed_host_list = [h.strip() for h in allowed_hosts_from_env.split(",") if h.strip()]
if PUBLIC_DOMAIN:
    allowed_host_list.append(PUBLIC_DOMAIN.replace("https://", "").replace("http://", ""))
allowed_host_list.append(".onrender.com")
ALLOWED_HOSTS = list(set(allowed_host_list))

# Prod CORS
cors_origins_from_env = os.environ.get("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_origins_from_env.split(",") if o.strip()]
if FRONTEND_URL and FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)
if not CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS = ["https://finot.onrender.com"]

# Prod CSRF
csrf_origins_from_env = os.environ.get("CSRF_TRUSTED_ORIGINS", "")
CSRF_TRUSTED_ORIGINS = [o.strip() for o in csrf_origins_from_env.split(",") if o.strip()]
if FRONTEND_URL and FRONTEND_URL not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)
if not CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS = []

WHITENOISE_MANIFEST_STRICT = False

