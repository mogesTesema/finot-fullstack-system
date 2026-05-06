import uuid

from rest_framework import viewsets, status, serializers as drf_serializers
from rest_framework.response import Response
from django.db.models import Q

from core.models import Role
from .models import Material
from .serializers import MaterialSerializer
from .permissions import MaterialPermission


class MaterialViewSet(viewsets.ModelViewSet):
    """
    Unified Material API.

    GET /api/resources/materials/
        Returns materials visible to the current user based on their roles,
        enrollments, and service group memberships.

    Supports query parameter filters:
        ?type=COURSE|SERVICE|GENERAL   — filter by material type
        ?course=<uuid>                 — filter by course (curriculum) ID
        ?service_group=<uuid>          — filter by service group ID (integer)
    """
    serializer_class = MaterialSerializer
    permission_classes = [MaterialPermission]

    def get_queryset(self):
        qs = Material.objects.select_related(
            'course', 'service_group', 'uploaded_by'
        )

        user = self.request.user
        if not user.is_authenticated:
            return qs.none()

        # --- Apply query parameter filters ---
        material_type = self.request.query_params.get('type')
        if material_type:
            if material_type.upper() in Material.MaterialType.values:
                qs = qs.filter(material_type=material_type.upper())
            else:
                raise drf_serializers.ValidationError(
                    {"type": f"Invalid type. Must be one of: {', '.join(Material.MaterialType.values)}"}
                )

        course_id = self.request.query_params.get('course')
        if course_id:
            try:
                uuid.UUID(course_id)
                qs = qs.filter(course_id=course_id)
            except ValueError:
                raise drf_serializers.ValidationError({"course": "Invalid UUID format."})

        service_group_id = self.request.query_params.get('service_group')
        if service_group_id:
            try:
                service_group_id = int(service_group_id)
                qs = qs.filter(service_group_id=service_group_id)
            except ValueError:
                raise drf_serializers.ValidationError({"service_group": "Invalid ID format."})

        # --- Role-based visibility ---
        is_admin = user.roles.filter(name=Role.SUPER_ADMIN).exists()
        is_coordinator = user.roles.filter(name=Role.COURSE_COORDINATOR).exists()
        is_service_admin = user.roles.filter(name=Role.SERVICE_ADMIN).exists()

        # SuperAdmins and CourseCoordinators see everything
        if is_admin:
            return qs

        # Build a union of visibility conditions for non-admin users
        visibility = Q(material_type=Material.MaterialType.GENERAL)

        # COURSE materials: visible if the student is enrolled in a SemesterCourse
        # whose parent Course matches the material's course FK.
        visibility |= Q(
            material_type=Material.MaterialType.COURSE,
            course__semester_courses__enrollments__student=user,
        )

        # SERVICE materials: visible if the student is an active member of that group
        visibility |= Q(
            material_type=Material.MaterialType.SERVICE,
            service_group__members__student=user,
        )

        # CourseCoordinators additionally see all COURSE materials
        if is_coordinator:
            visibility |= Q(material_type=Material.MaterialType.COURSE)

        # ServiceAdmins additionally see materials for groups they manage
        if is_service_admin:
            visibility |= Q(
                material_type=Material.MaterialType.SERVICE,
                service_group__admin=user,
            )

        return qs.filter(visibility).distinct()

    def perform_create(self, serializer):
        """
        Enforce scope-level write permissions at creation time.
        - GENERAL: only SuperAdmin
        - SERVICE: SuperAdmin or ServiceAdmin of that specific group
        - COURSE:  SuperAdmin or CourseCoordinator
        """
        user = self.request.user
        material_type = serializer.validated_data.get('material_type')
        is_super = user.roles.filter(name=Role.SUPER_ADMIN).exists()

        if material_type == Material.MaterialType.GENERAL:
            if not is_super:
                raise drf_serializers.ValidationError(
                    {"material_type": "Only SuperAdmin can create GENERAL materials."}
                )

        elif material_type == Material.MaterialType.SERVICE:
            service_group = serializer.validated_data.get('service_group')
            if not is_super:
                is_service_admin = user.roles.filter(name=Role.SERVICE_ADMIN).exists()
                if not is_service_admin or service_group.admin != user:
                    raise drf_serializers.ValidationError(
                        {"service_group": "You can only create materials for service groups you manage."}
                    )

        elif material_type == Material.MaterialType.COURSE:
            if not is_super:
                is_coordinator = user.roles.filter(name=Role.COURSE_COORDINATOR).exists()
                if not is_coordinator:
                    raise drf_serializers.ValidationError(
                        {"material_type": "Only SuperAdmin or CourseCoordinator can create COURSE materials."}
                    )

        serializer.save(uploaded_by=user)
