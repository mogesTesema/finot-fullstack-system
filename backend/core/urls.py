from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import home_page, FCMDeviceTokenViewSet, NotificationViewSet, GoogleLogin

router = DefaultRouter()
router.register(r'notifications/device-token', FCMDeviceTokenViewSet, basename='device-token')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', home_page, name='home'),
    path('api/', include(router.urls)),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
]