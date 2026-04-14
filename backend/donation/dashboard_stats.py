"""Dashboard stat providers for the donation app."""
import json
import logging
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

logger = logging.getLogger(__name__)


def get_donation_stats() -> dict:
    """Return donation-related dashboard statistics."""
    from donation.models import Payment, StudentDonation

    # Total completed donation amount
    completed_total_aggregate = Payment.objects.filter(status="COMPLETED").aggregate(
        total=Sum("amount")
    )["total"]
    total_donation_amount = (
        float(completed_total_aggregate) if completed_total_aggregate is not None else 0.0
    )

    # Donations aggregated by month (last 6 months)
    monthly_labels = []
    monthly_amounts = []
    monthly_counts = []
    monthly_donation_queryset = (
        Payment.objects.filter(status="COMPLETED")
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(total_amount=Sum("amount"), donation_count=Count("id"))
        .order_by("-month")[:6]
    )
    monthly_donations = list(monthly_donation_queryset)
    monthly_donations.reverse()

    for entry in monthly_donations:
        month_label = entry["month"].strftime("%b %Y") if entry["month"] else "N/A"
        monthly_labels.append(month_label)
        monthly_amounts.append(float(entry["total_amount"] or 0))
        monthly_counts.append(entry["donation_count"])

    if not monthly_labels:
        monthly_labels = ["No Data"]
        monthly_amounts = [0]
        monthly_counts = [0]

    # Donations grouped by fund category
    fund_category_labels = []
    fund_category_amounts = []
    donations_by_fund_category = list(
        StudentDonation.objects.values("fund_category")
        .annotate(total_amount=Sum("payment__amount"), donation_count=Count("id"))
        .order_by("-total_amount")[:5]
    )
    fund_category_labels = [entry["fund_category"] for entry in donations_by_fund_category]
    fund_category_amounts = [float(entry["total_amount"] or 0) for entry in donations_by_fund_category]

    if not fund_category_labels:
        fund_category_labels = ["No Data"]
        fund_category_amounts = [0]

    return {
        "total_donations": f"{total_donation_amount:,.2f}",
        "donation_months": json.dumps(monthly_labels),
        "donation_amounts": json.dumps(monthly_amounts),
        "donation_counts": json.dumps(monthly_counts),
        "fund_labels": json.dumps(fund_category_labels),
        "fund_amounts": json.dumps(fund_category_amounts),
    }
