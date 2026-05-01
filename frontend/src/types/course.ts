// src/types/course.ts

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface Course {
  id: string;
  name: string;
  batch_year: number;  // 1,2,3,4,5
  day1: string;        // MON, TUE, WED, THU, FRI, SAT, SUN
  day2: string | null; // optional second day
  start_time: string;  // HH:MM
  end_time: string;    // HH:MM
  venue: string | null;
  semester: number;    // 1 or 2
  created_by: number;
  created_at: string;
}

export interface CourseSession {
  id: string;
  course_id: string;
  session_date: string;  // YYYY-MM-DD
  taken_by: number;
  notes: string | null;
  created_at: string;
}

export interface CourseAttendance {
  id: string;
  session_id: string;
  student_id: number;
  status: AttendanceStatus;
  remark: string | null;
  recorded_at: string;
}

// Extended type for UI (with joined data)
export interface CourseWithDetails extends Course {
  sessions?: CourseSession[];
  attendanceSummary?: {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    percentage: number;
  };
}

export interface StudentAttendanceRecord {
  courseName: string;
  sessionDate: string;
  status: AttendanceStatus;
  remark: string | null;
  venue: string | null;
  startTime: string;
  endTime: string;
}