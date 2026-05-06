from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import Group
from typing import Any
from .models import UserRole, Role

# Role names that grant basic admin panel access (is_staff)
STAFF_ROLES = [Role.SERVICE_ADMIN, Role.FAMILY_ADMIN, Role.SUPER_ADMIN]


@receiver(post_save, sender=UserRole)
def assign_django_group_on_role_save(
    sender: Any, instance: UserRole, created: bool, **kwargs: Any
) -> None:
    """
    When a UserRole is created/updated, map the custom Role to the native Django Group.
    Also update the user's is_staff or is_superuser status based on their custom Role.
    """
    user = instance.user
    role_name = instance.role.name

    # 1. Map to Django Group (if it exists)
    try:
        group = Group.objects.get(name=role_name)
        user.groups.add(group)
    except Group.DoesNotExist:
        # Group might not exist yet if setup_rbac command hasn't been run
        pass

    # 2. Update privileges
    privileges_changed = False

    if role_name in STAFF_ROLES and not user.is_staff:
        user.is_staff = True
        privileges_changed = True

    if role_name == Role.SUPER_ADMIN and not user.is_superuser:
        user.is_superuser = True
        privileges_changed = True

    if privileges_changed:
        user.save()


@receiver(post_delete, sender=UserRole)
def remove_django_group_on_role_delete(
    sender: Any, instance: UserRole, **kwargs: Any
) -> None:
    """
    When a UserRole is removed, take away the corresponding Django Group.
    Also check if they should lose is_staff / is_superuser status.
    """
    user = instance.user
    role_name = instance.role.name

    # 1. Remove from Django Group
    try:
        group = Group.objects.get(name=role_name)
        user.groups.remove(group)
    except Group.DoesNotExist:
        pass

    # 2. Re-evaluate overall privileges based on REMAINING roles
    remaining_roles = user.roles.values_list("name", flat=True)

    privileges_changed = False

    # Should they still be staff?
    has_staff_role = any(r in STAFF_ROLES for r in remaining_roles)
    if not has_staff_role and user.is_staff:
        user.is_staff = False
        # Also clean out superuser just in case
        user.is_superuser = False
        privileges_changed = True

    # Should they still be superuser?
    has_super_role = Role.SUPER_ADMIN in remaining_roles
    if not has_super_role and user.is_superuser:
        user.is_superuser = False
        privileges_changed = True

    if privileges_changed:
        user.save()
