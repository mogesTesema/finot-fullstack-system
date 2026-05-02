// src/types/course.ts (updated)

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  code: string; // e.g., "THEO101"
}

export interface SemesterCourse {
  id: string;
  curriculum: Curriculum;
  semester: number; // 1 or 2
  academic_year: string; // "2026"
  teacher: { id: string; full_name: string };
  schedule_day: string; // "MONDAY", "WEDNESDAY"
  start_time: string;
  end_time: string;
  venue: string;
}

export interface CourseSession {
  id: string;
  semester_course: SemesterCourse;
  session_date: string;
  topic: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session: CourseSession;
  student: { id: string; full_name: string };
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  remarks: string | null;
  marked_at: string;
}

export interface CourseMaterial {
  id: string;
  semester_course: SemesterCourse;
  title: string;
  description: string;
  file_url: string | null;
  link_url: string | null;
  uploaded_at: string;
}