import json
import logging
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth, TruncWeek, TruncDate
from django.utils import timezone
from course.models import AttendanceRecord
from donation.models import Payment
from questionanswer.models import Question
from student.models import StudentProfile

logger = logging.getLogger(__name__)

def parse_time_range(range_str):
    """
    Returns a start_date and an aggregation function (TruncDate, TruncWeek, TruncMonth)
    based on the requested range.
    """
    now = timezone.now()
    if range_str == '30d':
        return now - timedelta(days=30), TruncDate
    elif range_str == '3m':
        return now - timedelta(days=90), TruncWeek
    elif range_str == '6m':
        return now - timedelta(days=180), TruncMonth
    elif range_str == '9m':
        return now - timedelta(days=270), TruncMonth
    elif range_str == '1y':
        return now - timedelta(days=365), TruncMonth
    else:
        # Default: 6 months
        return now - timedelta(days=180), TruncMonth

def get_analytics_stats(request=None) -> dict:
    """
    Aggregator function that pulls time-series data across apps 
    based on the time ranges selected by the admin for each specific chart.
    """
    don_range = request.GET.get('don_range', '6m') if request else '6m'
    att_range = request.GET.get('att_range', '6m') if request else '6m'
    qa_range = request.GET.get('qa_range', '6m') if request else '6m'

    stats = {
        "don_range": don_range,
        "att_range": att_range,
        "qa_range": qa_range,
    }

    # ---------------------------------------------------------
    # 1. Donations Progress Over Time (Overrides donation/dashboard_stats)
    # ---------------------------------------------------------
    try:
        start_date, trunc_func = parse_time_range(don_range)
        monthly_donation_queryset = (
            Payment.objects.filter(status="COMPLETED", created_at__gte=start_date)
            .annotate(period=trunc_func("created_at"))
            .values("period")
            .annotate(total_amount=Sum("amount"), donation_count=Count("id"))
            .order_by("period")
        )
        
        d_labels = []
        d_amounts = []
        for entry in monthly_donation_queryset:
            if not entry["period"]: continue
            if trunc_func == TruncDate:
                label = entry["period"].strftime("%b %d")
            elif trunc_func == TruncWeek:
                label = f"Wk {entry['period'].isocalendar()[1]} ({entry['period'].strftime('%b')})"
            else:
                label = entry["period"].strftime("%b %Y")
                
            d_labels.append(label)
            d_amounts.append(float(entry["total_amount"] or 0))

        if not d_labels:
            d_labels = ["No Data"]
            d_amounts = [0]

        stats["donation_months"] = json.dumps(d_labels)
        stats["donation_amounts"] = json.dumps(d_amounts)
    except Exception as e:
        logger.warning(f"Analytics: Donation query failed: {e}")

    # ---------------------------------------------------------
    # 2. Attendance Progress Over Time
    # ---------------------------------------------------------
    try:
        start_date, trunc_func = parse_time_range(att_range)
        attendance_qs = (
            AttendanceRecord.objects.filter(date__gte=start_date.date())
            .annotate(period=trunc_func("date"))
            .values("period")
            .annotate(
                present_count=Count('id', filter=Q(status='PRESENT')),
                total_count=Count('id')
            )
            .order_by("period")
        )

        a_labels = []
        a_rates = []
        for entry in attendance_qs:
            if not entry["period"]: continue
            if trunc_func == TruncDate:
                label = entry["period"].strftime("%b %d")
            elif trunc_func == TruncWeek:
                label = f"Wk {entry['period'].isocalendar()[1]} ({entry['period'].strftime('%b')})"
            else:
                label = entry["period"].strftime("%b %Y")

            rate = (entry["present_count"] / entry["total_count"] * 100) if entry["total_count"] > 0 else 0
            a_labels.append(label)
            a_rates.append(round(rate, 1))

        if not a_labels:
            a_labels = ["No Data"]
            a_rates = [0]

        stats["attendance_progress_labels"] = json.dumps(a_labels)
        stats["attendance_progress_rates"] = json.dumps(a_rates)
    except Exception as e:
        logger.warning(f"Analytics: Attendance progress query failed: {e}")

    # ---------------------------------------------------------
    # 3. Q&A Progress and Status
    # ---------------------------------------------------------
    try:
        start_date, trunc_func = parse_time_range(qa_range)
        qa_qs = (
            Question.objects.filter(created_at__gte=start_date)
            .annotate(period=trunc_func("created_at"))
            .values("period")
            .annotate(
                asked_count=Count('id'),
                answered_count=Count('id', filter=Q(is_answered=True))
            )
            .order_by("period")
        )

        qa_labels = []
        qa_asked = []
        qa_answered = []
        for entry in qa_qs:
            if not entry["period"]: continue
            if trunc_func == TruncDate:
                label = entry["period"].strftime("%b %d")
            elif trunc_func == TruncWeek:
                label = f"Wk {entry['period'].isocalendar()[1]} ({entry['period'].strftime('%b')})"
            else:
                label = entry["period"].strftime("%b %Y")

            qa_labels.append(label)
            qa_asked.append(entry["asked_count"])
            qa_answered.append(entry["answered_count"])

        if not qa_labels:
            qa_labels = ["No Data"]
            qa_asked = [0]
            qa_answered = [0]

        stats["qa_progress_labels"] = json.dumps(qa_labels)
        stats["qa_progress_asked"] = json.dumps(qa_asked)
        stats["qa_progress_answered"] = json.dumps(qa_answered)
    except Exception as e:
        logger.warning(f"Analytics: Q&A progress query failed: {e}")

    return stats
