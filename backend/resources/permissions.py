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
            
        if request.user.is_superuser:
            return True

        # Cache roles on the request object to avoid N+1 queries in views and object permissions
        if getattr(request, '_user_roles', None) is None:
            request._user_roles = set(request.user.roles.values_list('name', flat=True))

        # For write operations, check role eligibility at the view level.
        return bool(request._user_roles.intersection([Role.SUPER_ADMIN, Role.SERVICE_ADMIN, Role.COURSE_COORDINATOR]))

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        if getattr(request, '_user_roles', None) is None:
            request._user_roles = set(request.user.roles.values_list('name', flat=True))
            
        user_roles = request._user_roles

        # SuperAdmin can do anything
        if Role.SUPER_ADMIN in user_roles:
            return True

        from .models import Material

        if obj.material_type == Material.MaterialType.GENERAL:
            # Only SuperAdmin can modify general materials (already handled above)
            return False

        if obj.material_type == Material.MaterialType.SERVICE:
            # ServiceAdmin can only modify materials for groups they manage
            if Role.SERVICE_ADMIN in user_roles:
                return obj.service_group and obj.service_group.admin == request.user
            return False

        if obj.material_type == Material.MaterialType.COURSE:
            # CourseCoordinator has global course material access
            return Role.COURSE_COORDINATOR in user_roles

        return False
