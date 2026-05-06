from rest_framework import serializers
from .models import Material
from core.serializers import UserSerializer


class MaterialSerializer(serializers.ModelSerializer):
    """
    Handles CRUD for the unified Material model.
    Enforces cross-field validation to guarantee scope consistency.
    """
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)

    # Read-only convenience fields for frontend display
    course_title = serializers.CharField(source='course.title', read_only=True, default=None)
    service_group_name = serializers.CharField(source='service_group.name', read_only=True, default=None)

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'description', 'file', 'url',
            'material_type',
            'course', 'course_title',
            'service_group', 'service_group_name',
            'uploaded_by', 'uploaded_by_details',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at']

    def validate(self, attrs):
        material_type = attrs.get('material_type', getattr(self.instance, 'material_type', None))
        course = attrs.get('course', getattr(self.instance, 'course', None))
        service_group = attrs.get('service_group', getattr(self.instance, 'service_group', None))

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
        file = attrs.get('file', getattr(self.instance, 'file', None))
        url = attrs.get('url', getattr(self.instance, 'url', None))
        if not file and not url:
            raise serializers.ValidationError(
                "A material must have at least a file upload or a URL."
            )

        return attrs
