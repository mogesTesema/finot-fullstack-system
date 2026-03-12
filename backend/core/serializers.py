from djoser.serializers import (
    UserCreateSerializer as BaseUserCreateSerializer,
    UserSerializer as BaseUserSerializer,
)
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'middle_name', 'last_name', 'gender')
        
    def validate(self, attrs):
        # Enforce required fields manually if not enforced by model
        required_fields = ['first_name', 'middle_name', 'last_name', 'gender']
        for field in required_fields:
            if not attrs.get(field):
                 raise serializers.ValidationError({field: "This field is required."})
        return super().validate(attrs)

class UserSerializer(BaseUserSerializer):
    roles = serializers.SerializerMethodField()

    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 'gender', 'roles')
        read_only_fields = ('id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 'gender', 'roles')

    def get_roles(self, obj):
        return list(obj.roles.values_list('name', flat=True))

from .models import Notification, FCMDeviceToken

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'notification_type', 'is_read', 'created_at')
        read_only_fields = ('id', 'created_at')

class FCMDeviceTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = FCMDeviceToken
        fields = ('device_token',)
