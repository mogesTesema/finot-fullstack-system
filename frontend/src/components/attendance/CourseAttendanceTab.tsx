// src/components/attendance/CourseAttendanceTab.tsx

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "../ui/Spinner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// Updated interface matching new API response
interface AttendanceRecord {
  id: string;
  session: {
    id: string;
    date: string;
    topic: string | null;
    teacher_name: string | null;
    semester_course: {
      id: string;
      course_details: {
        id: string;
        title: string;
        code: string;
      };
      academic_year: string;
      semester: number;
    };
  };
  status: "PRESENT" | "ABSENT" | "EXCUSED";
  remarks: string | null;
  marked_at: string;
}

interface CourseAttendanceTabProps {
  userId?: number;
}

const CourseAttendanceTab = ({ userId }: CourseAttendanceTabProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Record<string, { total: number; present: number; excused: number; percentage: number }>>({});

  const studentId = userId || user?.id;

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        // Use the new endpoint: GET /api/course/attendance/?student=<uuid>
        // Backend auto-filters to only return current student's records
        const records = await api.getMyCourseAttendance();
        setAttendanceRecords(records);
        
        // Calculate summary per course
        const courseSummary: Record<string, { total: number; present: number; excused: number; percentage: number }> = {};
        
        records.forEach((record: AttendanceRecord) => {
          const courseName = record.session.semester_course.course_details?.title || "Unknown Course";
          
          if (!courseSummary[courseName]) {
            courseSummary[courseName] = { total: 0, present: 0, excused: 0, percentage: 0 };
          }
          
          courseSummary[courseName].total++;
          if (record.status === "PRESENT") {
            courseSummary[courseName].present++;
          }
          if (record.status === "EXCUSED") {
            courseSummary[courseName].excused++;
          }
        });
        
        // Calculate percentages
        Object.keys(courseSummary).forEach((courseName) => {
          const { total, present } = courseSummary[courseName];
          courseSummary[courseName].percentage = total > 0 ? (present / total) * 100 : 0;
        });
        
        setSummary(courseSummary);
      } catch (error) {
        console.error("Failed to fetch course attendance", error);
        toast.error(t("failed_to_load_attendance"));
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

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

  if (attendanceRecords.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>{t("no_course_attendance_records")}</p>
        <p className="text-sm mt-2">{t("attendance_appears_after_session")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {Object.keys(summary).length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(summary).map(([courseName, data]) => (
            <div key={courseName} className="card p-4">
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
          ))}
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="card overflow-hidden">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("attendance_history")}</h3>
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
              {attendanceRecords.map((record, index) => (
                <tr key={record.id || index} className="border-t border-border">
                  <td className="py-3 px-4 font-medium">
                    {record.session.semester_course.course_details?.title || "Course"}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {formatDate(record.session.date)}
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
      </div>
    </div>
  );
};

export default CourseAttendanceTab;