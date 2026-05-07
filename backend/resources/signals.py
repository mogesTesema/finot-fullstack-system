from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from .models import Material

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
