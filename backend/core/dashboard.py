import logging
import json
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.conf import settings

logger = logging.getLogger(__name__)


def _safe_query(func, default=0):
    """Run a database query safely, returning default on any error."""
    try:
        return func()
    except Exception as e:
        logger.warning(f"Dashboard query failed: {e}")
        return default


def environment_callback(request):
    """
    Returns environment label and color for the admin header badge.
    """
    if settings.DEBUG:
        return ["Development", "warning"]
    return ["Production", "danger"]


def dashboard_callback(request, context):
    """
    Prepares custom variables for the admin dashboard (templates/admin/index.html).
    Injects stat card counts and chart data for Chart.js.
    All queries are wrapped in error handling to prevent dashboard crashes.
    """
    # Import here to avoid circular imports and handle missing tables gracefully
    from core.models import User, Notification
    from student.models import StudentProfile
    from donation.models import Payment, StudentDonation
    from questionanswer.models import Question
    from service.models import ServiceAttendance, Event, ServiceGroup, Family

    # ── Stat Cards ──────────────────────────────────────────────────
    total_users = _safe_query(lambda: User.objects.count())
    active_students = _safe_query(lambda: StudentProfile.objects.filter(status="IN_CAMPUS").count())

    try:
        total_donations_agg = Payment.objects.filter(status="COMPLETED").aggregate(total=Sum("amount"))["total"]
        total_donations = float(total_donations_agg) if total_donations_agg is not None else 0.0
    except Exception as e:
        logger.warning(f"Dashboard: total_donations query failed: {e}")
        total_donations = 0.0

    pending_questions = _safe_query(lambda: Question.objects.filter(is_approved=False).count())
    total_events = _safe_query(lambda: Event.objects.count())
    total_families = _safe_query(lambda: Family.objects.count())
    total_service_groups = _safe_query(lambda: ServiceGroup.objects.count())
    unread_notifications = _safe_query(lambda: Notification.objects.filter(is_read=False).count())

    # ── Donations Over Time (last 6 months) ─────────────────────────
    donation_months = []
    donation_amounts = []
    donation_counts = []
    try:
        donations_qs = (
            Payment.objects.filter(status="COMPLETED")
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-month")[:6]
        )
        donations_by_month = list(donations_qs)
        donations_by_month.reverse()

        for entry in donations_by_month:
            donation_months.append(entry["month"].strftime("%b %Y") if entry["month"] else "N/A")
            donation_amounts.append(float(entry["total"] or 0))
            donation_counts.append(entry["count"])
        
        if not donation_months:
            donation_months = ["No Data"]
            donation_amounts = [0]
            donation_counts = [0]
    except Exception as e:
        logger.warning(f"Dashboard: donations over time query failed: {e}")
        donation_months = ["Error"]
        donation_amounts = [0]
        donation_counts = [0]

    # ── Donations by Fund Category ──────────────────────────────────
    fund_labels = []
    fund_amounts = []
    try:
        donations_by_fund = list(
            StudentDonation.objects.values("fund_category")
            .annotate(total=Sum("payment__amount"), count=Count("id"))
            .order_by("-total")[:5]
        )
        fund_labels = [d["fund_category"] for d in donations_by_fund]
        fund_amounts = [float(d["total"] or 0) for d in donations_by_fund]
        
        if not fund_labels:
            fund_labels = ["No Data"]
            fund_amounts = [0]
    except Exception as e:
        logger.warning(f"Dashboard: donations by fund query failed: {e}")
        fund_labels = ["Error"]
        fund_amounts = [0]

    # ── Students by Department ──────────────────────────────────────
    dept_labels = []
    dept_counts = []
    try:
        students_by_dept = list(
            StudentProfile.objects.filter(status="IN_CAMPUS")
            .exclude(department__isnull=True)
            .exclude(department="")
            .values("department")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        dept_labels = [d["department"] for d in students_by_dept]
        dept_counts = [d["count"] for d in students_by_dept]
        
        if not dept_labels:
            dept_labels = ["No Data"]
            dept_counts = [0]
    except Exception as e:
        logger.warning(f"Dashboard: students by dept query failed: {e}")
        dept_labels = ["Error"]
        dept_counts = [0]

    # ── Attendance Rate ─────────────────────────────────────────────
    attendance_present = _safe_query(lambda: ServiceAttendance.objects.filter(status="PRESENT").count())
    attendance_late = _safe_query(lambda: ServiceAttendance.objects.filter(status="LATE").count())
    attendance_absent = _safe_query(lambda: ServiceAttendance.objects.filter(status="ABSENT").count())
    attendance_excused = _safe_query(lambda: ServiceAttendance.objects.filter(status="EXCUSED").count())
    attendance_total = _safe_query(lambda: ServiceAttendance.objects.count())

    # ── Events by Status ────────────────────────────────────────────
    events_upcoming = _safe_query(lambda: Event.objects.filter(status="UPCOMING").count())
    events_ongoing = _safe_query(lambda: Event.objects.filter(status="ONGOING").count())
    events_completed = _safe_query(lambda: Event.objects.filter(status="COMPLETED").count())

    context.update(
        {
            # Stat cards
            "total_users": total_users,
            "active_students": active_students,
            "total_donations": f"{total_donations:,.2f}" if isinstance(total_donations, (int, float)) else "0.00",
            "pending_questions": pending_questions,
            "total_events": total_events,
            "total_families": total_families,
            "total_service_groups": total_service_groups,
            "unread_notifications": unread_notifications,
            # Donations over time chart
            "donation_months": json.dumps(donation_months),
            "donation_amounts": json.dumps(donation_amounts),
            "donation_counts": json.dumps(donation_counts),
            # Donations by fund chart
            "fund_labels": json.dumps(fund_labels),
            "fund_amounts": json.dumps(fund_amounts),
            # Students by department chart
            "dept_labels": json.dumps(dept_labels),
            "dept_counts": json.dumps(dept_counts),
            # Attendance chart
            "attendance_present": attendance_present or 0,
            "attendance_late": attendance_late or 0,
            "attendance_absent": attendance_absent or 0,
            "attendance_excused": attendance_excused or 0,
            "attendance_total": attendance_total or 0,
            # Events by status
            # Events by status
            "events_upcoming": events_upcoming or 0,
            "events_ongoing": events_ongoing or 0,
            "events_completed": events_completed or 0,
        }
    )

    return context
