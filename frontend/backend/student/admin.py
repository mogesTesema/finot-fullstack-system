from django.contrib import admin
from .models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'batch_year', 'department', 'status', 'telegram_username', 'personal_phone')
    list_filter = ('status', 'batch_year', 'department', 'dorm_block')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'department', 'personal_phone')
    ordering = ('user__username',)
    autocomplete_fields = ['user']
