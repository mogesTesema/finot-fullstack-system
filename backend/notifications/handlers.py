import threading
import logging
from django.dispatch import receiver
from django.db import transaction
from django.db.models.signals import post_save

from donation.signals import payment_completed, payment_failed
from .dispatch import NotificationDispatcher

logger = logging.getLogger(__name__)


@receiver(payment_completed)
def handle_payment_completed(sender, payment, **kwargs):
    """
    Receives the payment_completed signal from donation views.
    Defers notification dispatch until after the DB transaction commits,
    so we never notify about a payment that rolled back.
    """
    transaction.on_commit(
        lambda: NotificationDispatcher.payment_completed(payment)
    )


@receiver(payment_failed)
def handle_payment_failed(sender, payment, **kwargs):
    """
    Receives the payment_failed signal from donation views.
    Same on_commit deferral as above.
    """
    transaction.on_commit(
        lambda: NotificationDispatcher.payment_failed(payment)
    )


@receiver(post_save, sender='service.Event')
def handle_event_published(sender, instance, created, **kwargs):
    """
    Listens to Event post_save. When a new UPCOMING event is created,
    dispatches notifications via all channels in a background thread
    (since event frequency is low: ~3x per week).

    This replaces the handler in service/signals.py.
    """
    if created and instance.status == instance.UPCOMING:
        event_id = instance.id

        def _dispatch_in_thread():
            from service.models import Event
            try:
                event = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                logger.warning("handle_event_published: Event id=%s not found.", event_id)
                return
            NotificationDispatcher.event_published(event)

        def start_thread():
            thread = threading.Thread(
                target=_dispatch_in_thread,
                daemon=True,
            )
            thread.start()

        transaction.on_commit(start_thread)
