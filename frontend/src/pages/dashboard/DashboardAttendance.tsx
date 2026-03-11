import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader, StatsCard } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { AttendanceRecord } from "../../types";
import { CheckCircle, Calendar, TrendingUp, Award } from "react-icons/fi";

const DashboardAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await api.getAttendance();
        setAttendance(data);
      } catch (error) {
        console.error("Failed to fetch attendance", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAttendance();
  }, [user]);

  // Calculate stats
  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const lateCount = attendance.filter((a) => a.status === "LATE").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const statusStyles: Record<string, string> = {
    PRESENT: "success",
    ABSENT: "destructive",
    LATE: "warning",
    EXCUSED: "default",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Attendance"
        description="Track your participation in fellowship activities"
        icon={<CheckCircle className="h-6 w-6" />}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Present"
          value={presentCount}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title="Late"
          value={lateCount}
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatsCard
          title="Total Events"
          value={attendance.length}
          icon={<Award className="h-6 w-6" />}
        />
      </div>

      {/* Attendance List */}
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Attendance History</h3>
        {attendance.length === 0 ? (
          <EmptyState
            icon={<CheckCircle className="h-8 w-8" />}
            title="No attendance records"
            description="Your attendance history will appear here."
          />
        ) : (
          <div className="space-y-2">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{record.event_title || "Event"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {record.event_date ? new Date(record.event_date).toLocaleDateString() : "—"}
                    {record.remark && ` • ${record.remark}`}
                  </p>
                </div>
                <Badge variant={statusStyles[record.status] as any} size="md">
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardAttendance;
