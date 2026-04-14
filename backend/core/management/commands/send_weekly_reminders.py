import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.notifications import send_push_notification
from core.models import Notification

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
                success = send_push_notification(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=Notification.TYPE_REMINDER,
                )
                if success:
                    count += 1
            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(f"Failed for user {user.username}: {e}")
                )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully sent weekly reminders to {count} users.")
        )
