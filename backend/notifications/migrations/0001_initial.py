"""
Notifications app initial migration.

This migration takes ownership of the FCMDeviceToken and Notification models
that were originally created in the 'core' app (core migration 0003).

Strategy: SeparateDatabaseAndState
- State operation: Create the model definitions in this app's state.
- Database operation: Rename the existing tables from core_* to notifications_*.

This preserves all existing data with zero downtime.
"""

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        # This migration must run after core's migration that created these models.
        ("core", "0003_fcmdevicetoken_notification"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # --- FCMDeviceToken ---
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name="FCMDeviceToken",
                    fields=[
                        ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                        ("device_token", models.CharField(max_length=255, unique=True)),
                        ("created_at", models.DateTimeField(auto_now_add=True)),
                        ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="fcm_tokens", to=settings.AUTH_USER_MODEL)),
                    ],
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql='ALTER TABLE "core_fcmdevicetoken" RENAME TO "notifications_fcmdevicetoken";',
                    reverse_sql='ALTER TABLE "notifications_fcmdevicetoken" RENAME TO "core_fcmdevicetoken";',
                ),
            ],
        ),

        # --- Notification ---
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name="Notification",
                    fields=[
                        ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                        ("title", models.CharField(max_length=200)),
                        ("message", models.TextField()),
                        ("notification_type", models.CharField(choices=[("EVENT", "Event"), ("DONATION", "Donation"), ("REMINDER", "Reminder"), ("SYSTEM", "System")], default="SYSTEM", max_length=20)),
                        ("is_read", models.BooleanField(default=False)),
                        ("created_at", models.DateTimeField(auto_now_add=True)),
                        ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        "ordering": ["-created_at"],
                    },
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql='ALTER TABLE "core_notification" RENAME TO "notifications_notification";',
                    reverse_sql='ALTER TABLE "notifications_notification" RENAME TO "core_notification";',
                ),
            ],
        ),
    ]
