from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from .models import (
    ServiceGroup, AgeglotSelection, Family, FamilyMembership,
    Event, ServiceConfiguration, ServiceGroupMembership, ServiceAttendance
)


# ── Inlines ─────────────────────────────────────────────────────────

class FamilyMembershipInline(TabularInline):
    model = FamilyMembership
    extra = 0
    autocomplete_fields = ['student']
    readonly_fields = ('joined_at',)


class ServiceGroupMembershipInline(TabularInline):
    model = ServiceGroupMembership
    extra = 0
    autocomplete_fields = ['student']
    readonly_fields = ('joined_at',)


class ServiceAttendanceInline(TabularInline):
    model = ServiceAttendance
    extra = 0
    autocomplete_fields = ['student']
    readonly_fields = ('recorded_at',)


# ── Model Admins ────────────────────────────────────────────────────

@admin.register(ServiceConfiguration)
class ServiceConfigurationAdmin(ModelAdmin):
    list_display = ('__str__', 'is_selection_open')

    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)


@admin.register(ServiceGroupMembership)
class ServiceGroupMembershipAdmin(ModelAdmin):
    list_display = ('student', 'service_group', 'display_role', 'display_status', 'joined_at')
    list_filter = ('service_group', 'role', 'status')
    search_fields = ('student__username', 'student__first_name', 'service_group__name')
    autocomplete_fields = ['student', 'service_group']
    list_per_page = 25

    @display(description="Role", label={"Member": "info", "Leader": "success", "Coordinator": "warning"})
    def display_role(self, obj):
        return obj.role

    @display(description="Status", label={"Active": "success", "Probation": "warning", "Inactive": "danger"})
    def display_status(self, obj):
        return obj.status


@admin.register(ServiceAttendance)
class ServiceAttendanceAdmin(ModelAdmin):
    list_display = ('event', 'student', 'display_status', 'recorded_at')
    list_filter = ('event', 'status', 'recorded_at')
    search_fields = ('student__username', 'event__title')
    autocomplete_fields = ['student', 'event']
    list_per_page = 25

    @display(description="Status", label={"Present": "success", "Late": "warning", "Absent": "danger", "Excused": "info"})
    def display_status(self, obj):
        return obj.status


@admin.register(Event)
class EventAdmin(ModelAdmin):
    list_display = ('title', 'display_status', 'start_date', 'end_date', 'service_group', 'created_by', 'created_at')
    list_filter = ('status', 'start_date', 'service_group', 'created_at')
    search_fields = ('title', 'description', 'created_by__username')
    date_hierarchy = 'start_date'
    list_per_page = 25
    inlines = [ServiceAttendanceInline]

    fieldsets = (
        (None, {
            "fields": ("title", "description", "photo", "status"),
        }),
        ("Schedule", {
            "fields": ("start_date", "end_date"),
        }),
        ("Location", {
            "fields": ("place_name", "place_url"),
            "classes": ("collapse",),
        }),
        ("Assignment", {
            "fields": ("service_group", "created_by"),
        }),
    )

    @display(description="Status", label={"Upcoming": "info", "Ongoing": "warning", "Completed": "success"})
    def display_status(self, obj):
        return obj.status


@admin.register(ServiceGroup)
class ServiceGroupAdmin(ModelAdmin):
    list_display = ('name', 'admin', 'member_count', 'created_at')
    search_fields = ('name', 'admin__username')
    autocomplete_fields = ['admin']
    list_per_page = 25
    inlines = [ServiceGroupMembershipInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = "Members"


@admin.register(AgeglotSelection)
class AgeglotSelectionAdmin(ModelAdmin):
    list_display = ('student', 'service_group', 'priority', 'created_at')
    list_filter = ('priority', 'service_group', 'created_at')
    search_fields = ('student__username', 'service_group__name')
    ordering = ('student', 'priority')
    autocomplete_fields = ['student', 'service_group']
    list_per_page = 25


@admin.register(FamilyMembership)
class FamilyMembershipAdmin(ModelAdmin):
    list_display = ('student', 'family', 'joined_at')
    search_fields = ('student__username', 'student__first_name', 'family__name')
    list_filter = ('family',)
    autocomplete_fields = ['student', 'family']
    list_per_page = 25


@admin.register(Family)
class FamilyAdmin(ModelAdmin):
    list_display = ('name', 'father', 'mother', 'religious_father', 'member_count', 'created_at')
    search_fields = ('name', 'father__username', 'mother__username', 'religious_father')
    autocomplete_fields = ['father', 'mother']
    list_filter = ('created_at',)
    list_per_page = 25
    inlines = [FamilyMembershipInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = "Members"
