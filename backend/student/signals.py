from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import StudentProfile

User = get_user_model()

@receiver(post_save, sender=User)
def create_student_profile(sender, instance, created, **kwargs):
    """
    Automatically creates a StudentProfile for every new User instance.
    """
    if created:
        StudentProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_student_profile(sender, instance, **kwargs):
    """
    Saves the StudentProfile whenever the User is saved.
    """
    if hasattr(instance, 'student_profile'):
        instance.student_profile.save()

