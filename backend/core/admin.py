from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import User, Role, UserRole


@admin.register(User)
class CustomUserAdmin(DjangoUserAdmin, ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'gender', 'display_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'gender')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    list_per_page = 25

    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Profile Details", {'fields': ('middle_name', 'gender')}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("Profile Details", {'fields': ('middle_name', 'gender', 'email')}),
    )

    @display(description="Active", label={"Yes": "success", "No": "danger"})
    def display_active(self, obj):
        return "Yes" if obj.is_active else "No"


@admin.register(Role)
class RoleAdmin(ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(UserRole)
class UserRoleAdmin(ModelAdmin):
    list_display = ('user', 'role', 'assigned_at')
    list_filter = ('role', 'assigned_at')
    search_fields = ('user__username', 'role__name')
    autocomplete_fields = ['user', 'role']
    list_per_page = 25

