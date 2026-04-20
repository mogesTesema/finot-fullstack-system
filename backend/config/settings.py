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
        os.environ.get("DATABASE_URL", None),
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
        "anon": "5/minute",
        "user": "12/minute",
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
# =============================================================================

UNFOLD = {
    "SITE_TITLE": "Finot Admin",
    "SITE_HEADER": "Finot",
    "SITE_SUBHEADER": "Spiritual Management System",
    "SITE_URL": "/",
    "SITE_SYMBOL": "church",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "SHOW_BACK_BUTTON": True,
    "BORDER_RADIUS": "8px",
    # Environment badge in the header
    "ENVIRONMENT": "core.dashboard.environment_callback",
    # Dashboard callback for stat cards and chart data
    "DASHBOARD_CALLBACK": "core.dashboard.dashboard_callback",
    # Force light theme for Finot SaaS style
    "THEME": "light",
    "STYLES": [
        lambda request: static("css/custom_admin.css"),
    ],
    # Color theming — Finot UI: Primary Blue, Accent Yellow, Neutral White/Light Gray
    "COLORS": {
        "base": {
            # Backgrounds & Neutrals: Light Grays and Whites
            "50": "252 252 253",  # Very light gray/white (page background)
            "100": "245 247 250",  # Soft off-white (card backgrounds, sidebar)
            "200": "235 238 245",  # Borders and subtle backgrounds
            "300": "220 225 235",  # Stronger borders, disabled states
            "400": "180 190 205",  # Subtle text
            "500": "130 145 165",  # Muted text
            "600": "100 115 135",  # Secondary text
            "700": "70 85 105",  # Default text
            "800": "40 55 75",  # Darker text (headings)
            "900": "20 30 50",  # Important text, almost black
            "950": "10 15 25",  # Blackest
        },
        "primary": {
            # Primary Brand: Finot Blue (modern SaaS style)
            "50": "235 245 255",
            "100": "215 235 255",
            "200": "175 215 255",
            "300": "125 185 255",
            "400": "85 155 255",
            "500": "45 120 255",  # Main Primary Blue #2D78FF
            "600": "30 95 230",  # Focus/Hover Primary
            "700": "20 75 195",
            "800": "15 60 160",
            "900": "10 45 125",
            "950": "5 30 85",
        },
        "font": {
            "subtle-light": "var(--color-base-500)",
            "subtle-dark": "var(--color-base-400)",
            "default-light": "var(--color-base-700)",
            "default-dark": "var(--color-base-300)",
            "important-light": "var(--color-base-900)",
            "important-dark": "var(--color-base-100)",
        },
    },
    # Sidebar navigation — grouped with icons
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": _("Main"),
                "separator": True,
                "collapsible": False,
                "items": [
                    {
                        "title": _("Dashboard"),
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                        "permission": lambda request: request.user.is_staff,
                    },
                ],
            },
            {
                "title": _("People"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Users"),
                        "icon": "people",
                        "link": reverse_lazy("admin:core_user_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "core.view_user"
                        ),
                    },
                    {
                        "title": _("Student Profiles"),
                        "icon": "school",
                        "link": reverse_lazy("admin:student_studentprofile_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "student.view_studentprofile"
                        ),
                    },
                    {
                        "title": _("Roles"),
                        "icon": "admin_panel_settings",
                        "link": reverse_lazy("admin:core_role_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": _("User Roles"),
                        "icon": "assignment_ind",
                        "link": reverse_lazy("admin:core_userrole_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
            {
                "title": _("Service & Ministry"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Service Groups"),
                        "icon": "groups",
                        "link": reverse_lazy("admin:service_servicegroup_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_servicegroup"
                        ),
                    },
                    {
                        "title": _("Memberships"),
                        "icon": "badge",
                        "link": reverse_lazy(
                            "admin:service_servicegroupmembership_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_servicegroupmembership"
                        ),
                    },
                    {
                        "title": _("Families"),
                        "icon": "family_restroom",
                        "link": reverse_lazy("admin:service_family_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_family"
                        ),
                    },
                    {
                        "title": _("Family Members"),
                        "icon": "diversity_3",
                        "link": reverse_lazy(
                            "admin:service_familymembership_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_familymembership"
                        ),
                    },
                    {
                        "title": _("Events"),
                        "icon": "event",
                        "link": reverse_lazy("admin:service_event_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_event"
                        ),
                    },
                    {
                        "title": _("Attendance"),
                        "icon": "fact_check",
                        "link": reverse_lazy(
                            "admin:service_serviceattendance_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_serviceattendance"
                        ),
                    },
                    {
                        "title": _("Ageglot Selections"),
                        "icon": "how_to_vote",
                        "link": reverse_lazy(
                            "admin:service_ageglotselection_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_ageglotselection"
                        ),
                    },
                    {
                        "title": _("Service Config"),
                        "icon": "settings",
                        "link": reverse_lazy(
                            "admin:service_serviceconfiguration_changelist"
                        ),
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
            {
                "title": _("Finance"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Payments"),
                        "icon": "payments",
                        "link": reverse_lazy("admin:donation_payment_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "donation.view_payment"
                        ),
                    },
                    {
                        "title": _("Student Donations"),
                        "icon": "volunteer_activism",
                        "link": reverse_lazy(
                            "admin:donation_studentdonation_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "donation.view_studentdonation"
                        ),
                    },
                    {
                        "title": _("Guest Donations"),
                        "icon": "handshake",
                        "link": reverse_lazy(
                            "admin:donation_nonstudentdonation_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "donation.view_nonstudentdonation"
                        ),
                    },
                ],
            },
            {
                "title": _("Q&A"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Questions"),
                        "icon": "help",
                        "link": reverse_lazy(
                            "admin:questionanswer_question_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "questionanswer.view_question"
                        ),
                    },
                    {
                        "title": _("Answers"),
                        "icon": "question_answer",
                        "link": reverse_lazy("admin:questionanswer_answer_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "questionanswer.view_answer"
                        ),
                    },
                ],
            },
            {
                "title": _("Notifications"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Notifications"),
                        "icon": "notifications",
                        "link": reverse_lazy("admin:core_notification_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "core.view_notification"
                        ),
                    },
                    {
                        "title": _("Device Tokens"),
                        "icon": "smartphone",
                        "link": reverse_lazy("admin:core_fcmdevicetoken_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
            {
                "title": _("Auth & Security"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Social Applications"),
                        "icon": "apps",
                        "link": reverse_lazy("admin:socialaccount_socialapp_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": _("Social Accounts"),
                        "icon": "link",
                        "link": reverse_lazy("admin:socialaccount_socialaccount_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": _("Sites"),
                        "icon": "language",
                        "link": reverse_lazy("admin:sites_site_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": _("Tokens"),
                        "icon": "key",
                        "link": reverse_lazy("admin:authtoken_tokenproxy_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
        ],
    },
    # Tabs — group related models
    "TABS": [
        {
            "models": [
                "donation.payment",
                "donation.studentdonation",
                "donation.nonstudentdonation",
            ],
            "items": [
                {
                    "title": _("Payments"),
                    "link": reverse_lazy("admin:donation_payment_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "donation.view_payment"
                    ),
                },
                {
                    "title": _("Student Donations"),
                    "link": reverse_lazy("admin:donation_studentdonation_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "donation.view_studentdonation"
                    ),
                },
                {
                    "title": _("Guest Donations"),
                    "link": reverse_lazy(
                        "admin:donation_nonstudentdonation_changelist"
                    ),
                    "permission": lambda request: request.user.has_perm(
                        "donation.view_nonstudentdonation"
                    ),
                },
            ],
        },
        {
            "models": [
                "questionanswer.question",
                "questionanswer.answer",
            ],
            "items": [
                {
                    "title": _("Questions"),
                    "link": reverse_lazy("admin:questionanswer_question_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "questionanswer.view_question"
                    ),
                },
                {
                    "title": _("Answers"),
                    "link": reverse_lazy("admin:questionanswer_answer_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "questionanswer.view_answer"
                    ),
                },
            ],
        },
        {
            "models": [
                "service.family",
                "service.familymembership",
            ],
            "items": [
                {
                    "title": _("Families"),
                    "link": reverse_lazy("admin:service_family_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "service.view_family"
                    ),
                },
                {
                    "title": _("Family Members"),
                    "link": reverse_lazy("admin:service_familymembership_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "service.view_familymembership"
                    ),
                },
            ],
        },
        {
            "models": [
                "service.servicegroup",
                "service.servicegroupmembership",
            ],
            "items": [
                {
                    "title": _("Service Groups"),
                    "link": reverse_lazy("admin:service_servicegroup_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "service.view_servicegroup"
                    ),
                },
                {
                    "title": _("Group Memberships"),
                    "link": reverse_lazy(
                        "admin:service_servicegroupmembership_changelist"
                    ),
                    "permission": lambda request: request.user.has_perm(
                        "service.view_servicegroupmembership"
                    ),
                },
            ],
        },
        {
            "models": [
                "socialaccount.socialapp",
                "socialaccount.socialaccount",
                "sites.site",
                "authtoken.tokenproxy",
            ],
            "items": [
                {
                    "title": _("Social Applications"),
                    "link": reverse_lazy("admin:socialaccount_socialapp_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": _("Social Accounts"),
                    "link": reverse_lazy("admin:socialaccount_socialaccount_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": _("Sites"),
                    "link": reverse_lazy("admin:sites_site_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": _("Tokens"),
                    "link": reverse_lazy("admin:authtoken_tokenproxy_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
            ],
        },
        {
            "models": [
                "core.user",
                "core.role",
                "core.userrole",
            ],
            "items": [
                {
                    "title": _("Users"),
                    "link": reverse_lazy("admin:core_user_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "core.view_user"
                    ),
                },
                {
                    "title": _("Roles"),
                    "link": reverse_lazy("admin:core_role_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": _("User Roles"),
                    "link": reverse_lazy("admin:core_userrole_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
            ],
        },
    ],
}
