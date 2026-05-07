from course.models import CourseSession, CourseEnrollment
session = CourseSession.objects.first()
if session:
    enrollments = CourseEnrollment.objects.filter(semester_course=session.semester_course)
    student_ids = [e.student_id for e in enrollments]
    print("Enrolled student IDs:", student_ids)
    
    qs = CourseEnrollment.objects.filter(semester_course=session.semester_course, student_id__in=student_ids).values_list('student_id', flat=True)
    print("QS Result:", list(qs))
