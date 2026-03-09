import { useState, useEffect, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/navigation/Sidebar";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";
import EmptyState from "../../components/ui/EmptyState";
import {
  CalendarIcon,
  UsersIcon,
  CheckBadgeIcon,
  HeartIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../lib/api";
import { motion } from "framer-motion";

type DashboardEvent = {
  event_id?: string | number;
  title?: string;
  quote?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
};

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
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
        setNotifCount((notifs || []).filter((n: any) => !n.is_read).length);

        try {
          const fam = await api.getMyFamily();
          setFamily(fam);
        } catch (err: any) {
          setFamily(null);
          setFamilyError(err?.response?.status === 404
            ? "You have not been assigned a family yet."
            : "Could not load family information.");
        }

        try {
          const attendanceHistory = await api.getAttendance();
          setAttendance(attendanceHistory || []);
        } catch { setAttendance([]); }
        finally { setLoadingAttendance(false); }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    if (user) fetchDashboardData();
    setDonationReminder(new Date().getDay() === 4);
  }, [user]);

  const handleLogout = () => { logout(); navigate("/"); };

  if (!user) return (
    <div className="flex min-h-screen bg-background">
      <Sidebar notifCount={0} onLogout={() => {}} />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </main>
    </div>
  );

  const fullName = user.full_name || "";
  const profile = user.profile || {} as any;
  const department = profile.department || "";
  const batch = profile.batch || "";
  const assignedGroup = profile.assignedGroup || "Not assigned";
  const profileImage = profile.profile_image || "/images/default-avatar.jpg";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar notifCount={notifCount} onLogout={handleLogout} />

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-6xl mx-auto"
        >
          {/* Greeting */}
          <motion.div variants={fadeIn} className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, <span className="text-primary">{fullName.split(" ")[0]}</span> 👋
            </h1>
            <p className="text-muted-foreground mt-1">Here's your community overview</p>
          </motion.div>

          {/* Donation Reminder */}
          {donationReminder && (
            <motion.div
              variants={fadeIn}
              className="card mb-6 border-l-4 border-l-accent bg-accent/5"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-xl">
                    <HeartIcon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Weekly Donation Reminder</h3>
                    <p className="text-sm text-muted-foreground">
                      It's Thursday! Consider your weekly 1 Birr donation.
                    </p>
                  </div>
                </div>
                <Link to="/donate/inside" className="btn-primary text-sm px-4 py-2">
                  Donate Now
                </Link>
              </div>
            </motion.div>
          )}

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card - spans 2 cols on lg */}
            <motion.div variants={fadeIn} className="card lg:col-span-2">
              <div className="flex items-center gap-5">
                <img
                  src={profileImage}
                  alt={fullName}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-accent/30"
                  onError={(event: SyntheticEvent<HTMLImageElement>) => {
                    event.currentTarget.src = "/images/default-avatar.jpg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-foreground truncate">{fullName}</h2>
                  <p className="text-muted-foreground text-sm">{department} • {batch}</p>
                  <div className="flex items-center mt-2 gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                      {assignedGroup}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-success/10 text-success text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-3">
                <Link to="/profile" className="btn-outline text-sm px-4 py-2">View Profile</Link>
                <Link to="/services" className="btn-secondary text-sm px-4 py-2">Open Services</Link>
                <Link to="/service-groups/select" className="btn-primary text-sm px-4 py-2">
                  <SparklesIcon className="h-4 w-4 mr-1.5 inline" />
                  Service Selection
                </Link>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeIn} className="card">
              <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: "/donate/inside", label: "Make a Donation", icon: HeartIcon, color: "text-green-600 bg-green-50" },
                  { to: "/dashboard/qa", label: "Q&A Forum", icon: SparklesIcon, color: "text-purple-600 bg-purple-50" },
                  { to: "/service/attendance", label: "My Attendance", icon: CheckBadgeIcon, color: "text-blue-600 bg-blue-50" },
                ].map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition group"
                  >
                    <div className={`p-2 rounded-xl ${action.color}`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">{action.label}</span>
                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Events */}
            <motion.div variants={fadeIn} className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-accent-foreground" />
                  Upcoming Events
                </h3>
              </div>
              {loadingEvents ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
                </div>
              ) : events.length === 0 ? (
                <EmptyState
                  icon={<CalendarIcon className="h-8 w-8" />}
                  title="No upcoming events"
                  description="Check back soon for fellowship gatherings and activities."
                />
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.event_id} className="flex gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {event.event_date ? new Date(event.event_date).toLocaleDateString("en", { month: "short" }) : ""}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {event.event_date ? new Date(event.event_date).getDate() : ""}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.quote}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          🕐 {event.event_time} • 📍 {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Family */}
            <motion.div variants={fadeIn} className="card">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <UsersIcon className="h-5 w-5 text-accent-foreground" />
                My Family
              </h3>
              {familyError ? (
                <EmptyState
                  icon={<UsersIcon className="h-8 w-8" />}
                  title="No family yet"
                  description={familyError}
                />
              ) : !family ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Father", name: family.father?.name },
                    { label: "Mother", name: family.mother?.name },
                  ].map((parent) => (
                    <div key={parent.label} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {parent.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{parent.label}</p>
                        <p className="text-sm font-medium text-foreground">{parent.name || "—"}</p>
                      </div>
                    </div>
                  ))}
                  {/* Avatar cluster for siblings */}
                  {family.siblings && family.siblings.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">Siblings ({family.siblings.length})</p>
                      <div className="flex -space-x-2">
                        {family.siblings.slice(0, 6).map((sib: any, i: number) => (
                          <div
                            key={sib.id || i}
                            className="w-8 h-8 rounded-full bg-accent/20 border-2 border-card flex items-center justify-center text-xs font-bold text-accent-foreground"
                            title={sib.name}
                          >
                            {sib.name?.[0] || "?"}
                          </div>
                        ))}
                        {family.siblings.length > 6 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
                            +{family.siblings.length - 6}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <Link to="/service/family" className="text-sm text-primary font-medium hover:text-primary-light flex items-center gap-1 mt-2">
                    View full family
                    <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Attendance */}
            <motion.div variants={fadeIn} className="card lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckBadgeIcon className="h-5 w-5 text-accent-foreground" />
                  Recent Attendance
                </h3>
                <Link to="/service/attendance" className="text-sm text-primary font-medium hover:text-primary-light">
                  View all →
                </Link>
              </div>
              {loadingAttendance ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                </div>
              ) : attendance.length === 0 ? (
                <EmptyState
                  icon={<CheckBadgeIcon className="h-8 w-8" />}
                  title="No attendance records"
                  description="Your attendance history will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {attendance.slice(0, 4).map((row: any) => (
                    <div key={row.id} className="p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground truncate">{row.event_title || "Event"}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          row.status === "PRESENT" ? "bg-success/10 text-success" :
                          row.status === "ABSENT" ? "bg-destructive/10 text-destructive" :
                          "bg-warning/10 text-warning"
                        }`}>
                          {row.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{row.event_date || row.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;