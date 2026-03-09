import uuid
from django.db import models
from django.conf import settings

# Create your models here.


class StudentProfile(models.Model):
    """
    Contains student-specific information.
    Linked to the main User model via OneToOneField.
    """
    IN_CAMPUS = "IN_CAMPUS"
    GRADUATED = "GRADUATED"
    STATUS_CHOICES = [
        (IN_CAMPUS, "In Campus"),
        (GRADUATED, "Graduated"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_profile"
    )
    
    # Personal Info
    profile_image = models.ImageField(upload_to="student_profiles/", blank=True, null=True)
    
    # Academic Info
    batch_year = models.IntegerField(blank=True, null=True, help_text="1-5")
    department = models.CharField(max_length=100, blank=True, null=True)
    
    # Contact Info
    telegram_username = models.CharField(max_length=50, blank=True, null=True)
    personal_phone = models.CharField(max_length=15, blank=True, null=True)
    
    # Emergency Contact
    emergency_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_phone = models.CharField(max_length=15, blank=True, null=True)
    emergency_relation = models.CharField(max_length=50, blank=True, null=True)
    
    # Church/Dorm Info
    home_address = models.CharField(max_length=255, blank=True, null=True)
    previous_church = models.CharField(max_length=150, blank=True, null=True)
    activity_serving = models.CharField(max_length=150, blank=True, null=True, help_text="Current church role")
    dorm_block = models.PositiveIntegerField(blank=True, null=True, help_text="Block Number")
    dorm_room = models.PositiveIntegerField(blank=True, null=True, help_text="Room Number")
    confession_father = models.CharField(max_length=100, blank=True, null=True, help_text="የንስሐ አባት ስም")
    
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=IN_CAMPUS
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} Profile"
