from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(ModelAdmin):
    list_display = ('user', 'batch_year', 'department', 'status', 'telegram_username', 'personal_phone')
    list_filter = ('status', 'batch_year', 'department', 'dorm_block')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'department', 'personal_phone')
    ordering = ('user__username',)
    autocomplete_fields = ['user']
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ("Student", {
            "fields": ("user", "profile_image", "status"),
        }),
        ("Academic Info", {
            "fields": ("batch_year", "department"),
            "classes": ("collapse",),
        }),
        ("Contact Info", {
            "fields": ("telegram_username", "personal_phone"),
            "classes": ("collapse",),
        }),
        ("Emergency Contact", {
            "fields": ("emergency_name", "emergency_phone", "emergency_relation"),
            "classes": ("collapse",),
        }),
        ("Church & Dorm", {
            "fields": ("home_address", "previous_church", "activity_serving", "dorm_block", "dorm_room", "confession_father"),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )
