from rest_framework import permissions
from core.models import Role


class MaterialPermission(permissions.BasePermission):
    """
    Granular permission for the unified Material system.

    READ (list/retrieve):
        - Authenticated users can read (queryset filtering handles visibility).

    WRITE (create/update/delete):
        - GENERAL materials:  SuperAdmin only.
        - SERVICE materials:  SuperAdmin OR the ServiceAdmin who manages that group.
        - COURSE materials:   SuperAdmin OR CourseCoordinator.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Safe methods (GET, HEAD, OPTIONS) are open to all authenticated users.
        if request.method in permissions.SAFE_METHODS:
            return True

        # For write operations, check role eligibility at the view level.
        # Detailed scope checks happen in has_object_permission and perform_create.
        return request.user.roles.filter(
            name__in=[Role.SUPER_ADMIN, Role.SERVICE_ADMIN, Role.COURSE_COORDINATOR]
        ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        # SuperAdmin can do anything
        if request.user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return True

        from .models import Material

        if obj.material_type == Material.MaterialType.GENERAL:
            # Only SuperAdmin can modify general materials (already handled above)
            return False

        if obj.material_type == Material.MaterialType.SERVICE:
            # ServiceAdmin can only modify materials for groups they manage
            if request.user.roles.filter(name=Role.SERVICE_ADMIN).exists():
                return obj.service_group and obj.service_group.admin == request.user
            return False

        if obj.material_type == Material.MaterialType.COURSE:
            # CourseCoordinator has global course material access
            return request.user.roles.filter(name=Role.COURSE_COORDINATOR).exists()

        return False
