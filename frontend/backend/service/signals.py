from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Event
from core.models import User
from core.emails import notify_new_event

@receiver(post_save, sender=Event)
def notify_students_of_new_event(sender, instance, created, **kwargs):
    """
    Sends email when a NEW event is created.
    """
    if created and instance.status == Event.UPCOMING:
        # Get all active students with emails
        # This can be optimized later for filtering by specific groups
        active_users = User.objects.filter(is_active=True).exclude(email='').exclude(email__isnull=True)
        
        recipient_emails = list(active_users.values_list('email', flat=True))
        
        # Don't send empty emails or spam everyone in dev
        # In PRD, maybe use Celery for this loop
        if recipient_emails:
            print(f"Signal: Sending event email to {len(recipient_emails)} users...")
            # For hackathon: Send individually or BCC to avoid exposing emails
            # Using loop for now (simpler), catch errors per user
            for email in recipient_emails:
                notify_new_event(instance, [email])
