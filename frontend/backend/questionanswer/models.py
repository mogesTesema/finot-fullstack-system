import uuid
from django.db import models
from django.conf import settings

class Question(models.Model):
    """
    Stores anonymous questions for the counseling platform.
    """
    CAT_ACADEMIC = "Academic"
    CAT_SPIRITUAL = "Spiritual"
    CAT_FAMILY = "Family"
    CAT_PERSONAL = "Personal"
    OTHER = "Other"
    
    CATEGORY_CHOICES = [
        (CAT_ACADEMIC, "Academic"),
        (CAT_SPIRITUAL, "Spiritual"),
        (CAT_FAMILY, "Family"),
        (CAT_PERSONAL, "Personal"),
        (OTHER, "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="questions"
    )
    
    display_name = models.CharField(max_length=100, help_text="Nickname")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    question_body = models.TextField()
    
    is_approved = models.BooleanField(default=False, help_text="Moderation flag")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.display_name} - {self.category}"


class Answer(models.Model):
    """
    Stores answers to approved questions.
    """
    question = models.ForeignKey(
        Question, 
        on_delete=models.CASCADE, 
        related_name="answers"
    )
    
    # The person answering, typically an authorized user (e.g., priest/counselor).
    responder = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    display_name = models.CharField(max_length=100, help_text="How the answerer appears")
    answer_body = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False, help_text="Moderation flag")


    def __str__(self):
        return f"Answer to {self.question.id} by {self.display_name}"
