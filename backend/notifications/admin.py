from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import FCMDeviceToken, Notification


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
