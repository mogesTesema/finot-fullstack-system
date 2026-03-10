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
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  HomeIcon,
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

type TabKey = "overview" | "events" | "family" | "attendance" | "donations" | "qa";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: HomeIcon },
  { key: "events", label: "Events", icon: CalendarIcon },
  { key: "family", label: "Family", icon: UsersIcon },
  { key: "attendance", label: "Attendance", icon: CheckBadgeIcon },
  { key: "donations", label: "Donations", icon: HeartIcon },
  { key: "qa", label: "Q&A", icon: ChatBubbleLeftRightIcon },
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
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
          setFamilyError(err?.response?.status === 404 ? "You have not been assigned a family yet." : "Could not load family information.");
        }
        try {
          const attendanceHistory = await api.getAttendance();
          setAttendance(attendanceHistory || []);
        } catch { setAttendance([]); }
        finally { setLoadingAttendance(false); }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally { setLoadingEvents(false); }
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

      <main className="flex-1 overflow-auto">
        {/* Top Header Bar */}
        <div className="bg-primary px-4 md:px-8 pt-6 pb-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-6xl mx-auto">
            <motion.div variants={fadeIn} className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={profileImage}
                  alt={fullName}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-accent/40"
                  onError={(event: SyntheticEvent<HTMLImageElement>) => {
                    event.currentTarget.src = "/images/default-avatar.jpg";
                  }}
                />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">
                    Welcome back, {fullName.split(" ")[0]} 👋
                  </h1>
                  <p className="text-primary-foreground/60 text-sm">{department} • {batch}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-accent/20 text-accent text-xs font-semibold">
                  {assignedGroup}
                </span>
                <Link to="/profile" className="p-2 rounded-xl text-primary-foreground/60 hover:text-accent hover:bg-white/10 transition">
                  <Cog6ToothIcon className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            {/* Donation reminder */}
            {donationReminder && (
              <motion.div variants={fadeIn} className="bg-accent/15 border border-accent/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-xl">
                    <HeartIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground text-sm">Weekly Donation Reminder</h3>
                    <p className="text-xs text-primary-foreground/60">It's Thursday — consider your weekly 1 Birr donation.</p>
                  </div>
                </div>
                <Link to="/donate/inside" className="btn-primary text-xs px-4 py-2">Donate Now</Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Tab Navigation - overlaps the header */}
        <div className="-mt-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-card rounded-2xl shadow-elevated border border-border p-1.5 flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 md:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <OverviewTab
                  events={events}
                  loadingEvents={loadingEvents}
                  family={family}
                  familyError={familyError}
                  attendance={attendance}
                  loadingAttendance={loadingAttendance}
                  assignedGroup={assignedGroup}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "events" && <EventsTab events={events} loading={loadingEvents} />}
              {activeTab === "family" && <FamilyTab family={family} error={familyError} />}
              {activeTab === "attendance" && <AttendanceTab attendance={attendance} loading={loadingAttendance} />}
              {activeTab === "donations" && <DonationsTab />}
              {activeTab === "qa" && <QATab />}
            </motion.div>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 flex justify-around z-40">
          {tabs.slice(0, 5).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-xs transition ${
                activeTab === tab.key ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

/* ===== Tab Components ===== */

function OverviewTab({ events, loadingEvents, family, familyError, attendance, loadingAttendance, assignedGroup, setActiveTab }: any) {
  const quickActions = [
    { label: "Donate", icon: HeartIcon, to: "/donate/inside", color: "bg-success/10 text-success" },
    { label: "Q&A Forum", icon: ChatBubbleLeftRightIcon, to: "/dashboard/qa", color: "bg-primary/10 text-primary" },
    { label: "Attendance", icon: CheckBadgeIcon, to: "/service/attendance", color: "bg-accent/10 text-accent-foreground" },
    { label: "Services", icon: SparklesIcon, to: "/services", color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Quick Actions - full width */}
      <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="card hover:shadow-elevated transition-all hover:-translate-y-0.5 flex items-center gap-3 group"
          >
            <div className={`p-2.5 rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="font-medium text-foreground text-sm">{action.label}</span>
            <ArrowRightIcon className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition" />
          </Link>
        ))}
      </div>

      {/* Events preview */}
      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Upcoming Events
          </h3>
          <button onClick={() => setActiveTab("events")} className="text-xs text-primary font-medium hover:text-primary-light">View all →</button>
        </div>
        {loadingEvents ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : events.length === 0 ? (
          <EmptyState icon={<CalendarIcon className="h-8 w-8" />} title="No upcoming events" description="Check back soon." />
        ) : (
          <div className="space-y-2.5">
            {events.slice(0, 3).map((event: DashboardEvent) => (
              <div key={event.event_id} className="flex gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition">
                <div className="flex-shrink-0 w-11 h-11 bg-primary/10 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-primary uppercase">
                    {event.event_date ? new Date(event.event_date).toLocaleDateString("en", { month: "short" }) : ""}
                  </span>
                  <span className="text-sm font-bold text-primary leading-none">
                    {event.event_date ? new Date(event.event_date).getDate() : ""}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-foreground text-sm truncate">{event.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">🕐 {event.event_time} • 📍 {event.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family preview */}
      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
            <UsersIcon className="h-5 w-5 text-primary" />
            My Family
          </h3>
          <button onClick={() => setActiveTab("family")} className="text-xs text-primary font-medium hover:text-primary-light">View all →</button>
        </div>
        {familyError ? (
          <EmptyState icon={<UsersIcon className="h-8 w-8" />} title="No family yet" description={familyError} />
        ) : !family ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-2.5">
            {[{ label: "Father", name: family.father?.name }, { label: "Mother", name: family.mother?.name }].map((parent) => (
              <div key={parent.label} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {parent.name?.[0] || "?"}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{parent.label}</p>
                  <p className="text-sm font-medium text-foreground">{parent.name || "—"}</p>
                </div>
              </div>
            ))}
            {family.siblings?.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Siblings ({family.siblings.length})</p>
                <div className="flex -space-x-2">
                  {family.siblings.slice(0, 6).map((sib: any, i: number) => (
                    <div key={sib.id || i} className="w-8 h-8 rounded-full bg-accent/20 border-2 border-card flex items-center justify-center text-xs font-bold text-accent-foreground" title={sib.name}>
                      {sib.name?.[0] || "?"}
                    </div>
                  ))}
                  {family.siblings.length > 6 && (
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">+{family.siblings.length - 6}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Service group badge */}
      <div className="lg:col-span-2 card border-l-4 border-l-accent">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-xl">
            <SparklesIcon className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Service Group</p>
            <p className="text-lg font-bold text-foreground">{assignedGroup}</p>
          </div>
          <Link to="/service-groups/select" className="ml-auto btn-primary text-xs px-4 py-2">
            View Groups
          </Link>
        </div>
      </div>

      {/* Attendance preview */}
      <div className="lg:col-span-2 card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
            <CheckBadgeIcon className="h-5 w-5 text-primary" />
            Recent Attendance
          </h3>
          <button onClick={() => setActiveTab("attendance")} className="text-xs text-primary font-medium hover:text-primary-light">View all →</button>
        </div>
        {loadingAttendance ? (
          <div className="grid grid-cols-2 gap-2">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : attendance.length === 0 ? (
          <EmptyState icon={<CheckBadgeIcon className="h-8 w-8" />} title="No records" description="Your attendance will appear here." />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {attendance.slice(0, 4).map((row: any) => (
              <div key={row.id} className="p-3 rounded-xl bg-muted/50">
                <p className="text-sm font-medium text-foreground truncate">{row.event_title || "Event"}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{row.event_date || row.date}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    row.status === "PRESENT" ? "bg-success/10 text-success" :
                    row.status === "ABSENT" ? "bg-destructive/10 text-destructive" :
                    "bg-warning/10 text-warning"
                  }`}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventsTab({ events, loading }: { events: DashboardEvent[]; loading: boolean }) {
  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>;
  if (events.length === 0) return <EmptyState icon={<CalendarIcon className="h-10 w-10" />} title="No upcoming events" description="Check back soon for fellowship gatherings." />;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <div key={event.event_id} className="card hover:shadow-elevated transition-all">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-primary uppercase">{event.event_date ? new Date(event.event_date).toLocaleDateString("en", { month: "short" }) : ""}</span>
              <span className="text-lg font-bold text-primary leading-none">{event.event_date ? new Date(event.event_date).getDate() : ""}</span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{event.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{event.quote}</p>
              <p className="text-xs text-muted-foreground mt-2">🕐 {event.event_time} • 📍 {event.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FamilyTab({ family, error }: { family: any; error: string | null }) {
  if (error) return <EmptyState icon={<UsersIcon className="h-10 w-10" />} title="No family assigned" description={error} />;
  if (!family) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;
  return (
    <div className="max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {[{ label: "Spiritual Father", name: family.father?.name, phone: family.father?.phone },
          { label: "Spiritual Mother", name: family.mother?.name, phone: family.mother?.phone }].map((p) => (
          <div key={p.label} className="card border-l-4 border-l-primary">
            <p className="text-xs text-muted-foreground mb-1">{p.label}</p>
            <p className="font-semibold text-foreground text-lg">{p.name || "—"}</p>
            {p.phone && <p className="text-sm text-muted-foreground mt-1">📞 {p.phone}</p>}
          </div>
        ))}
      </div>
      {family.siblings?.length > 0 && (
        <>
          <h3 className="font-semibold text-foreground mb-3">Siblings ({family.siblings.length})</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {family.siblings.map((sib: any, i: number) => (
              <div key={sib.id || i} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent-foreground">
                  {sib.name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{sib.name}</p>
                  <p className="text-xs text-muted-foreground">{sib.department || "Student"}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <Link to="/service/family" className="btn-outline text-sm mt-6 inline-flex items-center gap-2">
        View Full Family Page <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

function AttendanceTab({ attendance, loading }: { attendance: any[]; loading: boolean }) {
  if (loading) return <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;
  if (attendance.length === 0) return <EmptyState icon={<CheckBadgeIcon className="h-10 w-10" />} title="No attendance records" description="Your attendance history will appear here." />;
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {attendance.map((row: any) => (
          <div key={row.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-foreground text-sm truncate">{row.event_title || "Event"}</p>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                row.status === "PRESENT" ? "bg-success/10 text-success" :
                row.status === "ABSENT" ? "bg-destructive/10 text-destructive" :
                "bg-warning/10 text-warning"
              }`}>{row.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">{row.event_date || row.date}</p>
          </div>
        ))}
      </div>
      <Link to="/service/attendance" className="btn-outline text-sm mt-6 inline-flex items-center gap-2">
        View All Attendance <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

function DonationsTab() {
  return (
    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
      <Link to="/donate/inside" className="card hover:shadow-elevated transition-all hover:-translate-y-1 group border-l-4 border-l-success">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-success/10 rounded-xl">
            <HeartIcon className="h-6 w-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Make a Donation</h3>
            <p className="text-sm text-muted-foreground">Support the fellowship</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
      <Link to="/donate/history" className="card hover:shadow-elevated transition-all hover:-translate-y-1 group border-l-4 border-l-primary">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Donation History</h3>
            <p className="text-sm text-muted-foreground">View past contributions</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
}

function QATab() {
  return (
    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
      <Link to="/dashboard/qa" className="card hover:shadow-elevated transition-all hover:-translate-y-1 group border-l-4 border-l-primary">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Browse Questions</h3>
            <p className="text-sm text-muted-foreground">View community Q&A</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
      <Link to="/anonymous/ask" className="card hover:shadow-elevated transition-all hover:-translate-y-1 group border-l-4 border-l-accent">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-xl">
            <SparklesIcon className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Ask a Question</h3>
            <p className="text-sm text-muted-foreground">Ask anonymously</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
}

export default StudentDashboard;