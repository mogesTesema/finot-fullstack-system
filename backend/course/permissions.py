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


class IsTeacherForSemesterCourse(permissions.BasePermission):
    """
    Teachers can only modify data for SemesterCourses they are assigned to.
    This permission is checked at the object level.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return True
        
        # Check if user is a teacher for this semester course
        semester_course = getattr(obj, 'semester_course', None)
        if not semester_course and isinstance(obj, SemesterCourse):
            semester_course = obj
        elif not semester_course and hasattr(obj, 'session'):
            semester_course = obj.session.semester_course
            
        if semester_course:
            return semester_course.teachers.filter(id=request.user.id).exists()
            
        return False


class IsEnrolledStudentOrTeacher(permissions.BasePermission):
    """
    Students can read data for semester courses they are enrolled in.
    Teachers for the semester course and SuperAdmins can also read.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return True
            
        semester_course = getattr(obj, 'semester_course', None)
        if not semester_course and isinstance(obj, SemesterCourse):
            semester_course = obj
        elif not semester_course and hasattr(obj, 'session'):
            semester_course = obj.session.semester_course
            
        if semester_course:
            is_teacher = semester_course.teachers.filter(id=request.user.id).exists()
            is_student = semester_course.enrollments.filter(student=request.user).exists()
            return is_teacher or is_student
            
        return False
