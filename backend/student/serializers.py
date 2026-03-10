from rest_framework import serializers
from .models import StudentProfile
from django.conf import settings

class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the StudentProfile model.
    Handles image uploads and data validation.
    """
    # Explicitly define the image field to handle uploads cleanly
    profile_image = serializers.ImageField(required=False, allow_null=True)
    
    # User information (read-only)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    middle_name = serializers.CharField(source='user.middle_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    gender = serializers.CharField(source='user.gender', read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 
            'user',
            'user_email',
            'first_name',
            'middle_name',
            'last_name',
            'gender',
            'profile_image',
            'batch_year',
            'department',
            'telegram_username',
            'personal_phone',
            'emergency_name',
            'emergency_phone',
            'emergency_relation',
            'home_address',
            'previous_church',
            'activity_serving',
            'dorm_block',
            'dorm_room',
            'confession_father',
            'status',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

