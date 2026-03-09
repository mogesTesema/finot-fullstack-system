import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { AttendanceRecord } from "../../types";
import Swal from "sweetalert2";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const statusColors: Record<string, string> = {
  PRESENT: "text-green-400",
  ABSENT: "text-red-400",
  LATE: "text-yellow-400",
  EXCUSED: "text-blue-400",
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
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load attendance history.",
          confirmButtonColor: "#fbbf24",
          background: "#142850",
          color: "#fff",
        });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAttendance();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="bg-[#142850] rounded-2xl shadow-xl p-6"
    >
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
        <CalendarIcon className="h-6 w-6 mr-2" />
        My Attendance
      </h2>
      {attendance.length === 0 ? (
        <p className="text-gray-400">No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-yellow-400 border-b border-gray-700">
              <tr>
                <th className="py-2">Event</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b border-gray-700">
                  <td className="py-2 text-white">{a.event_title}</td>
                  <td className="text-gray-300">
                    {a.event_date ? new Date(a.event_date).toLocaleDateString() : "—"}
                  </td>
                  <td className={statusColors[a.status] || "text-gray-300"}>{a.status}</td>
                  <td className="text-gray-300">{a.remark || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default AttendancePage;
