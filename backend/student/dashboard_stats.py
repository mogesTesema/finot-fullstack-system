"""Dashboard stat providers for the student app."""
import json
import logging
from django.db.models import Count

logger = logging.getLogger(__name__)


def get_student_stats() -> dict:
    """Return student-related dashboard statistics."""
    from student.models import StudentProfile

    active_student_count = StudentProfile.objects.filter(status="IN_CAMPUS").count()

    # Students grouped by department
    department_labels = []
    department_counts = []
    students_by_department = list(
        StudentProfile.objects.filter(status="IN_CAMPUS")
        .exclude(department__isnull=True)
        .exclude(department="")
        .values("department")
        .annotate(student_count=Count("id"))
        .order_by("-student_count")[:10]
    )
    department_labels = [entry["department"] for entry in students_by_department]
    department_counts = [entry["student_count"] for entry in students_by_department]

    if not department_labels:
        department_labels = ["No Data"]
        department_counts = [0]

    return {
        "active_students": active_student_count,
        "dept_labels": json.dumps(department_labels),
        "dept_counts": json.dumps(department_counts),
    }
