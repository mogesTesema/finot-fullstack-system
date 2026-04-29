from django.db import models
from django.conf import settings


class FCMDeviceToken(models.Model):
    """
    Stores Firebase Cloud Messaging tokens for users.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fcm_tokens")
    device_token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.device_token[:15]}..."


class Notification(models.Model):
    """
    Stores historical notification records.
    """
    TYPE_EVENT = "EVENT"
    TYPE_DONATION = "DONATION"
    TYPE_REMINDER = "REMINDER"
    TYPE_SYSTEM = "SYSTEM"
    TYPE_QA = "QA"

    TYPE_CHOICES = [
        (TYPE_EVENT, "Event"),
        (TYPE_DONATION, "Donation"),
        (TYPE_REMINDER, "Reminder"),
        (TYPE_SYSTEM, "System"),
        (TYPE_QA, "Q&A"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_SYSTEM)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user}: {self.title}"
