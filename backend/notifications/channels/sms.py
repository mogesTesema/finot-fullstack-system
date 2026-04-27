import logging
from .base import NotificationChannel

logger = logging.getLogger(__name__)


class SMSChannel(NotificationChannel):
    """
    Stub for future SMS notifications.

    When you integrate an SMS provider (e.g., Africa's Talking, Twilio),
    implement the methods below and register this channel in
    notifications/apps.py:

        NotificationDispatcher.register(SMSChannel())
    """

    def on_payment_completed(self, payment):
        pass  # Future: send SMS receipt

    def on_payment_failed(self, payment):
        pass  # Future: send SMS failure alert

    def on_event_published(self, event):
        pass  # Future: send SMS event reminder
