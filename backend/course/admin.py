from django.contrib import admin
from unfold.admin import ModelAdmin
from core.models import Role
from .models import (
    Course, 
    SemesterCourse, 
    CourseEnrollment, 
    CourseSession, 
    AttendanceRecord, 
    CourseMaterial
)


def is_superadmin(user):
    if not user.is_authenticated: return False
    return user.is_superuser or user.roles.filter(name=Role.SUPER_ADMIN).exists()

def is_teacher(user):
    if not user.is_authenticated: return False
    return user.roles.filter(name=Role.TEACHER).exists()


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ('title', 'batch_year', 'is_active', 'created_at')
    list_filter = ('batch_year', 'is_active')
    search_fields = ('title',)
    
    def has_module_permission(self, request):
        return is_superadmin(request.user)

    def has_view_permission(self, request, obj=None):
        return is_superadmin(request.user)

    def has_add_permission(self, request):
        return is_superadmin(request.user)

    def has_change_permission(self, request, obj=None):
        return is_superadmin(request.user)

    def has_delete_permission(self, request, obj=None):
        return is_superadmin(request.user)


@admin.register(SemesterCourse)
class SemesterCourseAdmin(ModelAdmin):
    list_display = ('course', 'academic_year', 'semester', 'created_at')
    list_filter = ('academic_year', 'semester', 'course__title')
    search_fields = ('course__title',)
    filter_horizontal = ('teachers',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if is_superadmin(request.user):
            return qs
        if is_teacher(request.user):
            return qs.filter(teachers=request.user)
        return qs.none()

    def has_module_permission(self, request):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_view_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_change_permission(self, request, obj=None):
        return is_superadmin(request.user)
        
    def has_add_permission(self, request):
        return is_superadmin(request.user)
        
    def has_delete_permission(self, request, obj=None):
        return is_superadmin(request.user)


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(ModelAdmin):
    list_display = ('student', 'semester_course', 'enrolled_at')
    list_filter = ('semester_course__academic_year', 'semester_course__semester')
    search_fields = ('student__username', 'student__email', 'semester_course__course__title')
    autocomplete_fields = ['student', 'semester_course']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if is_superadmin(request.user):
            return qs
        if is_teacher(request.user):
            return qs.filter(semester_course__teachers=request.user)
        return qs.none()

    def has_module_permission(self, request):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_view_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_change_permission(self, request, obj=None):
        return is_superadmin(request.user)

    def has_add_permission(self, request):
        return is_superadmin(request.user)

    def has_delete_permission(self, request, obj=None):
        return is_superadmin(request.user)


@admin.register(CourseSession)
class CourseSessionAdmin(ModelAdmin):
    list_display = ('semester_course', 'date', 'topic')
    list_filter = ('date', 'semester_course__academic_year')
    search_fields = ('semester_course__course__title', 'topic')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if is_superadmin(request.user):
            return qs
        if is_teacher(request.user):
            return qs.filter(semester_course__teachers=request.user)
        return qs.none()

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "semester_course" and not is_superadmin(request.user):
            kwargs["queryset"] = SemesterCourse.objects.filter(teachers=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def has_module_permission(self, request):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_view_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_add_permission(self, request):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_change_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_delete_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(ModelAdmin):
    list_display = ('student', 'session', 'status', 'marked_by', 'updated_at')
    list_filter = ('status', 'session__date')
    search_fields = ('student__username', 'student__email')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if is_superadmin(request.user):
            return qs
        if is_teacher(request.user):
            return qs.filter(session__semester_course__teachers=request.user)
        return qs.none()

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "session" and not is_superadmin(request.user):
            kwargs["queryset"] = CourseSession.objects.filter(semester_course__teachers=request.user)
        if db_field.name == "student" and not is_superadmin(request.user):
            from core.models import User
            enrolled_student_ids = CourseEnrollment.objects.filter(semester_course__teachers=request.user).values_list('student_id', flat=True)
            kwargs["queryset"] = User.objects.filter(id__in=enrolled_student_ids)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        if not obj.marked_by_id:
            obj.marked_by = request.user
        super().save_model(request, obj, form, change)

    def has_module_permission(self, request):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_view_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_add_permission(self, request):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_change_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_delete_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)


@admin.register(CourseMaterial)
class CourseMaterialAdmin(ModelAdmin):
    list_display = ('title', 'semester_course', 'uploaded_at')
    search_fields = ('title', 'semester_course__course__title')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if is_superadmin(request.user):
            return qs
        if is_teacher(request.user):
            return qs.filter(semester_course__teachers=request.user)
        return qs.none()

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "semester_course" and not is_superadmin(request.user):
            kwargs["queryset"] = SemesterCourse.objects.filter(teachers=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def has_module_permission(self, request):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_view_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_add_permission(self, request):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_change_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)

    def has_delete_permission(self, request, obj=None):
        return is_superadmin(request.user) or is_teacher(request.user)
