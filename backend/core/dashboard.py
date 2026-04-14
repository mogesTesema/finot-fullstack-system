import logging
from django.conf import settings
from django.http import HttpRequest
from typing import Any, Dict, List

from core.dashboard_registry import collect_all_stats

logger = logging.getLogger(__name__)


def environment_callback(request: HttpRequest) -> List[str]:
    """
    Returns environment label and color for the admin header badge.
    """
    if settings.DEBUG:
        return ["Development", "warning"]
    return ["Production", "danger"]


def dashboard_callback(request: HttpRequest, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepares custom variables for the admin dashboard (templates/admin/index.html).
    Uses the dashboard registry to collect stats from feature apps,
    keeping core decoupled from child apps.
    """
    from core.models import User, Notification

    # Core-owned stats (User and Notification belong to this app)
    try:
        total_users = User.objects.count()
    except Exception as e:
        logger.warning(f"Dashboard: total_users query failed: {e}")
        total_users = 0

    try:
        unread_notifications = Notification.objects.filter(is_read=False).count()
    except Exception as e:
        logger.warning(f"Dashboard: unread_notifications query failed: {e}")
        unread_notifications = 0

    context.update({
        "total_users": total_users,
        "unread_notifications": unread_notifications,
    })

    # Collect all registered stats from feature apps (student, donation, service, qa)
    # Each provider is wrapped in error handling inside the registry.
    feature_stats = collect_all_stats()
    context.update(feature_stats)

    return context
