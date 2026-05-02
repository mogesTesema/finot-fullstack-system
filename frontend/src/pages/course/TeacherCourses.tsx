import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  PlusCircleIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Types based on new backend
interface Curriculum {
  id: string;
  title: string;
  code: string;
}

interface SemesterCourse {
  id: string;
  curriculum: Curriculum;
  semester: number;
  academic_year: string;
  teacher: { id: string; full_name: string };
  schedule_day: string;
  start_time: string;
  end_time: string;
  venue: string | null;
}

const TeacherCourses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState<SemesterCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courses" | "sessions">("courses");
  const [selectedCourse, setSelectedCourse] = useState<SemesterCourse | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Session creation modal
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTopic, setSessionTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isTeacher = user?.role === "teacher" || user?.role === "TEACHER";

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getSemesterCourses() as any;
      // Handle both array and paginated object responses
      const coursesArray = Array.isArray(data) ? data : (data?.results || []);
      setCourses(coursesArray);
    } catch (error) {
      console.error("Failed to fetch courses", error);
      toast.error(t("failed_to_load_courses"));
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (courseId: string) => {
    setLoadingSessions(true);
    try {
      const data = await api.getCourseSessions(courseId) as any;
      const sessionsArray = Array.isArray(data) ? data : (data?.results || []);
      setSessions(sessionsArray);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
      toast.error(t("failed_to_load_sessions"));
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseSelect = (course: SemesterCourse) => {
    setSelectedCourse(course);
    fetchSessions(course.id);
    setActiveTab("sessions");
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    
    setSubmitting(true);
    try {
      await api.createCourseSession({
        semester_course: selectedCourse.id,
        session_date: sessionDate,
        topic: sessionTopic,
      });
      toast.success(t("session_created_success"));
      setShowCreateSession(false);
      setSessionDate(new Date().toISOString().split("T")[0]);
      setSessionTopic("");
      // Refresh sessions
      fetchSessions(selectedCourse.id);
    } catch (error) {
      console.error("Failed to create session", error);
      toast.error(t("failed_to_create_session"));
    } finally {
      setSubmitting(false);
    }
  };

  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };
    return days[day] || day;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">
          {activeTab === "courses" ? t("my_courses") : t("course_sessions")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeTab === "courses" 
            ? t("teacher_courses_description") 
            : t("manage_sessions_description")}
        </p>
      </motion.div>

      {/* Back button when in sessions view */}
      {activeTab === "sessions" && selectedCourse && (
        <button
          onClick={() => {
            setActiveTab("courses");
            setSelectedCourse(null);
            setSessions([]);
          }}
          className="mb-4 text-sm text-primary hover:text-primary-light flex items-center gap-1"
        >
          ← {t("back_to_courses")}
        </button>
      )}

      {/* Courses List View */}
      {activeTab === "courses" && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-4"
        >
          {courses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AcademicCapIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("no_courses_assigned")}</p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCourseSelect(course)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-lg">
                        {course.curriculum?.title || "Course"}
                      </h3>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {course.curriculum?.code}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <AcademicCapIcon className="h-4 w-4" />
                        {t("year")} {course.academic_year} • {t("semester")} {course.semester}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {getDayName(course.schedule_day)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {course.start_time} - {course.end_time}
                      </span>
                      {course.venue && (
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {course.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 self-start md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/courses/${course.id}/attendance`);
                      }}
                      className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4" />
                      {t("take_attendance")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/courses/${course.id}/materials`);
                      }}
                      className="btn-outline text-sm px-4 py-2 flex items-center gap-2"
                    >
                      <FolderIcon className="h-4 w-4" />
                      {t("materials")}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Sessions View for Selected Course */}
      {activeTab === "sessions" && selectedCourse && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-4"
        >
          {/* Course Info Banner */}
          <div className="card bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-foreground">{selectedCourse.curriculum?.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getDayName(selectedCourse.schedule_day)} • {selectedCourse.start_time} - {selectedCourse.end_time}
              {selectedCourse.venue && ` • ${selectedCourse.venue}`}
            </p>
          </div>

          {/* Create Session Button */}
          <button
            onClick={() => setShowCreateSession(true)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusCircleIcon className="h-4 w-4" />
            {t("create_session")}
          </button>

          {/* Sessions List */}
          {loadingSessions ? (
            <div className="flex justify-center py-12">
              <Spinner size="h-8 w-8" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("no_sessions_yet")}</p>
              <button
                onClick={() => setShowCreateSession(true)}
                className="btn-primary inline-flex items-center gap-2 mt-4"
              >
                <PlusCircleIcon className="h-4 w-4" />
                {t("create_first_session")}
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(session.session_date).toLocaleDateString()}
                    </p>
                    {session.topic && (
                      <p className="text-sm text-muted-foreground mt-1">{session.topic}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/courses/${selectedCourse.id}/attendance?session=${session.id}`)}
                    className="btn-outline text-sm px-4 py-2"
                  >
                    {t("mark_attendance")}
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowCreateSession(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-foreground mb-4">{t("create_new_session")}</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
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
                  {t("topic_optional")}
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder={t("topic_placeholder")}
                  className="input w-full"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? t("creating") : t("create")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSession(false)}
                  className="btn-outline px-4"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;