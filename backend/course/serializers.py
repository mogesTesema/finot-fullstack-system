from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from .models import (
    Course,
    SemesterCourse,
    CourseEnrollment,
    CourseSession,
    AttendanceRecord,
    CourseMaterial
)
from core.serializers import UserSerializer


class CourseSerializer(serializers.ModelSerializer):
    """
    Standard CRUD serializer for Course curriculums.
    """
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'batch_year', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SemesterCourseSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for a SemesterCourse. 
    Includes nested basic course details for frontend convenience.
    """
    course_details = CourseSerializer(source='course', read_only=True)
    teachers_details = UserSerializer(source='teachers', many=True, read_only=True)

    class Meta:
        model = SemesterCourse
        fields = [
            'id', 'course', 'course_details', 'academic_year', 
            'semester', 'teachers', 'teachers_details', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for individual student enrollment.
    """
    student_details = UserSerializer(source='student', read_only=True)
    semester_course_details = SemesterCourseSerializer(source='semester_course', read_only=True)

    class Meta:
        model = CourseEnrollment
        fields = ['id', 'semester_course', 'semester_course_details', 'student', 'student_details', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']
        validators = [
            UniqueTogetherValidator(
                queryset=CourseEnrollment.objects.all(),
                fields=['semester_course', 'student'],
                message="This student is already enrolled in this semester course."
            )
        ]


class CourseSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for daily class sessions.
    """
    class Meta:
        model = CourseSession
        fields = ['id', 'semester_course', 'date', 'topic', 'created_at']
        read_only_fields = ['id', 'created_at']
        validators = [
            UniqueTogetherValidator(
                queryset=CourseSession.objects.all(),
                fields=['semester_course', 'date'],
                message="A session for this course already exists on this date."
            )
        ]


class AttendanceRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for individual attendance records.
    """
    student_details = UserSerializer(source='student', read_only=True)
    marked_by_details = UserSerializer(source='marked_by', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'session', 'student', 'student_details', 'status', 'marked_by', 'marked_by_details', 'updated_at']
        read_only_fields = ['id', 'marked_by', 'updated_at']
        validators = [
            UniqueTogetherValidator(
                queryset=AttendanceRecord.objects.all(),
                fields=['session', 'student'],
                message="An attendance record for this student in this session already exists."
            )
        ]


class CourseMaterialSerializer(serializers.ModelSerializer):
    """
    Serializer for course materials and files.
    """
    class Meta:
        model = CourseMaterial
        fields = ['id', 'semester_course', 'title', 'file', 'url', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


# =========================================================================
# BULK OPERATION SERIALIZERS
# =========================================================================

class BulkEnrollmentRequestSerializer(serializers.Serializer):
    """
    Serializer to validate incoming bulk enrollment requests.
    Expects a `batch_year` to fetch and enroll all students in that batch.
    """
    batch_year = serializers.IntegerField(
        min_value=1, 
        max_value=5, 
        help_text="The batch year of students to bulk-enroll (1-5)."
    )


class BulkAttendanceItemSerializer(serializers.Serializer):
    """
    Validates a single item within a bulk attendance request list.
    """
    student_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=AttendanceRecord.STATUS_CHOICES)


class BulkAttendanceRequestSerializer(serializers.Serializer):
    """
    Validates the entire bulk attendance payload.
    Expected format: {"records": [{"student_id": "...", "status": "PRESENT"}, ...]}
    """
    records = BulkAttendanceItemSerializer(many=True, allow_empty=False)
