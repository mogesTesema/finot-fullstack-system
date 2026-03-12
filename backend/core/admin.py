from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import User, Role, UserRole, FCMDeviceToken, Notification


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


@admin.register(FCMDeviceToken)
class FCMDeviceTokenAdmin(ModelAdmin):
    list_display = ('user', 'short_token', 'created_at')
    search_fields = ('user__username', 'user__email', 'device_token')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)
    list_per_page = 25

    def short_token(self, obj):
        return f"{obj.device_token[:20]}..."
    short_token.short_description = "Device Token"


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'display_read_status', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    list_per_page = 25
    actions = ['mark_as_read', 'mark_as_unread']

    @display(description="Status", label={"Read": "success", "Unread": "warning"})
    def display_read_status(self, obj):
        return "Read" if obj.is_read else "Unread"

    @admin.action(description="Mark selected as read")
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)

    @admin.action(description="Mark selected as unread")
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
