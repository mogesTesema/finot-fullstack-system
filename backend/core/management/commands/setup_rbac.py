from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from core.models import Role

class Command(BaseCommand):
    help = 'Setup Django Groups and default Permissions for custom Roles'

    def handle(self, *args, **kwargs):
        # 1. Define groups corresponding to the custom roles
        self.stdout.write("Setting up RBAC Groups and Permissions...")
        
        # SuperAdmin has is_superuser, so no group needed, but let's create it for consistency
        super_admin_group, _ = Group.objects.get_or_create(name=Role.SUPER_ADMIN)
        
        # Service Admin
        service_admin_group, _ = Group.objects.get_or_create(name=Role.SERVICE_ADMIN)
        
        # Family Admin
        family_admin_group, _ = Group.objects.get_or_create(name=Role.FAMILY_ADMIN)
        
        # Student (usually has no dashboard access, so no permissions)
        student_group, _ = Group.objects.get_or_create(name=Role.STUDENT)

        # 2. Assign some default permissions to ServiceAdmin as an example
        # In a real scenario, you give them what they need.
        # Let's give ServiceAdmin access to everything in "service", "donation", "student", "questionanswer"
        apps_for_service_admin = ['service', 'donation', 'student', 'questionanswer']
        
        permissions = Permission.objects.filter(content_type__app_label__in=apps_for_service_admin)
        service_admin_group.permissions.set(permissions)
        
        # Let's give FamilyAdmin access ONLY to "service" objects
        family_permissions = Permission.objects.filter(content_type__app_label='service')
        family_admin_group.permissions.set(family_permissions)

        self.stdout.write(self.style.SUCCESS('Successfully setup RBAC Groups and Permissions'))
