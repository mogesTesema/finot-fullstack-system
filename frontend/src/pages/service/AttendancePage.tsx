import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { AttendanceRecord } from "../../types";
import EmptyState from "../../components/ui/EmptyState";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusStyles: Record<string, string> = {
  PRESENT: "bg-success/10 text-success",
  ABSENT: "bg-destructive/10 text-destructive",
  LATE: "bg-warning/10 text-warning",
  EXCUSED: "bg-blue-100 text-blue-600",
};

const AttendancePage = () => {
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
      } finally { setLoading(false); }
    };
    if (user) fetchAttendance();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <div className="card">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <CalendarIcon className="h-5 w-5 text-accent-foreground" />
          My Attendance
        </h2>
        {attendance.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="h-8 w-8" />}
            title="No attendance records"
            description="Your attendance history will appear here."
          />
        ) : (
          <div className="space-y-2">
            {attendance.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm truncate">{a.event_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.event_date ? new Date(a.event_date).toLocaleDateString() : "—"}
                    {a.remark && ` • ${a.remark}`}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${statusStyles[a.status] || "bg-muted text-muted-foreground"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AttendancePage;