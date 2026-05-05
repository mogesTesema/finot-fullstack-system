import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "../../components/ui/Spinner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface AttendanceRecord {
  id: string;
  session: {
    id: string;
    session_date: string;
    topic: string | null;
    teacher_name: string | null;
    semester_course: {
      id: string;
      curriculum: {
        title: string;
        code: string;
      };
    };
  };
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  remarks: string | null;
  marked_at: string;
}

interface SemesterCourse {
  id: string;
  curriculum: {
    title: string;
    code: string;
  };
  semester: number;
  academic_year: string;
}

const CourseAttendanceTab = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<SemesterCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [summary, setSummary] = useState<Record<string, { total: number; present: number; excused: number; percentage: number }>>({});

  // Fetch student's attendance and enrolled courses
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get enrolled courses for the student
        const courses = await api.getSemesterCourses();
        setEnrolledCourses(courses);
        
        // Get attendance records
        const records = await api.getMyCourseAttendance();
        setAttendanceRecords(records);
        
        // Calculate summary per course
        const courseSummary: Record<string, { total: number; present: number; excused: number; percentage: number }> = {};
        
        records.forEach((record) => {
          const courseId = record.session.semester_course.id;
          
          if (!courseSummary[courseId]) {
            courseSummary[courseId] = {
              total: 0,
              present: 0,
              excused: 0,
              percentage: 0,
            };
          }
          
          courseSummary[courseId].total++;
          if (record.status === "PRESENT") {
            courseSummary[courseId].present++;
          }
          if (record.status === "EXCUSED") {
            courseSummary[courseId].excused++;
          }
        });
        
        // Calculate percentages
        Object.keys(courseSummary).forEach((courseId) => {
          const { total, present } = courseSummary[courseId];
          courseSummary[courseId].percentage = total > 0 ? (present / total) * 100 : 0;
        });
        
        setSummary(courseSummary);
      } catch (error) {
        console.error("Failed to fetch course attendance", error);
        toast.error(t("failed_to_load_attendance"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter records by selected course
  const filteredRecords = selectedCourseId === "all"
    ? attendanceRecords
    : attendanceRecords.filter((r) => r.session.semester_course.id === selectedCourseId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case "ABSENT":
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case "EXCUSED":
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PRESENT":
        return t("present");
      case "ABSENT":
        return t("absent");
      case "EXCUSED":
        return t("excused");
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  if (enrolledCourses.length === 0 && attendanceRecords.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpenIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>{t("no_courses_enrolled")}</p>
        <p className="text-sm mt-2">{t("contact_admin_for_courses")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Filter Dropdown */}
      {enrolledCourses.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t("filter_by_course")}
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="input py-2 text-sm"
            >
              <option value="all">{t("all_courses")}</option>
              {enrolledCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.curriculum?.title} ({course.academic_year} - {t("semester")} {course.semester})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {Object.keys(summary).length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(summary).map(([courseId, data]) => {
            if (selectedCourseId !== "all" && courseId !== selectedCourseId) return null;
            
            const course = enrolledCourses.find((c) => c.id === courseId);
            const courseName = course?.curriculum?.title || "Unknown Course";
            
            return (
              <div key={courseId} className="card p-4">
                <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{courseName}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">{t("attendance_rate")}</span>
                  <span className={`text-lg font-bold ${
                    data.percentage >= 80 ? "text-green-600" : data.percentage >= 60 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {data.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      data.percentage >= 80 ? "bg-green-600" : data.percentage >= 60 ? "bg-yellow-600" : "bg-red-600"
                    }`}
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{t("present")}: {data.present}</span>
                  <span>{t("excused")}: {data.excused}</span>
                  <span>{t("total")}: {data.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("attendance_history")}</h3>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>{t("no_attendance_records")}</p>
            <p className="text-xs mt-1">{t("attendance_appears_after_session")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">{t("course")}</th>
                  <th className="text-left py-3 px-4">{t("date")}</th>
                  <th className="text-left py-3 px-4">{t("topic")}</th>
                  <th className="text-left py-3 px-4">{t("teacher")}</th>
                  <th className="text-left py-3 px-4">{t("status")}</th>
                  <th className="text-left py-3 px-4">{t("remark")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={record.id || index} className="border-t border-border">
                    <td className="py-3 px-4 font-medium">
                      {record.session.semester_course.curriculum?.title || "Course"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(record.session.session_date)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {record.session.topic || "-"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {record.session.teacher_name || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(record.status)}
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {record.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAttendanceTab;