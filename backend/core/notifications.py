import os
import json
import base64
import logging
import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings
from .models import FCMDeviceToken, Notification

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
def initialize_firebase():
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
            logger.error(f"Firebase Admin: failed to parse FIREBASE_CREDENTIALS_B64: {error}")

    # Priority 2: GOOGLE_APPLICATION_CREDENTIALS file path (standard GCP convention)
    if firebase_credential is None:
        gcp_credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if gcp_credentials_path and os.path.exists(gcp_credentials_path):
            try:
                firebase_credential = credentials.Certificate(gcp_credentials_path)
                logger.info("Firebase Admin: using GOOGLE_APPLICATION_CREDENTIALS file.")
            except Exception as error:
                logger.error(f"Firebase Admin: failed to load GOOGLE_APPLICATION_CREDENTIALS: {error}")

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
                logger.error(f"Firebase Admin: failed to load legacy file: {error}")

    if firebase_credential:
        try:
            firebase_admin.initialize_app(firebase_credential)
            logger.info("Firebase Admin initialized successfully.")
        except Exception as error:
            logger.error(f"Failed to initialize Firebase Admin: {error}")
    else:
        logger.warning("Firebase Admin: no credentials found. Push notifications disabled.")

# Call it when module loads
initialize_firebase()

def send_push_notification(user=None, user_id=None, title="", message="", body="", notification_type=Notification.TYPE_SYSTEM):
    """
    Saves a Notification to the DB and pushes it to all the user's registered FCM devices.
    Accepts either a User object (user=) or an integer user ID (user_id=).
    Accepts message= or body= for the notification body text.
    """
    from django.contrib.auth import get_user_model
    UserModel = get_user_model()

    # Resolve the user object
    if user is None and user_id is not None:
        try:
            user = UserModel.objects.get(id=user_id)
        except UserModel.DoesNotExist:
            logger.warning(f"send_push_notification: User with id {user_id} not found.")
            return False

    if not user:
        return False

    # Allow body= as an alias for message=
    notification_body = message or body
    if not notification_body:
        notification_body = title  # fallback

    # 1. Save to Database
    saved_notification = Notification.objects.create(
        user=user,
        title=title,
        message=notification_body,
        notification_type=notification_type,
    )

    # 2. Push to FCM
    device_tokens = FCMDeviceToken.objects.filter(user=user).values_list('device_token', flat=True)

    if not device_tokens:
        return True  # Handled successfully (saved to DB, just no devices to ping)

    # Prepare FCM multicast message for all devices owned by the same user
    fcm_multicast_message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=notification_body,
        ),
        data={
            'type': notification_type,
            'id': str(saved_notification.id),
        },
        tokens=list(device_tokens),
    )

    try:
        send_response = messaging.send_multicast(fcm_multicast_message)
        # Check for invalid tokens and clean them up
        if send_response.failure_count > 0:
            invalid_device_tokens = []
            for token_index, individual_response in enumerate(send_response.responses):
                if not individual_response.success:
                    error_code = individual_response.exception.code
                    if error_code in [
                        'messaging/invalid-registration-token',
                        'messaging/registration-token-not-registered',
                    ]:
                        invalid_device_tokens.append(device_tokens[token_index])

            if invalid_device_tokens:
                FCMDeviceToken.objects.filter(device_token__in=invalid_device_tokens).delete()

        return True
    except Exception as error:
        logger.error(f"Error sending FCM message: {error}")
        return False
