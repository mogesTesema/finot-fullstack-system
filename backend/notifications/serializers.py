from rest_framework import serializers
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
