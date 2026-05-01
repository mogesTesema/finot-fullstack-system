// src/components/attendance/CourseAttendanceTab.tsx

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "../ui/Spinner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { StudentAttendanceRecord } from "../../types/course";

interface CourseAttendanceTabProps {
  userId?: number;
}

const CourseAttendanceTab = ({ userId }: CourseAttendanceTabProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Record<string, { total: number; present: number; percentage: number }>>({});

  const studentId = userId || user?.id;

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        const records = await api.getMyAttendanceWithDetails(studentId);
        setAttendanceRecords(records);
        
        // Calculate summary per course
        const courseSummary: Record<string, { total: number; present: number; percentage: number }> = {};
        records.forEach((record) => {
          if (!courseSummary[record.courseName]) {
            courseSummary[record.courseName] = { total: 0, present: 0, percentage: 0 };
          }
          courseSummary[record.courseName].total++;
          if (record.status === "PRESENT") {
            courseSummary[record.courseName].present++;
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
      case "LATE":
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
      case "LATE":
        return t("late");
      default:
        return status;
    }
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
              <h3 className="font-semibold text-foreground mb-2">{courseName}</h3>
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
              <p className="text-xs text-muted-foreground mt-2">
                {data.present} / {data.total} {t("sessions_attended")}
              </p>
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
                <th className="text-left py-3 px-4">{t("status")}</th>
                <th className="text-left py-3 px-4">{t("remark")}</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="py-3 px-4 font-medium">{record.courseName}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(record.sessionDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(record.status)}
                      {getStatusText(record.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{record.remark || "-"}</td>
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