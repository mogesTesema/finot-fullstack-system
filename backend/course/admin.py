from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import (
    Course, 
    SemesterCourse, 
    CourseEnrollment, 
    CourseSession, 
    AttendanceRecord, 
    CourseMaterial
)


@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ('title', 'batch_year', 'is_active', 'created_at')
    list_filter = ('batch_year', 'is_active')
    search_fields = ('title',)


@admin.register(SemesterCourse)
class SemesterCourseAdmin(ModelAdmin):
    list_display = ('course', 'academic_year', 'semester', 'created_at')
    list_filter = ('academic_year', 'semester', 'course__title')
    search_fields = ('course__title',)
    filter_horizontal = ('teachers',)


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(ModelAdmin):
    list_display = ('student', 'semester_course', 'enrolled_at')
    list_filter = ('semester_course__academic_year', 'semester_course__semester')
    search_fields = ('student__username', 'student__email', 'semester_course__course__title')
    autocomplete_fields = ['student', 'semester_course']


@admin.register(CourseSession)
class CourseSessionAdmin(ModelAdmin):
    list_display = ('semester_course', 'date', 'topic')
    list_filter = ('date', 'semester_course__academic_year')
    search_fields = ('semester_course__course__title', 'topic')


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(ModelAdmin):
    list_display = ('student', 'session', 'status', 'marked_by', 'updated_at')
    list_filter = ('status', 'session__date')
    search_fields = ('student__username', 'student__email')


@admin.register(CourseMaterial)
class CourseMaterialAdmin(ModelAdmin):
    list_display = ('title', 'semester_course', 'uploaded_at')
    search_fields = ('title', 'semester_course__course__title')
