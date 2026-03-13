from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, FCMDeviceToken
from .serializers import NotificationSerializer, FCMDeviceTokenSerializer

def home_page(request):
    return render(request, 'core/index.html')

class FCMDeviceTokenViewSet(viewsets.ModelViewSet):
    """
    Registers the Firebase Cloud Messaging device token.
    """
    serializer_class = FCMDeviceTokenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FCMDeviceToken.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        device_token = request.data.get('device_token')
        if not device_token:
            return Response({"device_token": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update or create the token for this user without triggering the serializer's UniqueValidator
        token_obj, created = FCMDeviceToken.objects.update_or_create(
            device_token=device_token,
            defaults={'user': request.user}
        )
        return Response(self.get_serializer(token_obj).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List user notifications. Allows marking as read.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "Notification marked as read"})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"status": "All notifications marked as read"})