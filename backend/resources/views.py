import uuid

from rest_framework import viewsets, status, serializers as drf_serializers
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.models import Role
from .models import Material
from .serializers import MaterialSerializer
from .permissions import MaterialPermission


@extend_schema_view(
    list=extend_schema(
        summary="List materials",
        description=(
            "Returns materials visible to the current user based on their roles, "
            "enrollments, and service group memberships."
        ),
        parameters=[
            OpenApiParameter(
                name="type",
                type=str,
                enum=["COURSE", "SERVICE", "GENERAL"],
                description="Filter by material type.",
                required=False,
            ),
            OpenApiParameter(
                name="course",
                type=OpenApiTypes.UUID,
                description="Filter by course (curriculum) UUID.",
                required=False,
            ),
            OpenApiParameter(
                name="service_group",
                type=OpenApiTypes.INT,
                description="Filter by service group ID.",
                required=False,
            ),
        ],
    ),
    retrieve=extend_schema(
        summary="Retrieve a material",
        description="Returns a single material by its UUID.",
    ),
    create=extend_schema(
        summary="Create a material",
        description=(
            "Upload a new material with an optional file attachment. "
            "Use **multipart/form-data** content type to upload files. "
            "Requires SuperAdmin, ServiceAdmin, or CourseCoordinator role."
        ),
        request={
            "multipart/form-data": MaterialSerializer,
        },
    ),
    partial_update=extend_schema(
        summary="Partially update a material",
        description=(
            "Update specific fields of an existing material. "
            "Use **multipart/form-data** to replace the file attachment."
        ),
        request={
            "multipart/form-data": MaterialSerializer,
        },
    ),
    update=extend_schema(
        summary="Update a material",
        description=(
            "Replace all fields of an existing material. "
            "Use **multipart/form-data** to include a file attachment."
        ),
        request={
            "multipart/form-data": MaterialSerializer,
        },
    ),
    destroy=extend_schema(
        summary="Delete a material",
        description="Permanently removes a material. Requires appropriate role.",
    ),
)
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
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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
        user_roles = getattr(self.request, '_user_roles', None)
        if user_roles is None:
            user_roles = set(user.roles.values_list('name', flat=True))
            self.request._user_roles = user_roles

        is_admin = Role.SUPER_ADMIN in user_roles
        is_coordinator = Role.COURSE_COORDINATOR in user_roles
        is_service_admin = Role.SERVICE_ADMIN in user_roles

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
        
        user_roles = getattr(self.request, '_user_roles', None)
        if user_roles is None:
            user_roles = set(user.roles.values_list('name', flat=True))
            self.request._user_roles = user_roles
            
        is_super = Role.SUPER_ADMIN in user_roles

        if material_type == Material.MaterialType.GENERAL:
            if not is_super:
                raise drf_serializers.ValidationError(
                    {"material_type": "Only SuperAdmin can create GENERAL materials."}
                )

        elif material_type == Material.MaterialType.SERVICE:
            service_group = serializer.validated_data.get('service_group')
            if not is_super:
                is_service_admin = Role.SERVICE_ADMIN in user_roles
                if not is_service_admin or service_group.admin != user:
                    raise drf_serializers.ValidationError(
                        {"service_group": "You can only create materials for service groups you manage."}
                    )

        elif material_type == Material.MaterialType.COURSE:
            if not is_super:
                is_coordinator = Role.COURSE_COORDINATOR in user_roles
                if not is_coordinator:
                    raise drf_serializers.ValidationError(
                        {"material_type": "Only SuperAdmin or CourseCoordinator can create COURSE materials."}
                    )

        serializer.save(uploaded_by=user)

    def perform_update(self, serializer):
        """
        Enforce scope-level write permissions at update time.
        Ensures a user doesn't escalate the material scope beyond their permissions.
        """
        user = self.request.user
        material_type = serializer.validated_data.get('material_type', self.get_object().material_type)
        
        user_roles = getattr(self.request, '_user_roles', None)
        if user_roles is None:
            user_roles = set(user.roles.values_list('name', flat=True))
            self.request._user_roles = user_roles
            
        is_super = Role.SUPER_ADMIN in user_roles

        if material_type == Material.MaterialType.GENERAL:
            if not is_super:
                raise drf_serializers.ValidationError(
                    {"material_type": "Only SuperAdmin can manage GENERAL materials."}
                )

        elif material_type == Material.MaterialType.SERVICE:
            service_group = serializer.validated_data.get('service_group', self.get_object().service_group)
            if not is_super:
                is_service_admin = Role.SERVICE_ADMIN in user_roles
                if not is_service_admin or (service_group and service_group.admin != user):
                    raise drf_serializers.ValidationError(
                        {"service_group": "You can only manage materials for service groups you manage."}
                    )

        elif material_type == Material.MaterialType.COURSE:
            if not is_super:
                is_coordinator = Role.COURSE_COORDINATOR in user_roles
                if not is_coordinator:
                    raise drf_serializers.ValidationError(
                        {"material_type": "Only SuperAdmin or CourseCoordinator can manage COURSE materials."}
                    )

        serializer.save()
