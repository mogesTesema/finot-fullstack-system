"""
Remove FCMDeviceToken and Notification from core's state.

This is the counterpart to notifications/0001_initial.py.
The notifications app has already taken ownership of the database tables
(renamed from core_* to notifications_*), so this migration only removes
the models from core's Django state — no SQL is executed.
"""

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        # Must run after notifications has taken ownership of the tables.
        ("notifications", "0001_initial"),
        ("core", "0003_fcmdevicetoken_notification"),
    ]

    operations = [
        # Remove models from core's state only — no database changes.
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(name="FCMDeviceToken"),
            ],
            database_operations=[],
        ),
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(name="Notification"),
            ],
            database_operations=[],
        ),
    ]
