from django.urls import path
from .views import home_page, GoogleLogin

urlpatterns = [
    path('', home_page, name='home'),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
]