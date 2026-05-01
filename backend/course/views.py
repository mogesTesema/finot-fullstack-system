from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Prefetch, Q

from core.models import User, Role
from .models import (
    Course, SemesterCourse, CourseEnrollment,
    CourseSession, AttendanceRecord, CourseMaterial
)
from .serializers import (
    CourseSerializer, SemesterCourseSerializer, CourseEnrollmentSerializer,
    CourseSessionSerializer, AttendanceRecordSerializer, CourseMaterialSerializer,
    BulkEnrollmentRequestSerializer, BulkAttendanceRequestSerializer
)
from .permissions import IsSuperAdmin, IsTeacherForSemesterCourse, IsEnrolledStudentOrTeacher


class CourseViewSet(viewsets.ModelViewSet):
    """
    CRUD for curriculums.
    Only SuperAdmin can modify. Read-only for authenticated users.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]


class SemesterCourseViewSet(viewsets.ModelViewSet):
    """
    CRUD for semester courses.
    """
    serializer_class = SemesterCourseSerializer

    def get_queryset(self):
        qs = SemesterCourse.objects.select_related('course').prefetch_related('teachers', 'teachers__roles')
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return qs
        return qs.filter(
            id__in=list(user.teaching_semester_courses.values_list('id', flat=True)) +
                   list(SemesterCourse.objects.filter(enrollments__student=user).values_list('id', flat=True))
        ).distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = CourseEnrollmentSerializer

    def get_queryset(self):
        qs = CourseEnrollment.objects.select_related('student', 'semester_course', 'semester_course__course').prefetch_related('semester_course__teachers', 'semester_course__teachers__roles')
        if self.request.user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return qs
        return qs.filter(
            Q(student=self.request.user) | Q(semester_course__teachers=self.request.user)
        ).distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_enroll']:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='bulk-enroll/(?P<semester_course_id>[^/.]+)')
    def bulk_enroll(self, request, semester_course_id=None):
        try:
            sc = SemesterCourse.objects.get(id=semester_course_id)
        except SemesterCourse.DoesNotExist:
            return Response({"error": "Semester course not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = BulkEnrollmentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        batch_year = serializer.validated_data['batch_year']
        students = User.objects.filter(is_active=True, student_profile__batch_year=batch_year)
        if not students.exists():
            return Response({"message": f"No active students found in batch year {batch_year}."}, status=status.HTTP_404_NOT_FOUND)
        enrollments = [CourseEnrollment(semester_course=sc, student=s) for s in students]
        created = CourseEnrollment.objects.bulk_create(enrollments, ignore_conflicts=True)
        return Response({"message": "Bulk enrollment completed.", "requested_students": students.count(), "new_enrollments": len(created)}, status=status.HTTP_200_OK)


class CourseSessionViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSessionSerializer

    def get_queryset(self):
        qs = CourseSession.objects.select_related('semester_course', 'semester_course__course')
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return qs
        return qs.filter(
            semester_course__id__in=list(user.teaching_semester_courses.values_list('id', flat=True)) +
                                    list(SemesterCourse.objects.filter(enrollments__student=user).values_list('id', flat=True))
        ).distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTeacherForSemesterCourse()]
        return [IsEnrolledStudentOrTeacher()]

    def perform_create(self, serializer):
        sc = serializer.validated_data.get('semester_course')
        user = self.request.user
        if not user.roles.filter(name=Role.SUPER_ADMIN).exists() and not sc.teachers.filter(id=user.id).exists():
            raise PermissionDenied("You must be a teacher for this semester course to create a session.")
        serializer.save()


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer

    def get_queryset(self):
        qs = AttendanceRecord.objects.select_related('student', 'session', 'session__semester_course', 'marked_by')
        user = self.request.user
        if user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return qs
        return qs.filter(
            Q(student=user) | Q(session__semester_course__teachers=user)
        ).distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_mark']:
            return [IsTeacherForSemesterCourse()]
        return [IsEnrolledStudentOrTeacher()]

    def perform_create(self, serializer):
        session = serializer.validated_data.get('session')
        student = serializer.validated_data.get('student')
        user = self.request.user
        if not CourseEnrollment.objects.filter(student=student, semester_course=session.semester_course).exists():
            raise serializers.ValidationError({"student": "Student is not enrolled in this course."})
        if not user.roles.filter(name=Role.SUPER_ADMIN).exists() and not session.semester_course.teachers.filter(id=user.id).exists():
            raise PermissionDenied("You must be a teacher to mark attendance.")
        serializer.save(marked_by=user)

    @action(detail=False, methods=['post'], url_path='bulk-mark/(?P<session_id>[^/.]+)')
    def bulk_mark(self, request, session_id=None):
        try:
            session = CourseSession.objects.select_related('semester_course').get(id=session_id)
        except CourseSession.DoesNotExist:
            return Response({"error": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
        is_super = request.user.roles.filter(name=Role.SUPER_ADMIN).exists()
        is_teacher = session.semester_course.teachers.filter(id=request.user.id).exists()
        if not (is_super or is_teacher):
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        serializer = BulkAttendanceRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        records_data = serializer.validated_data['records']
        student_ids = [item['student_id'] for item in records_data]
        
        enrolled_student_ids = set(CourseEnrollment.objects.filter(
            semester_course=session.semester_course,
            student_id__in=student_ids
        ).values_list('student_id', flat=True))
        enrolled_student_ids_str = {str(sid) for sid in enrolled_student_ids}
        
        invalid_students = [str(item['student_id']) for item in records_data if str(item['student_id']) not in enrolled_student_ids_str]
        if invalid_students:
            return Response(
                {"error": "Some students are not enrolled in this course.", "invalid_student_ids": invalid_students}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        existing = AttendanceRecord.objects.filter(session=session, student_id__in=student_ids)
        existing_map = {str(r.student_id): r for r in existing}
        to_create, to_update = [], []
        for item in records_data:
            s_id = str(item['student_id'])
            if s_id in existing_map:
                rec = existing_map[s_id]
                if rec.status != item['status']:
                    rec.status = item['status']
                    rec.marked_by = request.user
                    to_update.append(rec)
            else:
                to_create.append(AttendanceRecord(session=session, student_id=s_id, status=item['status'], marked_by=request.user))
        if to_create:
            AttendanceRecord.objects.bulk_create(to_create, ignore_conflicts=True)
        if to_update:
            AttendanceRecord.objects.bulk_update(to_update, ['status', 'marked_by'])
        return Response({"message": "Bulk attendance processed.", "created": len(to_create), "updated": len(to_update)}, status=status.HTTP_200_OK)


class CourseMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = CourseMaterialSerializer

    def get_queryset(self):
        qs = CourseMaterial.objects.select_related('semester_course', 'semester_course__course')
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if user.roles.filter(name=Role.SUPER_ADMIN).exists():
            return qs
        return qs.filter(
            semester_course__id__in=list(user.teaching_semester_courses.values_list('id', flat=True)) +
                                    list(SemesterCourse.objects.filter(enrollments__student=user).values_list('id', flat=True))
        ).distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsTeacherForSemesterCourse()]
        return [IsEnrolledStudentOrTeacher()]

    def perform_create(self, serializer):
        sc = serializer.validated_data.get('semester_course')
        user = self.request.user
        if not user.roles.filter(name=Role.SUPER_ADMIN).exists() and not sc.teachers.filter(id=user.id).exists():
            raise PermissionDenied("You must be a teacher to upload materials.")
        serializer.save()
