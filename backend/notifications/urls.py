from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FCMDeviceTokenViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'device-token', FCMDeviceTokenViewSet, basename='device-token')
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
