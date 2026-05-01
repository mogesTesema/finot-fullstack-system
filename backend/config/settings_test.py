from .settings import *

# Enforce SQLite for testing so it doesn't touch the production/development database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Make tests run significantly faster by using a simpler password hasher
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
