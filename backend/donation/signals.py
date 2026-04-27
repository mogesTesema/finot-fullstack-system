from django.dispatch import Signal

# Domain signals for donation events.
# These are fired by donation views after successful DB commits.
# The notifications app listens to these — donation knows nothing about notifications.

payment_completed = Signal()  # kwargs: payment (Payment instance)
payment_failed = Signal()     # kwargs: payment (Payment instance)
