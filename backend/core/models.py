from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

# Create your models here.

class Role(models.Model):
    """
    Defines system-level permissions.
    """
    STUDENT = "Student"
    SERVICE_ADMIN = "ServiceAdmin"
    SUPER_ADMIN = "SuperAdmin"
    FAMILY_ADMIN = "FamilyAdmin"
    
    ROLE_CHOICES = [
        (STUDENT, "Student"),
        (FAMILY_ADMIN, "Family Admin"),
        (SERVICE_ADMIN, "Service Admin"),
        (SUPER_ADMIN, "Super Admin"),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    """
    Stores system authentication information.
    Identity management only.
    """
    email = models.EmailField(_('email address'), unique=True)
    middle_name = models.CharField(max_length=150, blank=True)
    
    GENDER_MALE = "M"
    GENDER_FEMALE = "F"
    GENDER_CHOICES = [
        (GENDER_MALE, "Male"),
        (GENDER_FEMALE, "Female"),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    
    # Roles mapping (Many-to-Many through UserRole)
    roles = models.ManyToManyField(Role, through='UserRole', related_name='users')

    def __str__(self):
        return self.username


class UserRole(models.Model):
    """
    Many-to-Many mapping between users and roles.
    Allows a student to also be an admin, multiple roles per user.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'role')
    
    def __str__(self):
        return f"{self.user} - {self.role}"