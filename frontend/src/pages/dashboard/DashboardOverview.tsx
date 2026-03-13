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
  FiTrendingUp,
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

        // Check if user already donated "Weekly Donation" this week
        try {
          const donations = await api.getDonations();
          const now = new Date();
          // Get start of this week (Monday)
          const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
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
        } catch {
          // If donations fail to load, don't block the rest of the dashboard
        }
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

  // Calculate attendance stats
  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100)
    : 0;

  const quickActions = [
    { label: t("make_donation"), icon: FiHeart, to: "/dashboard/donations/give", color: "bg-success/10 text-success" },
    { label: t("view_events"), icon: FiCalendar, to: "/dashboard/events", color: "bg-primary/10 text-primary" },
    { label: t("service_group"), icon: FiBriefcase, to: "/dashboard/service", color: "bg-accent/10 text-accent-foreground" },
    { label: t("qa_forum"), icon: FiMessageCircle, to: "/dashboard/questions", color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-light p-6 text-white shadow-elevated md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {t("welcome_back", { name: user?.full_name.split(" ")[0] })}
            </h1>
            <p className="mt-2 text-primary-foreground/80">
              {profile.department} {profile.batch && `• ${profile.batch}`}
            </p>
          </div>
          <Avatar
            src={profile.profile_image}
            alt={user?.full_name || "User"}
            size="xl"
            className="hidden md:flex"
          />
        </div>

        {/* Donation Reminder / Thank You */}
        {donationReminder && (
          donatedThisWeek ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-green-500/20 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/30 p-2">
                  <FiCheckCircle className="h-5 w-5 text-green-200" />
                </div>
                <div>
                  <p className="font-semibold text-white">{t("thank_you_generosity")}</p>
                  <p className="text-sm text-white/80">
                    {t("already_donated_text")}
                  </p>
                </div>
              </div>
              <Link to="/dashboard/donations/history" className="btn-secondary text-sm">
                {t("view_history")}
              </Link>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-accent/20 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/30 p-2">
                  <FiHeart className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-white">{t("weekly_donation_reminder")}</p>
                  <p className="text-sm text-white/80">
                    {t("donation_reminder_text")}
                  </p>
                </div>
              </div>
              <Link to="/dashboard/donations/give" className="btn-secondary text-sm">
                {t("donate_now")}
              </Link>
            </div>
          )
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("attendance_rate")}
          value={`${attendanceRate}%`}
          icon={<FiCheckCircle className="h-6 w-6" />}
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title={t("upcoming_events")}
          value={events.length}
          icon={<FiCalendar className="h-6 w-6" />}
        />
        <StatsCard
          title={t("tab_family")}
          value={family?.siblings?.length || 0}
          icon={<FiUsers className="h-6 w-6" />}
        />
        <StatsCard
          title={t("service_group")}
          value={assignedGroup}
          icon={<FiBriefcase className="h-6 w-6" />}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader title={t("quick_actions")} icon={<FiTrendingUp className="h-6 w-6" />} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Card hoverable className="group">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{action.label}</p>
                  </div>
                  <FiArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <div>
          <SectionHeader
            title={t("upcoming_events")}
            icon={<FiCalendar className="h-5 w-5" />}
            action={
              <Link to="/dashboard/events" className="text-sm font-medium text-primary hover:text-primary-light">
                {t("view_all")}
              </Link>
            }
          />
          <Card>
            {loadingEvents ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <EmptyState
                icon={<FiCalendar className="h-8 w-8" />}
                title={t("no_upcoming_events")}
                description={t("events_check_back")}
              />
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-4 rounded-xl bg-muted/50 p-4 transition hover:bg-muted"
                  >
                    <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10">
                      <span className="text-xs font-bold uppercase text-primary">
                        {event.start_date
                          ? new Date(event.start_date).toLocaleDateString(undefined, { month: "short" })
                          : ""}
                      </span>
                      <span className="text-lg font-bold leading-none text-primary">
                        {event.start_date ? new Date(event.start_date).getDate() : ""}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("time")}: {event.start_date ? new Date(event.start_date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : ""} • 📍 {event.place_name || t("tbd")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* My Family */}
        <div>
          <SectionHeader
            title={t("my_family")}
            icon={<FiUsers className="h-5 w-5" />}
            action={
              <Link to="/dashboard/family" className="text-sm font-medium text-primary hover:text-primary-light">
                {t("view_all")}
              </Link>
            }
          />
          <Card>
            {familyError ? (
              <EmptyState
                icon={<FiUsers className="h-8 w-8" />}
                title={t("no_family_yet")}
                description={familyError}
              />
            ) : !family ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: t("spiritual_father"), name: family.father?.name },
                  { label: t("spiritual_mother"), name: family.mother?.name },
                ].map((parent) => (
                  <div key={parent.label} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                    <Avatar src={null} alt={parent.name || "?"} size="md" />
                    <div>
                      <p className="text-xs text-muted-foreground">{parent.label}</p>
                      <p className="font-medium text-foreground">{parent.name || "—"}</p>
                    </div>
                  </div>
                ))}
                {family.siblings?.length > 0 && (
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="mb-2 text-xs text-muted-foreground">
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
          </Card>
        </div>
      </div>

      {/* Recent Attendance */}
      <div>
        <SectionHeader
          title={t("recent_attendance")}
          icon={<FiCheckCircle className="h-5 w-5" />}
          action={
            <Link to="/dashboard/attendance" className="text-sm font-medium text-primary hover:text-primary-light">
              {t("view_all")}
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loadingAttendance ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </>
          ) : attendance.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <EmptyState
                  icon={<FiCheckCircle className="h-8 w-8" />}
                  title={t("no_attendance_records")}
                  description={t("attendance_history_will_appear")}
                />
              </Card>
            </div>
          ) : (
            attendance.slice(0, 4).map((record: any) => (
              <Card key={record.id}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{record.event_title || t("event")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{record.event_date || record.date}</p>
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
                    {t("status_" + record.status.toLowerCase())}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
