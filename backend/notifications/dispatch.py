import logging

logger = logging.getLogger(__name__)


class NotificationDispatcher:
    """
    Central registry for notification channels.

    Channels self-register on app startup via notifications/apps.py.
    The dispatcher fans out each event to all registered channels,
    isolating failures so one broken channel never blocks the others.

    Usage (from signal handlers):
        NotificationDispatcher.payment_completed(payment)
        NotificationDispatcher.event_published(event)
    """

    _channels = []

    @classmethod
    def register(cls, channel):
        """Register a notification channel instance."""
        cls._channels.append(channel)
        logger.info("NotificationDispatcher: registered %s", channel.__class__.__name__)

    @classmethod
    def payment_completed(cls, payment):
        """Dispatch payment completion to all channels."""
        cls._dispatch("on_payment_completed", payment=payment)

    @classmethod
    def payment_failed(cls, payment):
        """Dispatch payment failure to all channels."""
        cls._dispatch("on_payment_failed", payment=payment)

    @classmethod
    def event_published(cls, event):
        """Dispatch event publication to all channels."""
        cls._dispatch("on_event_published", event=event)

    @classmethod
    def _dispatch(cls, method_name, **kwargs):
        """
        Call the named method on every registered channel.
        Each channel is wrapped in its own try/except so a broken email
        channel cannot prevent the push channel from firing.
        """
        for channel in cls._channels:
            try:
                getattr(channel, method_name)(**kwargs)
            except Exception:
                logger.error(
                    "Channel %s failed on %s",
                    channel.__class__.__name__,
                    method_name,
                    exc_info=True,
                )
