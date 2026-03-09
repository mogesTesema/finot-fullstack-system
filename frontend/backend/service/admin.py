from django.contrib import admin
from .models import ServiceGroup, AgeglotSelection, Family, FamilyMembership, Event, ServiceConfiguration, ServiceGroupMembership, ServiceAttendance

@admin.register(ServiceConfiguration)
class ServiceConfigurationAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'is_selection_open')
    # Singleton pattern: prevent adding more if one exists? Usually handled by custom admin or just careful usage.
    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

@admin.register(ServiceGroupMembership)
class ServiceGroupMembershipAdmin(admin.ModelAdmin):
    list_display = ('student', 'service_group', 'role', 'status', 'joined_at')
    list_filter = ('service_group', 'role', 'status')
    search_fields = ('student__username', 'student__first_name', 'service_group__name')
    autocomplete_fields = ['student', 'service_group']

@admin.register(ServiceAttendance)
class ServiceAttendanceAdmin(admin.ModelAdmin):
    list_display = ('event', 'student', 'status', 'recorded_at')
    list_filter = ('event', 'status', 'recorded_at')
    search_fields = ('student__username', 'event__title')
    autocomplete_fields = ['student', 'event']

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'start_date', 'end_date', 'created_by', 'created_at')
    list_filter = ('status', 'start_date', 'created_at')
    search_fields = ('title', 'description', 'created_by__username')
    date_hierarchy = 'start_date'

@admin.register(ServiceGroup)
class ServiceGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin', 'created_at')
    search_fields = ('name', 'admin__username')
    autocomplete_fields = ['admin']

@admin.register(AgeglotSelection)
class AgeglotSelectionAdmin(admin.ModelAdmin):
    list_display = ('student', 'service_group', 'priority', 'created_at')
    list_filter = ('priority', 'service_group', 'created_at')
    search_fields = ('student__username', 'service_group__name')
    ordering = ('student', 'priority')
    autocomplete_fields = ['student', 'service_group']

@admin.register(FamilyMembership)
class FamilyMembershipAdmin(admin.ModelAdmin):
    list_display = ('student', 'family', 'joined_at')
    search_fields = ('student__username', 'student__first_name', 'family__name')
    list_filter = ('family',)
    autocomplete_fields = ['student', 'family']

@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ('name', 'father', 'mother', 'religious_father', 'created_at')
    search_fields = ('name', 'father__username', 'mother__username', 'religious_father')
    autocomplete_fields = ['father', 'mother']  # Requires search_fields on UserAdmin
    list_filter = ('created_at',)


