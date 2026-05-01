// src/pages/dashboard/courses/TakeAttendance.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, CheckCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Course, AttendanceStatus } from "@/types/course";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Student {
  id: number;
  full_name: string;
  email: string;
}

const TakeAttendance = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  
  // Attendance state: { studentId: status }
  const [attendanceStatus, setAttendanceStatus] = useState<Record<number, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  // Fetch course details and students
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get all courses and find the one with matching id
        const courses = await api.getCourses();
        const foundCourse = courses.find((c: Course) => c.id === id);
        setCourse(foundCourse || null);

        if (foundCourse) {
          // Get students by batch year
          const studentsData = await api.getStudentsByBatch(foundCourse.batch_year);
          setStudents(studentsData);
          
          // Initialize attendance status as PRESENT for all
          const initialStatus: Record<number, AttendanceStatus> = {};
          studentsData.forEach((student: Student) => {
            initialStatus[student.id] = "PRESENT";
          });
          setAttendanceStatus(initialStatus);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error(t("failed_to_load_data"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setAttendanceStatus((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId: number, remark: string) => {
    setRemarks((prev) => ({ ...prev, [studentId]: remark }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course) return;
    
    setSubmitting(true);
    
    try {
      // Prepare attendance data
      const attendances = students.map((student) => ({
        student_id: student.id,
        status: attendanceStatus[student.id] || "PRESENT",
        remark: remarks[student.id] || null,
      }));

      await api.createSession({
        course_id: course.id,
        session_date: sessionDate,
        taken_by: user?.id || 1,
        notes: notes || null,
        attendances,
      });

      toast.success(t("attendance_saved_success"));
      navigate("/dashboard/courses");
    } catch (error) {
      console.error("Failed to save attendance", error);
      toast.error(t("failed_to_save_attendance"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-700 border-green-200";
      case "ABSENT":
        return "bg-red-100 text-red-700 border-red-200";
      case "LATE":
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
            {course.name} - {t("batch")} {course.batch_year}
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
        {/* Session Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("session_info")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("session_date")} *
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("notes_optional")}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("topic_covered")}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Students List */}
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
                    value={attendanceStatus[student.id] || "PRESENT"}
                    onChange={(e) => handleStatusChange(student.id, e.target.value as AttendanceStatus)}
                    className={`text-sm px-3 py-1.5 rounded-lg border ${getStatusColor(attendanceStatus[student.id] || "PRESENT")} focus:outline-none`}
                  >
                    <option value="PRESENT">{t("present")}</option>
                    <option value="ABSENT">{t("absent")}</option>
                    <option value="LATE">{t("late")}</option>
                  </select>

                  {/* Remark Input (shown only for ABSENT or LATE) */}
                  {(attendanceStatus[student.id] === "ABSENT" || attendanceStatus[student.id] === "LATE") && (
                    <input
                      type="text"
                      value={remarks[student.id] || ""}
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

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
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