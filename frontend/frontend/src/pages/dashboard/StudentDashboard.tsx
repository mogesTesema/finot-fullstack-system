import { useState, useEffect, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/navigation/Sidebar";
import { ArrowLeftIcon, CalendarIcon, UsersIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import { api } from "../../lib/api";

type DashboardEvent = {
  event_id?: string | number;
  title?: string;
  quote?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
};

type NotificationItem = {
  is_read?: boolean;
};

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [family, setFamily] = useState<any | null>(null);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [donationReminder, setDonationReminder] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const upcomingEvents = await api.getEvents();
        setEvents((upcomingEvents || []) as DashboardEvent[]);
        const notifs = await api.getUserNotifications(user?.id);
        const notificationItems = (notifs || []) as NotificationItem[];
        setNotifCount(notificationItems.filter((notification) => !notification.is_read).length);

        try {
          const fam = await api.getMyFamily();
          setFamily(fam);
        } catch (err: any) {
          setFamily(null);
          if (err?.response?.status === 404) {
            setFamilyError("You have not been assigned a family yet.");
          } else {
            setFamilyError("Could not load family information.");
          }
        }

        try {
          const attendanceHistory = await api.getAttendance();
          setAttendance(attendanceHistory || []);
        } catch (err) {
          setAttendance([]);
        } finally {
          setLoadingAttendance(false);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    if (user) fetchDashboardData();

    // Mock donation reminder on Thursday
    const today = new Date().getDay();
    setDonationReminder(today === 4);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return <div className="p-8 text-white">Loading...</div>;

  const fullName = user.full_name || "";
  const userId = user.id || "";
  const profile = user.profile || {};
  const department = profile.department || "";
  const batch = profile.batch || "";
  const assignedGroup = profile.assignedGroup || "Not assigned";
  const profileImage = profile.profile_image || "/images/default-avatar.jpg";

  return (
    <div className="flex min-h-screen bg-[#1B3067]">
      <Sidebar notifCount={notifCount} onLogout={handleLogout} />

      <main className="flex-1 p-6 overflow-auto pt-20">
        <div className="max-w-5xl mx-auto">
          {/* Back to Home button */}
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Donation reminder notification */}
          {donationReminder && (
            <div className="bg-[#142850] rounded-2xl shadow-xl p-6 mb-6 border-l-4 border-yellow-400">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-yellow-400">💛 Weekly Donation Reminder</h3>
                  <p className="text-gray-300 mt-1">
                    It's Thursday! Consider your weekly 1 Birr donation to support our community.
                  </p>
                </div>
                <Link
                  to="/donate/inside"
                  className="bg-yellow-400 text-[#1B3067] px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          )}

          {/* Profile Summary Card */}
          <div className="bg-[#142850] rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center space-x-6">
              <img
                src={profileImage}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
                onError={(event: SyntheticEvent<HTMLImageElement>) => {
                  event.currentTarget.src = "/images/default-avatar.jpg";
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-yellow-400">{fullName}</h1>
                <p className="text-gray-300 text-lg">{department} • {batch}</p>
                <p className="text-gray-400 text-sm mt-1">ID: {userId}</p>
                <p className="text-green-400 font-semibold mt-2">
                  Service Group: {assignedGroup}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-3">
              <Link
                to="/services"
                className="inline-flex items-center justify-center bg-[#1B3067] text-yellow-400 px-4 py-2 rounded-lg font-semibold hover:bg-[#1f3a78] transition"
              >
                Open Services
              </Link>
              <Link
                to="/service-groups/select"
                className="inline-flex items-center justify-center bg-yellow-400 text-[#1B3067] px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
              >
                Service Selection
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-[#142850] rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2" />
              Upcoming Events
            </h2>

            {loadingEvents ? (
              <p className="text-gray-400">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-gray-400">No upcoming events.</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.event_id}
                    className="bg-[#1B3067] rounded-lg p-4 border border-gray-700 hover:border-yellow-400 transition"
                  >
                    <h3 className="text-lg font-semibold text-yellow-400">{event.title}</h3>
                    <p className="text-gray-300 text-sm mt-1">{event.quote}</p>
                    <p className="text-gray-300 text-sm mt-1">
                      📅 {event.event_date} at {event.event_time} • 📍 {event.location}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Family */}
          <div className="bg-[#142850] rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
              <UsersIcon className="h-6 w-6 mr-2" />
              My Family
            </h2>

            {familyError && <p className="text-gray-300">{familyError}</p>}

            {!familyError && !family && (
              <p className="text-gray-400">Loading family info...</p>
            )}

            {family && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1B3067] rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400">Father</p>
                    <p className="text-lg font-semibold text-yellow-300">{family.father?.name || "-"}</p>
                    {family.father?.phone && (
                      <p className="text-gray-300 text-sm">{family.father.phone}</p>
                    )}
                  </div>
                  <div className="bg-[#1B3067] rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400">Mother</p>
                    <p className="text-lg font-semibold text-yellow-300">{family.mother?.name || "-"}</p>
                    {family.mother?.phone && (
                      <p className="text-gray-300 text-sm">{family.mother.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#1B3067] rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400">Religious Father</p>
                    <p className="text-lg font-semibold text-yellow-300">{family.religious_father || "-"}</p>
                  </div>
                  <div className="bg-[#1B3067] rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400">Family Name</p>
                    <p className="text-lg font-semibold text-yellow-300">{family.name}</p>
                  </div>
                  <div className="bg-[#1B3067] rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400">Members</p>
                    <p className="text-lg font-semibold text-yellow-300">{family.member_count || family.siblings?.length || 0}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Siblings</p>
                  {family.siblings && family.siblings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {family.siblings.slice(0, 9).map((sib: any) => (
                        <div key={sib.id || sib.email || sib.name} className="bg-[#1B3067] rounded-lg p-3 border border-gray-700">
                          <p className="text-yellow-300 font-semibold text-sm">{sib.name}</p>
                          {sib.email && <p className="text-gray-300 text-xs">{sib.email}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-300">No siblings listed yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Attendance History */}
          <div className="bg-[#142850] rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
              <CheckBadgeIcon className="h-6 w-6 mr-2" />
              Attendance History
            </h2>

            {loadingAttendance ? (
              <p className="text-gray-400">Loading attendance...</p>
            ) : attendance.length === 0 ? (
              <p className="text-gray-400">No attendance records.</p>
            ) : (
              <div className="space-y-3">
                {attendance.slice(0, 8).map((row: any) => (
                  <div key={row.id} className="bg-[#1B3067] rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-300 font-semibold">{row.event_title || row.event || "Event"}</p>
                        <p className="text-gray-300 text-sm">{row.event_date || row.date}</p>
                        {row.remark && <p className="text-gray-400 text-sm mt-1">{row.remark}</p>}
                      </div>
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-200">
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;