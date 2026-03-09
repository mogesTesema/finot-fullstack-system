from django.db import models
from django.conf import settings
import uuid

class Payment(models.Model):
    """
    Stores financial transaction information.
    Separated from donation logic for integrity.
    """
    STATUS_PENDING = "PENDING"
    STATUS_COMPLETED = "COMPLETED"
    STATUS_FAILED = "FAILED"
    
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_FAILED, "Failed"),
    ]

    # Payment ID can be AutoField (int), but tx_ref is usually UUID/String
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="ETB")
    
    # Transaction reference from Chapa (UUID or String)
    transaction_reference = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default=STATUS_PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_reference} - {self.amount} {self.currency}"


class StudentDonation(models.Model):
    """
    Donation made by registered students.
    """
    FUND_WEEKLY = "Weekly Donation"
    FUND_BUILDING = "Building Fund"
    FUND_CHARITY = "Charity (Poor)"
    FUND_SPECIAL_EVENT = "Special Events"
    FUND_OTHER = "Other"
    
    FUND_CHOICES = [
        (FUND_WEEKLY, "Weekly Collection"),
        (FUND_BUILDING, "Building Fund"),
        (FUND_CHARITY, "Charity"),
        (FUND_SPECIAL_EVENT, "Special Events"),
        (FUND_OTHER, "Other")
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="donations"
    )
    fund_category = models.CharField(max_length=50, choices=FUND_CHOICES)
    
    # OneToOne ensures one payment record belongs strictly to this donation.
    # Logic: 1 Payment = 1 Donation Purpose.
    payment = models.OneToOneField(
        Payment, 
        on_delete=models.CASCADE,
        related_name="student_donation"
    )
    
    donated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.fund_category}"


class NonStudentDonation(models.Model):
    """
    Donation made by guests (no user account).
    """
    FUND_WEEKLY = "WEEKLY"
    FUND_BUILDING = "BUILDING"
    FUND_CHARITY = "CHARITY"
    
    FUND_CHOICES = [
        (FUND_WEEKLY, "Weekly Collection"),
        (FUND_BUILDING, "Building Fund"),
        (FUND_CHARITY, "Charity"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    
    fund_category = models.CharField(max_length=50, choices=FUND_CHOICES)
    
    # OneToOne ensures one payment record belongs strictly to this donation
    payment = models.OneToOneField(
        Payment, 
        on_delete=models.CASCADE,
        related_name="guest_donation"
    )
    
    donated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Guest: {self.first_name} - {self.fund_category}"
