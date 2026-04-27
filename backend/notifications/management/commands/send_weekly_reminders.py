import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.models import Notification, FCMDeviceToken
from notifications.channels.push import _send_fcm_to_user

User = get_user_model()


class Command(BaseCommand):
    help = (
        "Sends a weekly donation reminder to all students via Firebase Cloud Messaging."
    )

    def handle(self, *args, **kwargs):
        users = User.objects.filter(is_active=True)
        count = 0

        title = "Weekly Donation Reminder ⛪"
        message = "Happy Thursday! Please remember to send your weekly fellowship donation today."

        for user in users:
            # We don't want this to crash the loop if one fails
            try:
                # 1. Create in-app notification record
                Notification.objects.create(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=Notification.TYPE_REMINDER,
                )

                # 2. Send FCM push to all user devices
                _send_fcm_to_user(
                    user=user,
                    title=title,
                    body=message,
                    notification_type=Notification.TYPE_REMINDER,
                )

                count += 1
            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(f"Failed for user {user.username}: {e}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully sent weekly reminders to {count} users.")
        )
