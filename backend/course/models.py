import uuid
from django.db import models
from django.conf import settings


class Course(models.Model):
    """
    The static curriculum blueprint. 
    Defines what a course is, regardless of when it is taught.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    batch_year = models.PositiveIntegerField(help_text="1-5")
    is_active = models.BooleanField(
        default=True,
        help_text="Set to False if this curriculum is no longer used."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['batch_year', 'is_active']),
        ]

    def __str__(self):
        return f"{self.title} (Batch {self.batch_year})"


class CourseOffering(models.Model):
    """
    A temporal instance of a course happening in a specific semester.
    Teachers are assigned here, not to the generic Course.
    """
    SEMESTER_CHOICES = [
        (1, 'First Semester'),
        (2, 'Second Semester'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="offerings")
    academic_year = models.PositiveIntegerField(help_text="Start year, e.g., 2026")
    semester = models.PositiveIntegerField(choices=SEMESTER_CHOICES)
    teachers = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="teaching_offerings", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['course', 'academic_year', 'semester'], 
                name='unique_course_offering'
            )
        ]
        indexes = [
            models.Index(fields=['academic_year', 'semester']),
        ]

    def __str__(self):
        return f"{self.course.title} - {self.academic_year} Sem {self.semester}"


class CourseEnrollment(models.Model):
    """
    The junction table linking a student to a specific CourseOffering.
    This preserves exact historical data as students progress.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE, related_name="enrollments")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="course_enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['offering', 'student'], 
                name='unique_course_enrollment'
            )
        ]

    def __str__(self):
        return f"{self.student} -> {self.offering}"


class CourseSession(models.Model):
    """
    A single day that a CourseOffering meets.
    Allows dynamic scheduling and handles edge cases like borrowing days from next semester.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE, related_name="sessions")
    date = models.DateField()
    topic = models.CharField(max_length=255, blank=True, null=True, help_text="Optional topic for the day")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['offering', 'date'], 
                name='unique_course_session_date'
            )
        ]

    def __str__(self):
        return f"{self.offering} on {self.date}"


class AttendanceRecord(models.Model):
    """
    Roll call for a specific student on a specific CourseSession.
    """
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('EXCUSED', 'Excused'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(CourseSession, on_delete=models.CASCADE, related_name="attendance_records")
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_records")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="marked_attendances"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['session', 'student'], 
                name='unique_attendance_per_session'
            )
        ]
        indexes = [
            models.Index(fields=['student', 'status']),
        ]

    def __str__(self):
        return f"{self.student} - {self.status} on {self.session.date}"


class CourseMaterial(models.Model):
    """
    Files, PDFs, or links provided by a teacher for a specific CourseOffering.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    offering = models.ForeignKey(CourseOffering, on_delete=models.CASCADE, related_name="materials")
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="course_materials/", blank=True, null=True)
    url = models.URLField(blank=True, null=True, help_text="Optional external link")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} for {self.offering}"
