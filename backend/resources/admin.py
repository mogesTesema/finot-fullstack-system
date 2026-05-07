from django.contrib import admin
from django.db.models import Q
from unfold.admin import ModelAdmin
from core.models import Role
from .models import Material

@admin.register(Material)
class MaterialAdmin(ModelAdmin):
    list_display = ("title", "material_type", "course", "service_group", "uploaded_by", "created_at")
    list_filter = ("material_type", "created_at")
    search_fields = ("title", "description", "uploaded_by__first_name", "uploaded_by__last_name", "uploaded_by__username")
    readonly_fields = ("id", "created_at", "updated_at", "uploaded_by")

    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "description", "material_type")
        }),
        ("Attachments", {
            "fields": ("file", "url")
        }),
        ("Assignment", {
            "fields": ("course", "service_group"),
            "description": "Select the associated Course (for Course Materials) or Service Group (for Service Group Materials)."
        }),
        ("Metadata", {
            "fields": ("uploaded_by", "created_at", "updated_at"),
            "classes": ("collapse",)
        })
    )

    def save_model(self, request, obj, form, change):
        """Auto-assign the current user as the uploader when creating a new material."""
        if not obj.pk:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Filter the list view so users only see materials relevant to their roles or what they uploaded."""
        qs = super().get_queryset(request)
        if request.user.is_superuser or request.user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return qs

        is_coordinator = request.user.roles.filter(name=Role.COURSE_COORDINATOR).exists()
        is_service_admin = request.user.roles.filter(name=Role.SERVICE_ADMIN).exists()

        # Always see materials you personally uploaded
        visibility = Q(uploaded_by=request.user)

        # Coordinators see materials for courses they manage
        if is_coordinator:
            visibility |= Q(material_type=Material.MaterialType.COURSE, course__semester_courses__coordinators=request.user)
        
        # Service Admins see materials for groups they manage
        if is_service_admin:
            visibility |= Q(material_type=Material.MaterialType.SERVICE, service_group__admin=request.user)

        return qs.filter(visibility).distinct()

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filter the Course and Service Group dropdowns based on what the user manages."""
        if not (request.user.is_superuser or request.user.roles.filter(name=Role.SUPER_ADMIN).exists()):
            if db_field.name == "course":
                is_coordinator = request.user.roles.filter(name=Role.COURSE_COORDINATOR).exists()
                if is_coordinator:
                    kwargs["queryset"] = db_field.related_model.objects.filter(
                        semester_courses__coordinators=request.user
                    ).distinct()
                else:
                    kwargs["queryset"] = db_field.related_model.objects.none()

            if db_field.name == "service_group":
                is_service_admin = request.user.roles.filter(name=Role.SERVICE_ADMIN).exists()
                if is_service_admin:
                    kwargs["queryset"] = db_field.related_model.objects.filter(admin=request.user)
                else:
                    kwargs["queryset"] = db_field.related_model.objects.none()

        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        """Restrict the material_type dropdown based on the user's role."""
        if db_field.name == "material_type":
            if not (request.user.is_superuser or request.user.roles.filter(name=Role.SUPER_ADMIN).exists()):
                choices = []
                if request.user.roles.filter(name=Role.COURSE_COORDINATOR).exists():
                    choices.append((Material.MaterialType.COURSE, "Course Material"))
                if request.user.roles.filter(name=Role.SERVICE_ADMIN).exists():
                    choices.append((Material.MaterialType.SERVICE, "Service Group Material"))
                
                if choices:
                    kwargs["choices"] = choices
                    
        return super().formfield_for_choice_field(db_field, request, **kwargs)
