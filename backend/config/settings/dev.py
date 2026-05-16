from .base import *

DEBUG = True

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Legacy settings required by django-cloudinary-storage which hasn't fully updated to Django 5.1
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# Console email backend for local development (doesn't send real emails)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Allowed hosts for local
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Explicit CORS for local frontend execution
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5176",
    "http://localhost:8000",
]

# Explicit CSRF for local
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5176",
    "http://localhost:8000",
]