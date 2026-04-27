import logging
from .base import NotificationChannel
from notifications.models import Notification

logger = logging.getLogger(__name__)


class InAppChannel(NotificationChannel):
    """
    Creates Notification database records for in-app display.
    This replaces the inline Notification.objects.create() calls
    scattered across service/signals.py and core/notifications.py.
    """

    def on_payment_completed(self, payment):
        if not (hasattr(payment, "student_donation") and payment.student_donation):
            return

        user = payment.student_donation.student
        Notification.objects.create(
            user=user,
            title="Donation Successful",
            message=f"We received your donation of {payment.amount} ETB. Thank you!",
            notification_type=Notification.TYPE_DONATION,
        )

    def on_payment_failed(self, payment):
        if not (hasattr(payment, "student_donation") and payment.student_donation):
            return

        user = payment.student_donation.student
        Notification.objects.create(
            user=user,
            title="Donation Failed",
            message=f"Your donation of {payment.amount} ETB could not be verified.",
            notification_type=Notification.TYPE_DONATION,
        )

    def on_event_published(self, event):
        """Create in-app notification records for all active users."""
        from core.models import User

        active_users = User.objects.filter(is_active=True)
        notifications = [
            Notification(
                user=user,
                title=f"New Event: {event.title}",
                message=(
                    f"{event.title} is scheduled for "
                    f"{event.start_date.strftime('%B %d, %Y at %I:%M %p')}. "
                    f"Check your events page for details."
                ),
                notification_type=Notification.TYPE_EVENT,
            )
            for user in active_users
        ]
        if notifications:
            Notification.objects.bulk_create(notifications)
            logger.info("InAppChannel: Created %d event notifications.", len(notifications))
