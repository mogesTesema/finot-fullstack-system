import os
import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings
from .models import FCMDeviceToken, Notification

# Initialize Firebase Admin SDK
def initialize_firebase():
    if not firebase_admin._apps:
        # Path to the service account JSON file you provided
        cred_path = os.path.join(settings.BASE_DIR, 'core', 'finot-27952-firebase-adminsdk-fbsvc-ee52336fec.json')
        if os.path.exists(cred_path):
            try:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin initialized successfully.")
            except Exception as e:
                print(f"Failed to initialize Firebase Admin: {e}")
        else:
            print(f"Firebase credentials not found at {cred_path}")

# Call it when module loads
initialize_firebase()

def send_push_notification(user=None, user_id=None, title="", message="", body="", notification_type=Notification.TYPE_SYSTEM):
    """
    Saves a Notification to the DB and pushes it to all the user's registered FCM devices.
    Accepts either a User object (user=) or an integer user ID (user_id=).
    Accepts message= or body= for the notification body text.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    # Resolve the user object
    if user is None and user_id is not None:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            print(f"send_push_notification: User with id {user_id} not found.")
            return False

    if not user:
        return False

    # Allow body= as an alias for message=
    notification_body = message or body
    if not notification_body:
        notification_body = title  # fallback

    # 1. Save to Database
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=notification_body,
        notification_type=notification_type
    )

    # 2. Push to FCM
    tokens = FCMDeviceToken.objects.filter(user=user).values_list('device_token', flat=True)
    
    if not tokens:
        return True # Handled successfully (saved to DB, just no devices to ping)

    # Prepare message body
    # We use MulticastMessage to send to multiple devices owned by the same user
    fcm_message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=message,
        ),
        data={
            'type': notification_type,
            'id': str(notification.id)
        },
        tokens=list(tokens),
    )

    try:
        response = messaging.send_multicast(fcm_message)
        # Check for invalid tokens and clean them up
        if response.failure_count > 0:
            responses = response.responses
            invalid_tokens = []
            for idx, resp in enumerate(responses):
                if not resp.success:
                    # Common errors for dead tokens: class NotRegisteredError
                    if resp.exception.code in ['messaging/invalid-registration-token', 'messaging/registration-token-not-registered']:
                        invalid_tokens.append(tokens[idx])
            
            if invalid_tokens:
                FCMDeviceToken.objects.filter(device_token__in=invalid_tokens).delete()
                
        return True
    except Exception as e:
        print(f"Error sending FCM message: {e}")
        return False
