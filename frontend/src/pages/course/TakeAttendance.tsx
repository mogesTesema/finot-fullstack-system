import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, CheckCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "../../components/ui/Spinner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { sanitizeUuid } from "../../lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Student {
  id: string;
  full_name: string;
  email?: string;
}

interface SemesterCourse {
  id: string;
  curriculum: { title: string; code: string };
  academic_year: string;
  semester: number;
}

interface CourseSession {
  id: string;
  date: string;  // ← CORRECT - backend uses "date"
  topic: string | null;
  teacher_name: string | null;
}

const TakeAttendance = () => {
  const { id: semesterCourseId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get("session");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [course, setCourse] = useState<SemesterCourse | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(sessionIdParam);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<CourseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Attendance state: { studentId: { status, remarks } }
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({});
  // Before making API call
  // Fetch course, students, and sessions
  useEffect(() => {
    const fetchData = async () => {
      if (!semesterCourseId) return;
      
      // Validate UUID before proceeding
      const validCourseId = sanitizeUuid(semesterCourseId);
      if (!validCourseId) {
        toast.error(t("invalid_course_id"));
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Get semester course details
        const courses = await api.getSemesterCourses();
        const foundCourse = courses.find((c: any) => c.id === semesterCourseId);
        setCourse(foundCourse || null);

        // Note: We'll fetch roster AFTER session is selected, not here
        // For now, just set empty students array
        setStudents([]);

        // Get sessions for session dropdown
        const sessionsData = await api.getCourseSessions(semesterCourseId);
        setSessions(sessionsData);
        
        // If sessionId from URL, find and set it
        if (sessionIdParam) {
          const foundSession = sessionsData.find((s: any) => s.id === sessionIdParam);
          if (foundSession) {
            setSelectedSessionDetails(foundSession);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error(t("failed_to_load_data"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [semesterCourseId, sessionIdParam]);

  // When session is selected, fetch roster and update details
  useEffect(() => {
    if (selectedSessionId) {
      const session = sessions.find(s => s.id === selectedSessionId);
      setSelectedSessionDetails(session || null);
      
      // Fetch roster for this session
      const fetchRoster = async () => {
        try {
          const rosterData = await api.getSessionRoster(selectedSessionId);
          const studentList = rosterData.roster.map((student: any) => ({
            id: student.student_id,
            full_name: `${student.first_name} ${student.last_name}`,
            email: "", // Add placeholder email since roster doesn't provide it
          }));
          setStudents(studentList);
          
          // Initialize attendance data with existing status from roster
          const initialData: Record<string, { status: string; remarks: string }> = {};
          rosterData.roster.forEach((student: any) => {
            initialData[student.student_id] = {
              status: student.status || "PRESENT",
              remarks: "",
            };
          });
          setAttendanceData(initialData);
        } catch (error) {
          console.error("Failed to fetch roster", error);
          toast.error(t("failed_to_load_roster"));
        }
      };
      
      fetchRoster();
    } else {
      setSelectedSessionDetails(null);
      setStudents([]);
    }
  }, [selectedSessionId, sessions]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) {
      toast.error(t("select_session_first"));
      return;
    }
    
    setSubmitting(true);
    try {
      const records = students.map((student) => ({
        student_id: student.id,  // ✅ CORRECT - backend expects "student_id"
        status: attendanceData[student.id]?.status || "PRESENT",
      }));
      
      console.log("Submitting attendance:", { sessionId: selectedSessionId, records }); // Debug log
      
      await api.bulkMarkAttendance(selectedSessionId, records);
      toast.success(t("attendance_saved_success"));
      navigate("/dashboard/courses");
    } catch (error: any) {
      console.error("Failed to save attendance", error);
      console.error("Error response:", error.response?.data);  // Debug log
      
      // Handle specific error for non-enrolled students
      if (error.response?.data?.invalid_student_ids) {
        toast.error(t("some_students_not_enrolled"));
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(t("failed_to_save_attendance"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-700 border-green-200";
      case "ABSENT":
        return "bg-red-100 text-red-700 border-red-200";
      case "EXCUSED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("course_not_found")}</p>
        <Link to="/dashboard/courses" className="btn-primary mt-4 inline-block">
          {t("back_to_courses")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex items-center gap-4 mb-6"
      >
        <Link
          to="/dashboard/courses"
          className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("take_attendance")}</h1>
          <p className="text-sm text-muted-foreground">
            {course.curriculum?.title} - {t("year")} {course.academic_year} • {t("semester")} {course.semester}
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Session Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("select_session")}</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("session")} *
            </label>
            <select
              value={selectedSessionId || ""}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">{t("select_session_option")}</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {new Date(session.date).toLocaleDateString()} - {session.topic || t("no_topic")}
                </option>
              ))}
            </select>
          </div>
          
          {/* Show session details if selected */}
          {selectedSessionDetails && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">{t("date")}:</span> {new Date(selectedSessionDetails.date).toLocaleDateString()}
              </p>
              {selectedSessionDetails.topic && (
                <p className="text-sm mt-1">
                  <span className="font-medium">{t("topic")}:</span> {selectedSessionDetails.topic}
                </p>
              )}
              {selectedSessionDetails.teacher_name && (
                <p className="text-sm mt-1">
                  <span className="font-medium">{t("teacher")}:</span> {selectedSessionDetails.teacher_name}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Students List - only show if session selected */}
        {selectedSessionId && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{t("students")}</h2>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <UserGroupIcon className="h-4 w-4" />
                {students.length} {t("students")}
              </span>
            </div>

            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{student.full_name}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={attendanceData[student.id]?.status || "PRESENT"}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      className={`text-sm px-3 py-1.5 rounded-lg border ${getStatusColor(attendanceData[student.id]?.status || "PRESENT")} focus:outline-none`}
                    >
                      <option value="PRESENT">{t("present")}</option>
                      <option value="ABSENT">{t("absent")}</option>
                      <option value="EXCUSED">{t("excused")}</option>
                    </select>

                    {/* Remark Input (shown for ABSENT or EXCUSED) */}
                    {(attendanceData[student.id]?.status === "ABSENT" || attendanceData[student.id]?.status === "EXCUSED") && (
                      <input
                        type="text"
                        value={attendanceData[student.id]?.remarks || ""}
                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                        placeholder={t("reason_optional")}
                        className="text-sm px-3 py-1.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary w-40"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !selectedSessionId}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Spinner size="h-4 w-4" />
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                {t("save_attendance")}
              </>
            )}
          </button>
          <Link
            to="/dashboard/courses"
            className="btn-outline px-6"
          >
            {t("cancel")}
          </Link>
        </div>
      </motion.form>
    </div>
  );
};

export default TakeAttendance;