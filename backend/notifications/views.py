from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, FCMDeviceToken
from .serializers import NotificationSerializer, FCMDeviceTokenSerializer


class FCMDeviceTokenViewSet(viewsets.ModelViewSet):
    """
    Registers the Firebase Cloud Messaging device token.
    """

    serializer_class = FCMDeviceTokenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FCMDeviceToken.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        device_token = request.data.get("device_token")

        # Grab existing token to bypass UniqueValidator on update
        instance = FCMDeviceToken.objects.filter(device_token=device_token).first()

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Save forces updating the user field to the current logged-in user
        serializer.save(user=request.user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED,
        )


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List user notifications. Allows marking as read.
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "Notification marked as read"})

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"status": "All notifications marked as read"})
