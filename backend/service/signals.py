import threading
import logging
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Event
from core.models import User, Notification
from core.emails import notify_new_event

logger = logging.getLogger(__name__)


def _send_event_emails_and_notifications(event_id):
    """
    Background task: sends emails and creates in-app notifications for a new event.
    Runs in a separate thread so the API response is not blocked.
    """
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return

    active_users = User.objects.filter(is_active=True).exclude(email='').exclude(email__isnull=True)

    # 1. Create in-app Notification records for all active users
    notifications = []
    for user in active_users:
        notifications.append(Notification(
            user=user,
            title=f"New Event: {event.title}",
            message=f"{event.title} is scheduled for {event.start_date.strftime('%B %d, %Y at %I:%M %p')}. Check your events page for details.",
            notification_type=Notification.TYPE_EVENT,
        ))
    if notifications:
        Notification.objects.bulk_create(notifications)

    # 2. Send email notifications (this is the slow part)
    recipient_emails = list(active_users.values_list('email', flat=True))
    if recipient_emails:
        logger.info(f"Signal: Sending event email to {len(recipient_emails)} users (async)...")
        for email in recipient_emails:
            try:
                notify_new_event(event, [email])
            except Exception as e:
                logger.error(f"Failed to send event email to {email}: {e}", exc_info=True)


@receiver(post_save, sender=Event)
def notify_students_of_new_event(sender, instance, created, **kwargs):
    """
    When a NEW event is created, fire off email + in-app notifications
    in a background thread so the API response returns immediately.

    The thread is deferred via transaction.on_commit() to guarantee the
    event row is fully committed to the database before the thread runs.
    This prevents emails being sent for events that fail to persist.
    """
    if created and instance.status == Event.UPCOMING:
        event_id = instance.id

        def start_thread():
            thread = threading.Thread(
                target=_send_event_emails_and_notifications,
                args=(event_id,),
                daemon=True,
            )
            thread.start()

        transaction.on_commit(start_thread)
