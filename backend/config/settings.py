from pathlib import Path
import dj_database_url
import os
from dotenv import load_dotenv
from datetime import timedelta

from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from django.templatetags.static import static

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / "finot.env")


SECRET_KEY = os.environ.get("SECRET_KEY", None)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "t")


# Application definition

INSTALLED_APPS = [
    "unfold",  # Must be before django.contrib.admin
    "unfold.contrib.filters",  # Enhanced filter widgets
    "unfold.contrib.forms",  # Enhanced form elements
    "unfold.contrib.inlines",  # Enhanced inline support
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "cloudinary_storage",
    "django.contrib.staticfiles",
    "whitenoise.runserver_nostatic",
    "cloudinary",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "djoser",
    "drf_spectacular",
    "core",
    "student",
    "service",
    "donation",
    "questionanswer",
    "notifications",
    "course",
    "analytics",
    "resources",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases


DATABASES = {
    "default": dj_database_url.parse(
        os.environ.get("DATABASE_URL", "sqlite:///db.sqlite3"),
        conn_max_age=700,
    )
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

SITE_ID = 1

REST_USE_JWT = True
REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_COOKIE": "finot-auth",
    "JWT_AUTH_REFRESH_COOKIE": "finot-refresh-token",
}

AUTHENTICATION_BACKENDS = [
    "core.backends.EmailAuthenticationBackend",
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# CORS — driven by environment, with dev fallbacks only in DEBUG mode
cors_origins_from_env = os.environ.get("CORS_ALLOWED_ORIGINS", "")
cors_origin_list = [
    origin.strip() for origin in cors_origins_from_env.split(",") if origin.strip()
]
if DEBUG:
    cors_origin_list += [
        "http://localhost:5173",
        "http://localhost:5176",
        "http://localhost:8000",
    ]
CORS_ALLOWED_ORIGINS = list(set(cors_origin_list)) or [
    "https://finot.vercel.app",
    "https://finot.onrender.com",
]

csrf_origins_from_env = os.environ.get("CSRF_TRUSTED_ORIGINS", "")
csrf_origin_list = [
    origin.strip() for origin in csrf_origins_from_env.split(",") if origin.strip()
]
if DEBUG:
    csrf_origin_list += [
        "http://localhost:5173",
        "http://localhost:5176",
        "http://localhost:8000",
    ]
CSRF_TRUSTED_ORIGINS = list(set(csrf_origin_list)) or ["https://finot.vercel.app"]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
if not DEBUG:
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "core.User"


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # --- Throttling (Rate Limiting) ---
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {

        "anon": "30/minute",
        "user": "42/minute",

    },
    # --- Pagination ---
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}


DOMAIN = "https://finot.onrender.com"
SITE_NAME = "Finot"


DJOSER = {
    "PASSWORD_RESET_CONFIRM_URL": "password-reset/confirm/{uid}/{token}",
    "LOGIN_FIELD": "email",
    "USER_CREATE_PASSWORD_RETYPE": False,
    "SERIALIZERS": {
        "user_create": "core.serializers.UserCreateSerializer",
        "user": "core.serializers.UserSerializer",
        "current_user": "core.serializers.UserSerializer",
    },
    "PERMISSIONS": {
        "user": ["core.permissions.IsAuthenticatedAndReadOnly"],
        "user_list": ["djoser.permissions.CurrentUserOrAdminOrReadOnly"],
        "user_delete": ["rest_framework.permissions.IsAdminUser"],
    },
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("JWT",),
}


SPECTACULAR_SETTINGS = {
    "TITLE": "Finto API Docs",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "APPEND_COMPONENTS": {
        "securitySchemes": {
            "jwtAuth": {
                "type": "apiKey",
                "in": "header",
                "name": "Authorization",
                "description": "Token format: JWT <your_token>",
            }
        }
    },
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": True,
    },
    "SECURITY": [
        {"jwtAuth": []},
    ],
}

# Cloudinary Storage Configuration
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": os.environ.get("CLOUDINARY_API_KEY"),
    "API_SECRET": os.environ.get("CLOUDINARY_API_SECRET"),
}

MEDIA_URL = "/media/"
# DEFAULT_FILE_STORAGE is deprecated in Django 4.2+ and removed in Django 5.1
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Date and Timezone (Already set above, ensuring order)
# LANGUAGE_CODE = 'en-us' # These are higher up usually

# --- Email Configuration (Gmail SMTP) ---
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.environ.get("EMAIL_HOST_USER")


PUBLIC_DOMAIN = os.environ.get("PUBLIC_DOMAIN", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")

RETURN_URL = f"{FRONTEND_URL}/donation/success"
CALLBACK_URL = f"{PUBLIC_DOMAIN}/api/donations/verify/"

# Derive ALLOWED_HOSTS from environment and PUBLIC_DOMAIN (include Render wildcard)
allowed_hosts_from_env = os.environ.get("ALLOWED_HOSTS", "")
allowed_host_list = [
    host.strip() for host in allowed_hosts_from_env.split(",") if host.strip()
]
if PUBLIC_DOMAIN:
    domain_without_scheme = PUBLIC_DOMAIN.replace("https://", "").replace("http://", "")
    allowed_host_list.append(domain_without_scheme)
# include generic Render wildcard domain
allowed_host_list.append(".onrender.com")
allowed_host_list.append("localhost")
allowed_host_list.append("127.0.0.1")
allowed_host_list.append("finot.vercel.app")
ALLOWED_HOSTS = list(set(allowed_host_list))  # Remove duplicates


SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": [
            "profile",
            "email",
        ],
        "AUTH_PARAMS": {
            "access_type": "online",
        },
        "OAUTH_PKCE_ENABLED": True,  # Recommended for modern security
    }
}

# =============================================================================
# DJANGO UNFOLD — Admin Panel Configuration
# Extracted to config/unfold_config.py to keep settings.py focused and clean.
# =============================================================================
from config.unfold_config import UNFOLD  # noqa: F401, E402

