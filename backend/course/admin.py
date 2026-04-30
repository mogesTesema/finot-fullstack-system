from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import (
    Course, 
    CourseOffering, 
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


@admin.register(CourseOffering)
class CourseOfferingAdmin(ModelAdmin):
    list_display = ('course', 'academic_year', 'semester', 'created_at')
    list_filter = ('academic_year', 'semester', 'course__title')
    search_fields = ('course__title',)
    filter_horizontal = ('teachers',)


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(ModelAdmin):
    list_display = ('student', 'offering', 'enrolled_at')
    list_filter = ('offering__academic_year', 'offering__semester')
    search_fields = ('student__username', 'student__email', 'offering__course__title')
    autocomplete_fields = ['student', 'offering']


@admin.register(CourseSession)
class CourseSessionAdmin(ModelAdmin):
    list_display = ('offering', 'date', 'topic')
    list_filter = ('date', 'offering__academic_year')
    search_fields = ('offering__course__title', 'topic')


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(ModelAdmin):
    list_display = ('student', 'session', 'status', 'marked_by', 'updated_at')
    list_filter = ('status', 'session__date')
    search_fields = ('student__username', 'student__email')


@admin.register(CourseMaterial)
class CourseMaterialAdmin(ModelAdmin):
    list_display = ('title', 'offering', 'uploaded_at')
    search_fields = ('title', 'offering__course__title')
