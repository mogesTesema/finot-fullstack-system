from abc import ABC, abstractmethod


class NotificationChannel(ABC):
    """
    Abstract base class for all notification delivery channels.

    Every channel (email, push, SMS, in-app) must implement these methods.
    The NotificationDispatcher calls each registered channel, catching
    exceptions per-channel so one broken channel never blocks the others.
    """

    @abstractmethod
    def on_payment_completed(self, payment):
        """Called when a donation payment is verified as successful."""
        ...

    @abstractmethod
    def on_payment_failed(self, payment):
        """Called when a donation payment fails or cannot be verified."""
        ...

    @abstractmethod
    def on_event_published(self, event):
        """Called when a new service event is created and published."""
        ...

    def on_question_answered(self, answer):
        """Called when a counselor answers a private question.

        Default: no-op. Only in-app and push channels implement this,
        since email and SMS are not used for private Q&A (cost savings).
        """
        pass
