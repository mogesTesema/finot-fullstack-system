from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceGroupViewSet, AgeglotSelectionViewSet, FamilyViewSet, EventViewSet, ServiceAttendanceViewSet

router = DefaultRouter()
router.register(r'groups', ServiceGroupViewSet, basename='service-groups')
router.register(r'selections', AgeglotSelectionViewSet, basename='service-selections')
router.register(r'families', FamilyViewSet, basename='service-families')
router.register(r'events', EventViewSet, basename='service-events')
router.register(r'attendance', ServiceAttendanceViewSet, basename='service-attendance')

urlpatterns = [
    path('', include(router.urls)),
]
