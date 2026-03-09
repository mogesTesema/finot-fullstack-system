from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class EmailAuthenticationBackend(ModelBackend):
    """
    Custom authentication backend to allow users to log in using their email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # We check both email and username just to be safe
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
