from django.db.models import Q

from core.models import User
from student.models import StudentProfile
from .models import Family, FamilyMembership


MAX_FAMILY_SIZE = 15


def get_filter_options():
    """
    Returns distinct values for filter dropdowns,
    sourced from unassigned fresher StudentProfiles.
    """
    freshers = StudentProfile.objects.filter(
        batch_year=1,
        status=StudentProfile.IN_CAMPUS,
    ).exclude(
        user__family_membership__isnull=False,
    )

    return {
        "dorm_blocks": sorted(
            freshers.exclude(dorm_block__isnull=True)
            .values_list("dorm_block", flat=True)
            .distinct()
        ),
        "dorm_rooms": sorted(
            freshers.exclude(dorm_room__isnull=True)
            .values_list("dorm_room", flat=True)
            .distinct()
        ),
        "sections": sorted(
            freshers.exclude(section__isnull=True)
            .values_list("section", flat=True)
            .distinct()
        ),
    }


def get_unassigned_freshers(gender=None, dorm_block=None, dorm_room=None, section=None):
    """
    Returns a filtered queryset of unassigned fresher students.
    All filter parameters are optional — omit to skip that filter.
    """
    qs = User.objects.filter(
        student_profile__batch_year=1,
        student_profile__status=StudentProfile.IN_CAMPUS,
    ).exclude(
        family_membership__isnull=False,
    ).select_related("student_profile")

    if gender:
        qs = qs.filter(gender=gender)

    if dorm_block is not None:
        qs = qs.filter(student_profile__dorm_block=dorm_block)

    if dorm_room is not None:
        qs = qs.filter(student_profile__dorm_room=dorm_room)

    if section is not None:
        qs = qs.filter(student_profile__section=section)

    return qs.order_by(
        "student_profile__dorm_block",
        "student_profile__dorm_room",
        "student_profile__section",
        "first_name",
    )


def assign_students_to_family(family, student_ids):
    """
    Assigns selected students to a family by creating FamilyMembership records.
    Skips students who already have a family (OneToOne safety).

    Returns:
        dict with keys:
            - assigned_count (int): Successfully assigned.
            - skipped_names (list[str]): Students skipped (already in a family).
            - warnings (list[str]): Any issues.
    """
    warnings = []
    skipped_names = []
    memberships = []

    current_count = family.members.count()
    available_slots = MAX_FAMILY_SIZE - current_count

    if available_slots <= 0:
        return {
            "assigned_count": 0,
            "skipped_names": [],
            "warnings": [f"Family '{family.name}' is already full ({current_count}/{MAX_FAMILY_SIZE})."],
        }

    students = User.objects.filter(id__in=student_ids).select_related("student_profile")

    for student in students:
        # Check if student already has a family
        if hasattr(student, "family_membership"):
            skipped_names.append(f"{student.get_full_name() or student.username} (already in a family)")
            continue

        if len(memberships) >= available_slots:
            skipped_names.append(
                f"{student.get_full_name() or student.username} (family at max capacity)"
            )
            continue

        memberships.append(FamilyMembership(family=family, student=student))

    if memberships:
        FamilyMembership.objects.bulk_create(memberships)

    if skipped_names:
        warnings.append(f"{len(skipped_names)} student(s) were skipped.")

    return {
        "assigned_count": len(memberships),
        "skipped_names": skipped_names,
        "warnings": warnings,
    }
