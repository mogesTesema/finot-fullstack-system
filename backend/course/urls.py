from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, 
    SemesterCourseViewSet, 
    CourseEnrollmentViewSet, 
    CourseSessionViewSet, 
    AttendanceRecordViewSet, 
    CourseMaterialViewSet
)

router = DefaultRouter()
router.register(r'curriculums', CourseViewSet, basename='course')
router.register(r'semester-courses', SemesterCourseViewSet, basename='semestercourse')
router.register(r'enrollments', CourseEnrollmentViewSet, basename='courseenrollment')
router.register(r'sessions', CourseSessionViewSet, basename='coursesession')
router.register(r'attendance', AttendanceRecordViewSet, basename='attendancerecord')
router.register(r'materials', CourseMaterialViewSet, basename='coursematerial')

urlpatterns = [
    path('', include(router.urls)),
]
