"""
Finot Admin Panel — Django Unfold Configuration

This module contains the complete UNFOLD settings dict, including:
  - Branding (title, header, theme, colors)
  - Sidebar navigation (grouped by domain)
  - Tab groups (related model navigation)

Imported by config/settings.py as:
    from config.unfold_config import UNFOLD
"""

from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from django.templatetags.static import static


UNFOLD = {
    # -------------------------------------------------------------------------
    # Branding & Layout
    # -------------------------------------------------------------------------
    "SITE_TITLE": "Finot Admin",
    "SITE_HEADER": "Finot",
    "SITE_SUBHEADER": "Spiritual Management System",
    "SITE_URL": "/",
    "SITE_SYMBOL": "church",
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": True,
    "SHOW_BACK_BUTTON": True,
    "BORDER_RADIUS": "8px",
    # Environment badge in the header
    "ENVIRONMENT": "core.dashboard.environment_callback",
    # Dashboard callback for stat cards and chart data
    "DASHBOARD_CALLBACK": "core.dashboard.dashboard_callback",
    # Force light theme for Finot SaaS style
    "THEME": "light",
    "STYLES": [
        lambda request: static("css/custom_admin.css"),
    ],
    # -------------------------------------------------------------------------
    # Color Theming — Primary Blue, Accent Yellow, Neutral White/Light Gray
    # -------------------------------------------------------------------------
    "COLORS": {
        "base": {
            "50": "252 252 253",
            "100": "245 247 250",
            "200": "235 238 245",
            "300": "220 225 235",
            "400": "180 190 205",
            "500": "130 145 165",
            "600": "100 115 135",
            "700": "70 85 105",
            "800": "40 55 75",
            "900": "20 30 50",
            "950": "10 15 25",
        },
        "primary": {
            "50": "235 245 255",
            "100": "215 235 255",
            "200": "175 215 255",
            "300": "125 185 255",
            "400": "85 155 255",
            "500": "45 120 255",   # Main Primary Blue #2D78FF
            "600": "30 95 230",    # Focus/Hover Primary
            "700": "20 75 195",
            "800": "15 60 160",
            "900": "10 45 125",
            "950": "5 30 85",
        },
        "font": {
            "subtle-light": "var(--color-base-500)",
            "subtle-dark": "var(--color-base-400)",
            "default-light": "var(--color-base-700)",
            "default-dark": "var(--color-base-300)",
            "important-light": "var(--color-base-900)",
            "important-dark": "var(--color-base-100)",
        },
    },
    # -------------------------------------------------------------------------
    # Sidebar Navigation
    # -------------------------------------------------------------------------
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            # — Main —
            {
                "title": _("Main"),
                "separator": True,
                "collapsible": False,
                "items": [
                    {
                        "title": _("Dashboard"),
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                        "permission": lambda request: request.user.is_staff,
                    },
                ],
            },
            # — People —
            {
                "title": _("People"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Users"),
                        "icon": "people",
                        "link": reverse_lazy("admin:core_user_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "core.view_user"
                        ),
                    },
                    {
                        "title": _("Student Profiles"),
                        "icon": "school",
                        "link": reverse_lazy("admin:student_studentprofile_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "student.view_studentprofile"
                        ),
                    },
                    {
                        "title": _("Roles"),
                        "icon": "admin_panel_settings",
                        "link": reverse_lazy("admin:core_role_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": _("User Roles"),
                        "icon": "assignment_ind",
                        "link": reverse_lazy("admin:core_userrole_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
            # — Service & Ministry —
            {
                "title": _("Service & Ministry"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Service Groups"),
                        "icon": "groups",
                        "link": reverse_lazy("admin:service_servicegroup_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_servicegroup"
                        ),
                    },
                    {
                        "title": _("Memberships"),
                        "icon": "badge",
                        "link": reverse_lazy(
                            "admin:service_servicegroupmembership_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_servicegroupmembership"
                        ),
                    },
                    {
                        "title": _("Families"),
                        "icon": "family_restroom",
                        "link": reverse_lazy("admin:service_family_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_family"
                        ),
                    },
                    {
                        "title": _("Family Members"),
                        "icon": "diversity_3",
                        "link": reverse_lazy(
                            "admin:service_familymembership_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_familymembership"
                        ),
                    },
                    {
                        "title": _("Events"),
                        "icon": "event",
                        "link": reverse_lazy("admin:service_event_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_event"
                        ),
                    },
                    {
                        "title": _("Attendance"),
                        "icon": "fact_check",
                        "link": reverse_lazy(
                            "admin:service_serviceattendance_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_serviceattendance"
                        ),
                    },
                    {
                        "title": _("Ageglot Selections"),
                        "icon": "how_to_vote",
                        "link": reverse_lazy(
                            "admin:service_ageglotselection_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "service.view_ageglotselection"
                        ),
                    },
                    {
                        "title": _("Service Config"),
                        "icon": "settings",
                        "link": reverse_lazy(
                            "admin:service_serviceconfiguration_changelist"
                        ),
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
            # — Finance —
            {
                "title": _("Finance"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Payments"),
                        "icon": "payments",
                        "link": reverse_lazy("admin:donation_payment_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "donation.view_payment"
                        ),
                    },
                    {
                        "title": _("Student Donations"),
                        "icon": "volunteer_activism",
                        "link": reverse_lazy(
                            "admin:donation_studentdonation_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "donation.view_studentdonation"
                        ),
                    },
                    {
                        "title": _("Guest Donations"),
                        "icon": "handshake",
                        "link": reverse_lazy(
                            "admin:donation_nonstudentdonation_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "donation.view_nonstudentdonation"
                        ),
                    },
                ],
            },
            # — Q&A —
            {
                "title": _("Q&A"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Questions"),
                        "icon": "help",
                        "link": reverse_lazy(
                            "admin:questionanswer_question_changelist"
                        ),
                        "permission": lambda request: request.user.has_perm(
                            "questionanswer.view_question"
                        ),
                    },
                    {
                        "title": _("Answers"),
                        "icon": "question_answer",
                        "link": reverse_lazy("admin:questionanswer_answer_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "questionanswer.view_answer"
                        ),
                    },
                ],
            },
            # — Notifications —
            {
                "title": _("Notifications"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Notifications"),
                        "icon": "notifications",
                        "link": reverse_lazy("admin:notifications_notification_changelist"),
                        "permission": lambda request: request.user.has_perm(
                            "notifications.view_notification"
                        ),
                    },
                    {
                        "title": _("Device Tokens"),
                        "icon": "smartphone",
                        "link": reverse_lazy("admin:notifications_fcmdevicetoken_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
            # — Courses & Learning —
            {
                "title": _("Courses & Learning"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Curriculums"),
                        "icon": "menu_book",
                        "link": reverse_lazy("admin:course_course_changelist"),
                        "permission": lambda request: request.user.is_superuser or (
                            request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin"]).exists()
                        ),
                    },
                    {
                        "title": _("Semester Courses"),
                        "icon": "calendar_month",
                        "link": reverse_lazy("admin:course_semestercourse_changelist"),
                        "permission": lambda request: request.user.is_superuser or (
                            request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                        ),
                    },
                    {
                        "title": _("Enrollments"),
                        "icon": "how_to_reg",
                        "link": reverse_lazy("admin:course_courseenrollment_changelist"),
                        "permission": lambda request: request.user.is_superuser or (
                            request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                        ),
                    },
                    {
                        "title": _("Sessions"),
                        "icon": "schedule",
                        "link": reverse_lazy("admin:course_coursesession_changelist"),
                        "permission": lambda request: request.user.is_superuser or (
                            request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                        ),
                    },
                    {
                        "title": _("Attendance"),
                        "icon": "checklist",
                        "link": reverse_lazy("admin:course_attendancerecord_changelist"),
                        "permission": lambda request: request.user.is_superuser or (
                            request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                        ),
                    },
                    {
                        "title": _("Materials"),
                        "icon": "attach_file",
                        "link": reverse_lazy("admin:course_coursematerial_changelist"),
                        "permission": lambda request: request.user.is_superuser or (
                            request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                        ),
                    },
                ],
            },
            # — Auth & Security —
            {
                "title": _("Auth & Security"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Social Applications"),
                        "icon": "apps",
                        "link": reverse_lazy(
                            "admin:socialaccount_socialapp_changelist"
                        ),
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": _("Social Accounts"),
                        "icon": "link",
                        "link": reverse_lazy(
                            "admin:socialaccount_socialaccount_changelist"
                        ),
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": _("Sites"),
                        "icon": "language",
                        "link": reverse_lazy("admin:sites_site_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                    {
                        "title": _("Tokens"),
                        "icon": "key",
                        "link": reverse_lazy("admin:authtoken_tokenproxy_changelist"),
                        "permission": lambda request: request.user.is_superuser,
                    },
                ],
            },
            # — Reports & Exports —
            {
                "title": _("Reports & Exports"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {
                        "title": _("Data Exporter"),
                        "icon": "download",
                        "link": reverse_lazy("reports_and_exports"),
                        "permission": lambda request: request.user.is_superuser or (
                            request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin"]).exists()
                        ),
                    },
                ],
            },
        ],
    },
    # -------------------------------------------------------------------------
    # Tabs — group related models for in-page tab navigation
    # -------------------------------------------------------------------------
    "TABS": [
        {
            "models": [
                "donation.payment",
                "donation.studentdonation",
                "donation.nonstudentdonation",
            ],
            "items": [
                {
                    "title": _("Payments"),
                    "link": reverse_lazy("admin:donation_payment_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "donation.view_payment"
                    ),
                },
                {
                    "title": _("Student Donations"),
                    "link": reverse_lazy("admin:donation_studentdonation_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "donation.view_studentdonation"
                    ),
                },
                {
                    "title": _("Guest Donations"),
                    "link": reverse_lazy(
                        "admin:donation_nonstudentdonation_changelist"
                    ),
                    "permission": lambda request: request.user.has_perm(
                        "donation.view_nonstudentdonation"
                    ),
                },
            ],
        },
        {
            "models": [
                "questionanswer.question",
                "questionanswer.answer",
            ],
            "items": [
                {
                    "title": _("Questions"),
                    "link": reverse_lazy("admin:questionanswer_question_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "questionanswer.view_question"
                    ),
                },
                {
                    "title": _("Answers"),
                    "link": reverse_lazy("admin:questionanswer_answer_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "questionanswer.view_answer"
                    ),
                },
            ],
        },
        {
            "models": [
                "service.family",
                "service.familymembership",
            ],
            "items": [
                {
                    "title": _("Families"),
                    "link": reverse_lazy("admin:service_family_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "service.view_family"
                    ),
                },
                {
                    "title": _("Family Members"),
                    "link": reverse_lazy("admin:service_familymembership_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "service.view_familymembership"
                    ),
                },
            ],
        },
        {
            "models": [
                "service.servicegroup",
                "service.servicegroupmembership",
            ],
            "items": [
                {
                    "title": _("Service Groups"),
                    "link": reverse_lazy("admin:service_servicegroup_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "service.view_servicegroup"
                    ),
                },
                {
                    "title": _("Group Memberships"),
                    "link": reverse_lazy(
                        "admin:service_servicegroupmembership_changelist"
                    ),
                    "permission": lambda request: request.user.has_perm(
                        "service.view_servicegroupmembership"
                    ),
                },
            ],
        },
        {
            "models": [
                "course.course",
                "course.semestercourse",
                "course.courseenrollment",
                "course.coursesession",
                "course.attendancerecord",
                "course.coursematerial",
            ],
            "items": [
                {
                    "title": _("Curriculums"),
                    "link": reverse_lazy("admin:course_course_changelist"),
                    "permission": lambda request: request.user.is_superuser or (
                        request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin"]).exists()
                    ),
                },
                {
                    "title": _("Semester Courses"),
                    "link": reverse_lazy("admin:course_semestercourse_changelist"),
                    "permission": lambda request: request.user.is_superuser or (
                        request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                    ),
                },
                {
                    "title": _("Enrollments"),
                    "link": reverse_lazy("admin:course_courseenrollment_changelist"),
                    "permission": lambda request: request.user.is_superuser or (
                        request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                    ),
                },
                {
                    "title": _("Sessions"),
                    "link": reverse_lazy("admin:course_coursesession_changelist"),
                    "permission": lambda request: request.user.is_superuser or (
                        request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                    ),
                },
                {
                    "title": _("Attendance"),
                    "link": reverse_lazy("admin:course_attendancerecord_changelist"),
                    "permission": lambda request: request.user.is_superuser or (
                        request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                    ),
                },
                {
                    "title": _("Materials"),
                    "link": reverse_lazy("admin:course_coursematerial_changelist"),
                    "permission": lambda request: request.user.is_superuser or (
                        request.user.is_authenticated and request.user.roles.filter(name__in=["SuperAdmin", "CourseCoordinator"]).exists()
                    ),
                },
            ],
        },

        {
            "models": [
                "socialaccount.socialapp",
                "socialaccount.socialaccount",
                "sites.site",
                "authtoken.tokenproxy",
            ],
            "items": [
                {
                    "title": _("Social Applications"),
                    "link": reverse_lazy("admin:socialaccount_socialapp_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": _("Social Accounts"),
                    "link": reverse_lazy(
                        "admin:socialaccount_socialaccount_changelist"
                    ),
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": _("Sites"),
                    "link": reverse_lazy("admin:sites_site_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": _("Tokens"),
                    "link": reverse_lazy("admin:authtoken_tokenproxy_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
            ],
        },
        {
            "models": [
                "core.user",
                "core.role",
                "core.userrole",
            ],
            "items": [
                {
                    "title": _("Users"),
                    "link": reverse_lazy("admin:core_user_changelist"),
                    "permission": lambda request: request.user.has_perm(
                        "core.view_user"
                    ),
                },
                {
                    "title": _("Roles"),
                    "link": reverse_lazy("admin:core_role_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
                {
                    "title": _("User Roles"),
                    "link": reverse_lazy("admin:core_userrole_changelist"),
                    "permission": lambda request: request.user.is_superuser,
                },
            ],
        },
    ],
}
