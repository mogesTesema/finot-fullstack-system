"""Dashboard stat providers for the service app."""
import logging

logger = logging.getLogger(__name__)


def get_service_stats() -> dict:
    """Return service/ministry-related dashboard statistics."""
    from service.models import ServiceAttendance, Event, ServiceGroup, Family

    total_event_count = Event.objects.count()
    total_family_count = Family.objects.count()
    total_service_group_count = ServiceGroup.objects.count()

    # Attendance breakdown by status
    present_count = ServiceAttendance.objects.filter(status="PRESENT").count()
    late_count = ServiceAttendance.objects.filter(status="LATE").count()
    absent_count = ServiceAttendance.objects.filter(status="ABSENT").count()
    excused_count = ServiceAttendance.objects.filter(status="EXCUSED").count()
    total_attendance_count = ServiceAttendance.objects.count()

    # Events breakdown by status
    upcoming_event_count = Event.objects.filter(status="UPCOMING").count()
    ongoing_event_count = Event.objects.filter(status="ONGOING").count()
    completed_event_count = Event.objects.filter(status="COMPLETED").count()

    return {
        "total_events": total_event_count,
        "total_families": total_family_count,
        "total_service_groups": total_service_group_count,
        "attendance_present": present_count,
        "attendance_late": late_count,
        "attendance_absent": absent_count,
        "attendance_excused": excused_count,
        "attendance_total": total_attendance_count,
        "events_upcoming": upcoming_event_count,
        "events_ongoing": ongoing_event_count,
        "events_completed": completed_event_count,
    }
