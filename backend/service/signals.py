import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Event
from core.models import User, Notification
from core.emails import notify_new_event


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
        print(f"Signal: Sending event email to {len(recipient_emails)} users (async)...")
        for email in recipient_emails:
            try:
                notify_new_event(event, [email])
            except Exception as e:
                print(f"Failed to send event email to {email}: {e}")


@receiver(post_save, sender=Event)
def notify_students_of_new_event(sender, instance, created, **kwargs):
    """
    When a NEW event is created, fire off email + in-app notifications
    in a background thread so the API response returns immediately.
    """
    if created and instance.status == Event.UPCOMING:
        thread = threading.Thread(
            target=_send_event_emails_and_notifications,
            args=(instance.id,),
            daemon=True,
        )
        thread.start()
