import os
import json
import base64
import logging
import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings

from notifications.models import FCMDeviceToken, Notification
from .base import NotificationChannel

logger = logging.getLogger(__name__)


def _initialize_firebase():
    """Initialize the Firebase Admin SDK using available credentials."""
    if firebase_admin._apps:
        return  # Already initialized

    firebase_credential = None

    # Priority 1: Base64-encoded JSON from environment variable (recommended for production)
    base64_credentials = os.environ.get("FIREBASE_CREDENTIALS_B64")
    if base64_credentials:
        try:
            credentials_dict = json.loads(base64.b64decode(base64_credentials))
            firebase_credential = credentials.Certificate(credentials_dict)
            logger.info("Firebase Admin: using FIREBASE_CREDENTIALS_B64 env var.")
        except Exception as error:
            logger.error("Firebase Admin: failed to parse FIREBASE_CREDENTIALS_B64: %s", error)

    # Priority 2: GOOGLE_APPLICATION_CREDENTIALS file path (standard GCP convention)
    if firebase_credential is None:
        gcp_credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if gcp_credentials_path and os.path.exists(gcp_credentials_path):
            try:
                firebase_credential = credentials.Certificate(gcp_credentials_path)
                logger.info("Firebase Admin: using GOOGLE_APPLICATION_CREDENTIALS file.")
            except Exception as error:
                logger.error("Firebase Admin: failed to load GOOGLE_APPLICATION_CREDENTIALS: %s", error)

    # Priority 3: Legacy hardcoded path (deprecated — remove after migration)
    if firebase_credential is None:
        legacy_credentials_path = os.path.join(
            settings.BASE_DIR, 'core', 'finot-27952-firebase-adminsdk-fbsvc-ee52336fec.json'
        )
        if os.path.exists(legacy_credentials_path):
            logger.warning(
                "Firebase Admin: falling back to hardcoded JSON file. "
                "Please migrate to FIREBASE_CREDENTIALS_B64 env var."
            )
            try:
                firebase_credential = credentials.Certificate(legacy_credentials_path)
            except Exception as error:
                logger.error("Firebase Admin: failed to load legacy file: %s", error)

    if firebase_credential:
        try:
            firebase_admin.initialize_app(firebase_credential)
            logger.info("Firebase Admin initialized successfully.")
        except Exception as error:
            logger.error("Failed to initialize Firebase Admin: %s", error)
    else:
        logger.warning("Firebase Admin: no credentials found. Push notifications disabled.")


def _send_fcm_multicast(title, body, notification_type, device_tokens):
    """
    Sends an FCM push notification to a list of device tokens in batches of 500.
    Automatically cleans up invalid device tokens.
    Returns True if fully successful (or no devices), False on error.
    """
    if not device_tokens:
        return True

    chunk_size = 500
    success_overall = True

    for i in range(0, len(device_tokens), chunk_size):
        chunk = device_tokens[i:i + chunk_size]
        fcm_multicast_message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data={
                'type': notification_type,
            },
            tokens=chunk,
        )

        try:
            send_response = messaging.send_multicast(fcm_multicast_message)
            if send_response.failure_count > 0:
                invalid_device_tokens = []
                for token_index, individual_response in enumerate(send_response.responses):
                    if not individual_response.success:
                        error_code = individual_response.exception.code
                        if error_code in [
                            'messaging/invalid-registration-token',
                            'messaging/registration-token-not-registered',
                        ]:
                            invalid_device_tokens.append(chunk[token_index])

                if invalid_device_tokens:
                    FCMDeviceToken.objects.filter(device_token__in=invalid_device_tokens).delete()
        except Exception as error:
            logger.error("Error sending FCM message chunk: %s", error, exc_info=True)
            success_overall = False

    return success_overall


def _send_fcm_to_user(user, title, body, notification_type):
    """
    Sends an FCM push notification to all devices registered by a single user.
    """
    device_tokens = list(
        FCMDeviceToken.objects.filter(user=user).values_list('device_token', flat=True)
    )
    return _send_fcm_multicast(title, body, notification_type, device_tokens)


class PushChannel(NotificationChannel):
    """
    Sends Firebase Cloud Messaging push notifications.
    Logic extracted from core/notifications.py.

    Firebase is initialized once when the channel is first instantiated.
    """

    def __init__(self):
        _initialize_firebase()

    def on_payment_completed(self, payment):
        if not (hasattr(payment, "student_donation") and payment.student_donation):
            return  # Guest donations have no user to push to

        user = payment.student_donation.student
        _send_fcm_to_user(
            user=user,
            title="Donation Successful",
            body=f"We received your donation of {payment.amount} ETB. Thank you!",
            notification_type=Notification.TYPE_DONATION,
        )

    def on_payment_failed(self, payment):
        if not (hasattr(payment, "student_donation") and payment.student_donation):
            return

        user = payment.student_donation.student
        _send_fcm_to_user(
            user=user,
            title="Donation Failed",
            body=f"Your donation of {payment.amount} ETB could not be verified.",
            notification_type=Notification.TYPE_DONATION,
        )

    def on_event_published(self, event):
        """Push notification to relevant active users about a new event efficiently."""
        from service.models import ServiceGroupMembership

        tokens_qs = FCMDeviceToken.objects.filter(user__is_active=True)

        if event.service_group:
            tokens_qs = tokens_qs.filter(
                user__service_membership__service_group=event.service_group,
                user__service_membership__status=ServiceGroupMembership.ACTIVE
            )

        device_tokens = list(tokens_qs.values_list('device_token', flat=True))

        if not device_tokens:
            return

        title = f"New Event: {event.title}"
        body = f"{event.title} is scheduled for {event.start_date.strftime('%B %d, %Y at %I:%M %p')}."

        _send_fcm_multicast(
            title=title,
            body=body,
            notification_type=Notification.TYPE_EVENT,
            device_tokens=device_tokens
        )

    def on_question_answered(self, answer):
        """Push notification to the asker when their private question is answered."""
        question = answer.question
        if question.user is None:
            return  # Shouldn't happen (private questions require auth), but safety check

        _send_fcm_to_user(
            user=question.user,
            title="Your Question Has Been Answered",
            body=(
                f"A counselor has answered your private question "
                f"in the \"{question.category}\" category."
            ),
            notification_type=Notification.TYPE_QA,
        )

