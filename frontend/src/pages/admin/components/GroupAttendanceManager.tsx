import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Member {
  id: number;
  name: string;
  email: string;
}

export default function GroupAttendanceManager({ groupId }: { groupId: number }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Track attendance state for each student: studentId -> status
  const [attendanceState, setAttendanceState] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { default: axiosInstance } = await import("../../../lib/axios");
      
      // Fetch members of this admin's group
      const membersRes = await axiosInstance.get('/api/service/attendance/group-members/');
      setMembers(membersRes.data);
      
      // Fetch events to put in the dropdown
      const eventsData = await api.getEvents();
      // Show this group's events + global events for attendance marking
      const relevantEvents = eventsData.filter(
        (e: any) => e.service_group === groupId || e.service_group === null
      );
      setEvents(relevantEvents);
      
      if (relevantEvents.length > 0) {
        setSelectedEventId(relevantEvents[0].id.toString());
      }
      
      // Initialize attendance state to 'PRESENT' by default
      const initialAttendance: Record<number, string> = {};
      membersRes.data.forEach((m: Member) => {
        initialAttendance[m.id] = 'PRESENT';
      });
      setAttendanceState(initialAttendance);
      
    } catch (err) {
      toast.error("Failed to fetch group data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: string) => {
    const newState: Record<number, string> = {};
    members.forEach(m => {
      newState[m.id] = status;
    });
    setAttendanceState(newState);
  };

  const handleSubmit = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }

    setSubmitting(true);
    try {
      const attendances = Object.entries(attendanceState).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        status: status,
        remark: ""
      }));

      const payload = {
        event_id: parseInt(selectedEventId),
        attendances: attendances
      };

      const { default: axiosInstance } = await import("../../../lib/axios");
      await axiosInstance.post('/api/service/attendance/mark/', payload);
      
      toast.success("Attendance recorded successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to record attendance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between bg-card p-6 rounded-xl border border-border shadow-soft">
        <div className="w-full md:w-1/2">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Select Event</label>
          <select 
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            <option value="" disabled>-- Select Event --</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title} ({new Date(event.start_date).toLocaleDateString()})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => markAll('PRESENT')} className="btn-outline text-xs py-1.5 px-3">Mark All Present</button>
          <button onClick={() => markAll('ABSENT')} className="btn-outline text-xs py-1.5 px-3 border-destructive/50 text-destructive hover:bg-destructive/10">Mark All Absent</button>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-soft text-muted-foreground">
          No students are currently active in this service group.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase text-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {member.name}
                      <span className="block text-xs text-muted-foreground font-normal mt-0.5">{member.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(member.id, 'PRESENT')}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            attendanceState[member.id] === 'PRESENT'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50'
                              : 'bg-transparent text-muted-foreground border border-border hover:bg-muted'
                          }`}
                        >
                          <CheckCircleIcon className="h-4 w-4" /> Present
                        </button>
                        <button
                          onClick={() => handleStatusChange(member.id, 'ABSENT')}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            attendanceState[member.id] === 'ABSENT'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50'
                              : 'bg-transparent text-muted-foreground border border-border hover:bg-muted'
                          }`}
                        >
                          <XCircleIcon className="h-4 w-4" /> Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(member.id, 'EXCUSED')}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            attendanceState[member.id] === 'EXCUSED'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                              : 'bg-transparent text-muted-foreground border border-border hover:bg-muted'
                          }`}
                        >
                          <ClockIcon className="h-4 w-4" /> Excused
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedEventId || members.length === 0}
              className="btn-primary"
            >
              {submitting ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
