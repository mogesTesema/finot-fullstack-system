from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications"
    verbose_name = "Notifications"

    def ready(self):
        # Register notification channels with the dispatcher.
        # Each channel handles one delivery mechanism (email, push, in-app DB).
        from .channels.email import EmailChannel
        from .channels.push import PushChannel
        from .channels.in_app import InAppChannel
        from .dispatch import NotificationDispatcher

        NotificationDispatcher.register(InAppChannel())
        NotificationDispatcher.register(EmailChannel())
        NotificationDispatcher.register(PushChannel())
        # Future: NotificationDispatcher.register(SMSChannel())

        # Connect signal handlers — this wires domain signals to the dispatcher.
        import notifications.handlers  # noqa: F401
