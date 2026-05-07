import uuid
from django.db import models
from django.conf import settings


class Material(models.Model):
    """
    A unified, reusable material registry.
    Materials are created once and persist across semesters.

    Three scopes:
      - COURSE:   Tied to a static Course curriculum + batch_year.
      - SERVICE:  Tied to a specific ServiceGroup.
      - GENERAL:  Available to all active students.
    """

    class MaterialType(models.TextChoices):
        COURSE = "COURSE", "Course Material"
        SERVICE = "SERVICE", "Service Group Material"
        GENERAL = "GENERAL", "General Material"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to="materials/", blank=True, null=True)
    url = models.URLField(
        blank=True, null=True, help_text="Optional external link (YouTube, Drive, etc.)"
    )

    material_type = models.CharField(
        max_length=20,
        choices=MaterialType.choices,
        help_text="Determines the visibility scope of this material.",
    )

    # --- Scope foreign keys (nullable based on material_type) ---
    course = models.ForeignKey(
        "course.Course",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="materials",
        help_text="Required when material_type is COURSE.",
    )
    service_group = models.ForeignKey(
        "service.ServiceGroup",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="materials",
        help_text="Required when material_type is SERVICE.",
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_materials",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["material_type"]),
            models.Index(fields=["course"]),
            models.Index(fields=["service_group"]),
        ]

    def __str__(self):
        return f"[{self.material_type}] {self.title}"


from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver

@receiver(pre_delete, sender=Material)
def delete_material_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from Cloudinary (or local storage) when the Material object is deleted.
    """
    if instance.file:
        instance.file.delete(save=False)

@receiver(pre_save, sender=Material)
def delete_old_material_file_on_update(sender, instance, **kwargs):
    """
    Deletes old file from Cloudinary when the file is updated.
    """
    if not instance.pk:
        return

    try:
        old_file = Material.objects.get(pk=instance.pk).file
    except Material.DoesNotExist:
        return

    new_file = instance.file
    if old_file and old_file != new_file:
        old_file.delete(save=False)
