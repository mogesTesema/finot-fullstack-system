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
        """Create in-app notification records for relevant active users."""
        from core.models import User
        from service.models import ServiceGroupMembership

        users_qs = User.objects.filter(is_active=True)

        if event.service_group:
            users_qs = users_qs.filter(
                service_membership__service_group=event.service_group,
                service_membership__status=ServiceGroupMembership.ACTIVE
            )

        active_users = users_qs.all()
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

    def on_question_answered(self, answer):
        """Create an in-app notification for the asker of a private question."""
        question = answer.question
        if question.user is None:
            return  # Shouldn't happen (private questions require auth), but safety check

        Notification.objects.create(
            user=question.user,
            title="Your Question Has Been Answered",
            message=(
                f"A counselor has answered your private question "
                f"in the \"{question.category}\" category. "
                f"Check your private inbox to read the response."
            ),
            notification_type=Notification.TYPE_QA,
        )

