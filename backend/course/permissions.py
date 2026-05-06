from rest_framework import permissions
from core.models import Role
from course.models import SemesterCourse

class IsSuperAdmin(permissions.BasePermission):
    """
    Only users with the SuperAdmin role have access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(name=Role.SUPER_ADMIN).exists()


class IsCourseCoordinator(permissions.BasePermission):
    """
    Course Coordinators have global access to manage any course/session.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(name__in=[Role.SUPER_ADMIN, Role.COURSE_COORDINATOR]).exists()

    def has_object_permission(self, request, view, obj):
        # Admin and Coordinators can do anything
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.roles.filter(name__in=[Role.SUPER_ADMIN, Role.COURSE_COORDINATOR]).exists():
            return True
        return False


class IsEnrolledStudentOrCoordinator(permissions.BasePermission):
    """
    Students can read data for semester courses they are enrolled in.
    Coordinators and SuperAdmins have global read access.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.roles.filter(name__in=[Role.SUPER_ADMIN, Role.COURSE_COORDINATOR]).exists():
            return True
            
        semester_course = getattr(obj, 'semester_course', None)
        if not semester_course and isinstance(obj, SemesterCourse):
            semester_course = obj
        elif not semester_course and hasattr(obj, 'session'):
            semester_course = obj.session.semester_course
            
        if semester_course:
            return semester_course.enrollments.filter(student=request.user).exists()
            
        return False
