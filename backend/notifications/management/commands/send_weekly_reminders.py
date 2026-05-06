import logging
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from student.models import StudentProfile
from notifications.models import Notification, FCMDeviceToken
from notifications.channels.push import _send_fcm_multicast, _initialize_firebase

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Sends a weekly donation reminder to all active students in memory-safe chunks."
    )

    def handle(self, *args, **kwargs):
        title = "Weekly Donation Reminder"
        message = "Happy Thursday! Please remember to send your weekly fellowship donation today."

        # Determine how many users to load into RAM at one time
        batch_size = 250

        # order_by('id') is required when using .iterator() with chunk_size
        active_users = User.objects.filter(
            is_active=True, student_profile__status=StudentProfile.IN_CAMPUS
        ).order_by("id")
        if not active_users.exists():
            self.stdout.write(self.style.WARNING("No active users found."))
            return

        _initialize_firebase()

        users_batch = []
        total_users = 0
        total_tokens = 0

        # .iterator() streams the DB rows so they aren't all cached in memory
        for user in active_users.iterator(chunk_size=batch_size):
            users_batch.append(user)

            # When the batch is full, process it and clear memory
            if len(users_batch) == batch_size:
                u_count, t_count = self._process_batch(users_batch, title, message)
                total_users += u_count
                total_tokens += t_count
                users_batch = []  # Clear memory for the next loop

        # Process any remaining users that didn't cleanly divide by batch_size
        if users_batch:
            u_count, t_count = self._process_batch(users_batch, title, message)
            total_users += u_count
            total_tokens += t_count

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully processed {total_users} users and sent FCM to {total_tokens} devices."
            )
        )

    def _process_batch(self, users, title, message):
        """Processes a bounded chunk of users to keep RAM usage minimal."""

        # 1. Bulk Create In-App Notifications ONLY for this chunk
        notifications_to_create = [
            Notification(
                user=user,
                title=title,
                message=message,
                notification_type=Notification.TYPE_REMINDER,
            )
            for user in users
        ]
        Notification.objects.bulk_create(notifications_to_create)

        # 2. Fetch device tokens ONLY for this chunk
        device_tokens = list(
            FCMDeviceToken.objects.filter(user__in=users).values_list(
                "device_token", flat=True
            )
        )

        # 3. Send Firebase Multicast (this handles its own batching under the hood)
        if device_tokens:
            _send_fcm_multicast(
                title=title,
                body=message,
                notification_type=Notification.TYPE_REMINDER,
                device_tokens=device_tokens,
            )

        return len(users), len(device_tokens)
