from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .serializers import MaterialSerializer

material_view_schema = extend_schema_view(
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
