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
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 'gender')
        read_only_fields = ('id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 'gender')



