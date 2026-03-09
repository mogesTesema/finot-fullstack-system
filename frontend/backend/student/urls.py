from rest_framework_nested import routers
from django.urls import path, include
from . import views

router = routers.DefaultRouter()
router.register(r'profiles', views.StudentProfileViewSet, basename='student-profiles')

urlpatterns = [
    path('', include(router.urls)),
]
