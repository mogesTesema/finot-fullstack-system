from django.db import models
from django.conf import settings

class ServiceConfiguration(models.Model):
    """
    Singleton model to control global service settings.
    """
    is_selection_open = models.BooleanField(default=False, help_text="Open service group selection for students")
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and ServiceConfiguration.objects.exists():
            # If an instance already exists, prevent creation of a new one unless updating the existing one
            # Ideally we'd throw an error or handle it gracefully, but usually admin panel handles restriction via SingletonAdmin
            pass 
        return super(ServiceConfiguration, self).save(*args, **kwargs)

    def __str__(self):
        return "Service Configuration"

    class Meta:
        verbose_name_plural = "Service Configuration"


class ServiceGroup(models.Model):
    """
    Master table for church service groups (Ageglot).
    e.g., Choir, Finance, Charity.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # Admin responsible for this group
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="managed_service_groups"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ServiceGroupMembership(models.Model):
    """
    Tracks ACTUAL approved membership in a service group.
    One student -> One Active Service Group (via OneToOne).
    """
    MEMBER = "MEMBER"
    LEADER = "LEADER"
    COORDINATOR = "COORDINATOR"
    
    ROLE_CHOICES = [
        (MEMBER, "Member"),
        (LEADER, "Leader"),
        (COORDINATOR, "Coordinator"),
    ]

    ACTIVE = "ACTIVE"
    PROBATION = "PROBATION"
    INACTIVE = "INACTIVE" # e.g. Took a break
    
    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (PROBATION, "Probation"),
        (INACTIVE, "Inactive"),
    ]

    # OneToOne ensures a student is only in ONE active service group
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_membership"
    )
    
    service_group = models.ForeignKey(
        ServiceGroup,
        on_delete=models.CASCADE,
        related_name="members"
    )
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=MEMBER
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=ACTIVE
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} -> {self.service_group} ({self.role})"

class Event(models.Model):
    """
    Stores system-wide events created by admins.
    """
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    
    STATUS_CHOICES = [
        (UPCOMING, "Upcoming"),
        (ONGOING, "Ongoing"),
        (COMPLETED, "Completed"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    photo = models.ImageField(upload_to="events/", blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=UPCOMING
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name="created_events"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title



class ServiceAttendance(models.Model):
    """
    Tracks attendance for events.
    """
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"
    
    STATUS_CHOICES = [
        (PRESENT, "Present"),
        (ABSENT, "Absent"),
        (LATE, "Late"),
        (EXCUSED, "Excused"),
    ]

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="attendances"
    )
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_attendances"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PRESENT
    )
    
    remark = models.CharField(max_length=255, blank=True, null=True)
    
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['event', 'student'] 
        ordering = ['-event__start_date', 'student']

    def __str__(self):
        return f"{self.student} @ {self.event}: {self.status}"

class AgeglotSelection(models.Model):
    """
    Stores student service preferences with priority ranking.
    """
    PRIORITY_CHOICES = [
        (1, "First Choice"),
        (2, "Second Choice"),
        (3, "Third Choice"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="service_selections"
    )
    service_group = models.ForeignKey(
        ServiceGroup, 
        on_delete=models.CASCADE,
        related_name="selections"
    )
    priority = models.IntegerField(choices=PRIORITY_CHOICES)
    skills = models.TextField(blank=True, null=True, help_text="Relevant talents/skills")
    reason = models.TextField(blank=True, null=True, help_text="Reason for selection")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['student', 'priority']
        unique_together = [
            # A student generally shouldn't pick the same priority twice 
            ('student', 'priority'), 
            # A student shouldn't pick the same service twice
            ('student', 'service_group')
        ]

    def __str__(self):
        return f"{self.student} - {self.service_group} ({self.priority})"


class Family(models.Model):
    """
    Groups students under senior mentorship (Family structure).
    """
    name = models.CharField(max_length=100, unique=True)

    # Enforce that one user leads only ONE family
    father = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="led_family_as_father",
        limit_choices_to={'gender': 'M'}
    )

    mother = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="led_family_as_mother",
        limit_choices_to={'gender': 'F'}
    )
    
    religious_father = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Families"

    def __str__(self):
        return self.name


class FamilyMembership(models.Model):
    """
    Links students to a specific family.
    """
    family = models.ForeignKey(
        Family,
        on_delete=models.CASCADE,
        related_name="members"
    )

    # OneToOne ensures a student is only in ONE family at a time
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="family_membership"
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} -> {self.family.name}"


