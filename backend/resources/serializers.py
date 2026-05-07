from rest_framework import serializers
from .models import Material
from core.serializers import UserSerializer


class MaterialSerializer(serializers.ModelSerializer):
    """
    Handles CRUD for the unified Material model.
    Enforces cross-field validation to guarantee scope consistency.
    """

    uploaded_by_details = UserSerializer(source="uploaded_by", read_only=True)

    # Read-only convenience fields for frontend display
    course_title = serializers.CharField(
        source="course.title", read_only=True, default=None
    )
    service_group_name = serializers.CharField(
        source="service_group.name", read_only=True, default=None
    )

    class Meta:
        model = Material
        fields = [
            "id",
            "title",
            "description",
            "file",
            "url",
            "material_type",
            "course",
            "course_title",
            "service_group",
            "service_group_name",
            "uploaded_by",
            "uploaded_by_details",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "uploaded_by", "created_at", "updated_at"]

    def validate_file(self, value):
        if not value:
            return value

        # File size validation (50MB = 50 * 1024 * 1024 bytes)
        limit = 250 * 1024 * 1024
        if value.size > limit:
            raise serializers.ValidationError(
                f"File size cannot exceed 50MB. (Current size: {value.size / (1024 * 1024):.2f}MB)"
            )

        # Extension validation
        import os

        ext = os.path.splitext(value.name)[1].lower()
        allowed_extensions = {
            ".pdf",
            ".doc",
            ".docx",
            ".ppt",
            ".pptx",
            ".xls",
            ".xlsx",
            ".txt",
            ".jpg",
            ".jpeg",
            ".png",
            ".mp4",
        }
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file extension '{ext}'. Allowed extensions are: {', '.join(allowed_extensions)}"
            )

        return value

    def validate(self, attrs):
        is_update = self.instance is not None
        material_type = attrs.get(
            "material_type", getattr(self.instance, "material_type", None)
        )

        # Auto-scrub irrelevant foreign keys if material_type changes during PATCH/PUT
        # This prevents validation from failing due to legacy values on self.instance
        if is_update and "material_type" in attrs:
            if material_type == Material.MaterialType.GENERAL:
                if "course" not in attrs:
                    attrs["course"] = None
                if "service_group" not in attrs:
                    attrs["service_group"] = None
            elif material_type == Material.MaterialType.COURSE:
                if "service_group" not in attrs:
                    attrs["service_group"] = None
            elif material_type == Material.MaterialType.SERVICE:
                if "course" not in attrs:
                    attrs["course"] = None

        course = attrs.get(
            "course",
            getattr(self.instance, "course", None)
            if not is_update or "course" not in attrs
            else attrs["course"],
        )
        service_group = attrs.get(
            "service_group",
            getattr(self.instance, "service_group", None)
            if not is_update or "service_group" not in attrs
            else attrs["service_group"],
        )

        if material_type == Material.MaterialType.COURSE:
            if not course:
                raise serializers.ValidationError(
                    {"course": "This field is required for COURSE materials."}
                )
            if service_group:
                raise serializers.ValidationError(
                    {"service_group": "Must be null for COURSE materials."}
                )

        elif material_type == Material.MaterialType.SERVICE:
            if not service_group:
                raise serializers.ValidationError(
                    {"service_group": "This field is required for SERVICE materials."}
                )
            if course:
                raise serializers.ValidationError(
                    {"course": "Must be null for SERVICE materials."}
                )

        elif material_type == Material.MaterialType.GENERAL:
            if course:
                raise serializers.ValidationError(
                    {"course": "Must be null for GENERAL materials."}
                )
            if service_group:
                raise serializers.ValidationError(
                    {"service_group": "Must be null for GENERAL materials."}
                )

        # Require at least a file or a URL
        file = attrs.get("file", getattr(self.instance, "file", None))
        url = attrs.get("url", getattr(self.instance, "url", None))
        if not file and not url:
            raise serializers.ValidationError(
                "A material must have at least a file upload or a URL."
            )

        return attrs
