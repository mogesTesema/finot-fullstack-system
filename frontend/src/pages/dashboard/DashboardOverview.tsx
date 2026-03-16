import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, StatsCard, SectionHeader } from "../../components/ui/Card";
import { Avatar, AvatarGroup } from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";
import {
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiHeart,
  FiMessageCircle,
  FiBriefcase,
  FiArrowRight,
  FiFileText,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

type DashboardEvent = {
  id?: string | number;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  place_name?: string;
  place_url?: string;
  status?: string;
  service_group_name?: string;
  photo?: string;
  created_by_name?: string;
};

const DashboardOverview = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [family, setFamily] = useState<any | null>(null);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [donationReminder, setDonationReminder] = useState(false);
  const [donatedThisWeek, setDonatedThisWeek] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const upcomingEvents = await api.getEvents();
        setEvents((upcomingEvents || []) as DashboardEvent[]);

        try {
          const fam = await api.getMyFamily();
          setFamily(fam);
        } catch (err: any) {
          setFamily(null);
          setFamilyError(
            err?.response?.status === 404
              ? t("no_family_assigned")
              : t("failed_load_family")
          );
        }

        try {
          const attendanceHistory = await api.getAttendance();
          setAttendance(attendanceHistory || []);
        } catch {
          setAttendance([]);
        } finally {
          setLoadingAttendance(false);
        }

        try {
          const donations = await api.getDonations();
          const now = new Date();
          const dayOfWeek = now.getDay();
          const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - diffToMonday);
          weekStart.setHours(0, 0, 0, 0);

          const hasWeeklyDonation = (donations || []).some((d: any) => {
            const donatedDate = new Date(d.donated_at || d.payment?.created_at);
            return (
              d.fund_category === "Weekly Donation" &&
              d.payment?.status === "COMPLETED" &&
              donatedDate >= weekStart
            );
          });
          setDonatedThisWeek(hasWeeklyDonation);
        } catch {}
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user) fetchDashboardData();
    setDonationReminder(new Date().getDay() === 4);
  }, [user]);

  const getGroupKey = (groupName: string) => {
    const mapping: Record<string, string> = {
      "ትምህርት ክፍል": "group_teaching_name",
      "አባላት እና እንክብካቤ ክፍል": "group_membership_name",
      "ልማት ክፍል": "group_development_name",
      "መዝሙር ክፍል": "group_choir_name",
      "ሙያ እና ተራድኦ": "group_professional_name",
      "ቁዋንቁዋና ልዩ ልዩ ክፍል": "group_language_name",
      "ሂሳብ ክፍል": "group_finance_name",
      "ኦዲት ክፍል": "group_audit_name",
      "ባች እና መርሃግብር": "group_batch_name",
      "መረጃ እና ክትትል ክፍል": "group_media_name",
    };
    return mapping[groupName];
  };

  const profile = user?.profile || ({} as any);
  const assignedGroupName = profile.assignedGroup || "";
  const groupKey = getGroupKey(assignedGroupName);
  const assignedGroup = groupKey ? t(groupKey) : (assignedGroupName || t("not_assigned"));

  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100)
    : 0;

  const quickActions = [
    { label: t("make_donation", "Make a Donation"), icon: FiHeart, to: "/dashboard/donations/give", color: "bg-success/10 text-success" },
    { label: t("view_events", "View Events"), icon: FiCalendar, to: "/dashboard/events", color: "bg-primary/10 text-primary" },
    { label: t("service_group", "Service Group"), icon: FiBriefcase, to: "/dashboard/service", color: "bg-accent/10 text-accent-foreground" },
    { label: t("qa_forum", "Q&A Forum"), icon: FiMessageCircle, to: "/dashboard/questions", color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-6 bg-[#F8FAFC] min-h-screen">

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("attendance_rate", "Attendance Rate")}
          value={`${attendanceRate}%`}
          icon={<FiFileText className="h-5 w-5 text-blue-600" />}
        />
        <StatsCard
          title={t("upcoming_events", "Upcoming Events")}
          value={events.length}
          icon={<FiClock className="h-5 w-5 text-amber-500" />}
        />
        <StatsCard
          title={t("tab_family", "My Family")}
          value={family?.siblings?.length || 0}
          icon={<FiCheckCircle className="h-5 w-5 text-emerald-500" />}
        />
        <StatsCard
          title={t("service_group", "Service Group")}
          value={assignedGroup}
          icon={<FiAlertTriangle className="h-5 w-5 text-red-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <Card className="flex flex-col" padding="none">
             <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                   <h3 className="text-base font-semibold text-slate-900">{t("upcoming_events", "Recent Events")}</h3>
                   <p className="text-xs text-muted-foreground mt-0.5">Latest events assigned to you</p>
                </div>
                <Link to="/dashboard/events" className="text-sm font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 self-start">
                   View All <FiArrowRight className="h-4 w-4" />
                </Link>
             </div>
             <div className="p-6">
               {loadingEvents ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="skeleton h-24 rounded-xl" />
                   ))}
                 </div>
               ) : events.length === 0 ? (
                 <EmptyState
                   icon={<FiCalendar className="h-8 w-8" />}
                   title={t("no_upcoming_events", "No Upcoming Events")}
                   description={t("events_check_back", "Check back later")}
                 />
               ) : (
                 <div className="space-y-4">
                   {events.slice(0, 2).map((event) => (
                     <div
                       key={event.id}
                       className="group flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#EDCF07] hover:shadow-md hover:bg-[#EDCF07]/5"
                     >
                       <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-slate-800">{event.title}</h4>
                              <span className="text-[10px] uppercase font-bold bg-[#253D7F]/10 text-[#253D7F] px-2 py-0.5 rounded">UPCOMING</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{event.place_name || t("tbd", "TBD")}</p>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded border border-amber-100">MEDIUM</span>
                       </div>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 font-medium">
                           <span className="flex items-center gap-1.5">📍 Location Available</span>
                           <span className="flex items-center gap-1.5">📅 {event.start_date ? new Date(event.start_date).toLocaleDateString() : ""}</span>
                           <span className="flex items-center gap-1.5">👤 {event.created_by_name || "Organizer"}</span>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </Card>

          {/* Recent Attendance */}
          <Card className="flex flex-col" padding="none">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                   <h3 className="text-base font-semibold text-slate-900">{t("recent_attendance", "Recent Attendance")}</h3>
                   <p className="text-xs text-muted-foreground mt-0.5">Your recent participation</p>
                </div>
                <Link to="/dashboard/attendance" className="text-sm font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                   View All <FiArrowRight className="h-4 w-4" />
                </Link>
             </div>
             <div className="p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {loadingAttendance ? (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-20 rounded-xl" />
                      ))}
                    </>
                  ) : attendance.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyState
                          icon={<FiCheckCircle className="h-8 w-8" />}
                          title={t("no_attendance_records", "No Attendance")}
                          description={t("attendance_history_will_appear", "Attendance will appear here")}
                        />
                    </div>
                  ) : (
                    attendance.slice(0, 2).map((record: any) => (
                      <div key={record.id} className="group border border-slate-100 rounded-xl p-4 flex items-start justify-between bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#EDCF07] hover:shadow-md hover:bg-[#EDCF07]/5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-800 text-sm">{record.event_title || t("event", "Event")}</p>
                          <p className="mt-1 text-xs text-slate-500 font-medium tracking-wide">📅 {record.event_date || record.date}</p>
                        </div>
                        <Badge
                          variant={
                            record.status === "PRESENT"
                              ? "success"
                              : record.status === "ABSENT"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {String(t("status_" + record.status.toLowerCase(), { defaultValue: record.status }))}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </Card>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
           {/* Quick Actions List styled like the image */}
           <Card className="flex flex-col" padding="none">
             <div className="px-6 py-5">
               <h3 className="text-base font-semibold text-slate-900">{t("quick_actions", "Quick Actions")}</h3>
               <div className="mt-4 flex flex-col rounded-lg border border-slate-200 bg-white">
                 {quickActions.map((action, idx) => (
                    <Link key={action.to} to={action.to} className={`flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors ${idx !== quickActions.length - 1 ? 'border-b border-slate-200' : ''}`}>
                       <action.icon className="h-5 w-5 text-slate-600" />
                       <span className="text-sm font-semibold text-slate-700">{action.label}</span>
                    </Link>
                 ))}
               </div>
             </div>
           </Card>
           
           {/* Family Card styled softly */}
           <Card className="flex flex-col" padding="none">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-base font-semibold text-slate-900">{t("my_family", "My Family")}</h3>
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
             </div>
             <div className="p-6">
               {familyError ? (
                 <EmptyState icon={<FiUsers className="h-6 w-6" />} title={t("no_family_yet", "No Family")} description={familyError} />
               ) : !family ? (
                 <div className="space-y-3">
                   {[1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                 </div>
               ) : (
                 <div className="space-y-4">
                   {[
                     { label: t("spiritual_father", "Father"), name: family.father?.name },
                     { label: t("spiritual_mother", "Mother"), name: family.mother?.name },
                   ].map((parent) => (
                     <div key={parent.label} className="flex items-center gap-4">
                       <Avatar src={null} alt={parent.name || "?"} size="md" />
                       <div>
                         <p className="text-sm font-semibold text-slate-900">{parent.name || "—"}</p>
                         <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">{parent.label}</p>
                       </div>
                     </div>
                   ))}
                   {family.siblings?.length > 0 && (
                     <div className="pt-5 border-t border-slate-100">
                       <p className="mb-3 text-xs font-semibold text-slate-500">
                         {t("siblings_count", { count: family.siblings.length })}
                       </p>
                       <AvatarGroup
                         avatars={family.siblings.map((sib: any) => ({
                           src: null,
                           alt: sib.name || "?",
                         }))}
                         max={6}
                         size="sm"
                       />
                     </div>
                   )}
                 </div>
               )}
               <div className="mt-6 text-center">
                 <Link to="/dashboard/family" className="text-sm font-semibold text-[#253D7F] hover:underline flex items-center justify-center gap-1">
                   View Full Details
                 </Link>
               </div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
