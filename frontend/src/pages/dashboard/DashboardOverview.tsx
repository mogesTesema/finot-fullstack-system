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

type DashboardEvent = {
  event_id?: string | number;
  title?: string;
  quote?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
};

const DashboardOverview = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [family, setFamily] = useState<any | null>(null);
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [donationReminder, setDonationReminder] = useState(false);

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
              ? "You have not been assigned a family yet."
              : "Could not load family information."
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
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user) fetchDashboardData();
    setDonationReminder(new Date().getDay() === 4);
  }, [user]);

  const profile = user?.profile || ({} as any);
  const assignedGroup = profile.assignedGroup || "Not assigned";

  // Calculate attendance stats
  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100)
    : 0;

  const quickActions = [
    { label: "Make Donation", icon: FiHeart, to: "/donate/inside", color: "bg-success/10 text-success" },
    { label: "View Events", icon: FiCalendar, to: "/dashboard/events", color: "bg-primary/10 text-primary" },
    { label: "Service Groups", icon: FiBriefcase, to: "/dashboard/service", color: "bg-accent/10 text-accent-foreground" },
    { label: "Q&A Forum", icon: FiMessageCircle, to: "/dashboard/questions", color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-light p-6 text-white shadow-elevated md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Welcome back, {user?.full_name.split(" ")[0]}! 👋
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

        {/* Donation Reminder */}
        {donationReminder && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-accent/20 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/30 p-2">
                <FiHeart className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-white">Weekly Donation Reminder</p>
                <p className="text-sm text-white/80">
                  It's Thursday — consider your weekly 1 Birr donation.
                </p>
              </div>
            </div>
            <Link to="/donate/inside" className="btn-secondary text-sm">
              Donate Now
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={<FiCheckCircle className="h-6 w-6" />}
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title="Upcoming Events"
          value={events.length}
          icon={<FiCalendar className="h-6 w-6" />}
        />
        <StatsCard
          title="Family Members"
          value={family?.siblings?.length || 0}
          icon={<FiUsers className="h-6 w-6" />}
        />
        <StatsCard
          title="Service Group"
          value={assignedGroup}
          icon={<FiBriefcase className="h-6 w-6" />}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader title="Quick Actions" icon={<FiTrendingUp className="h-6 w-6" />} />
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
            title="Upcoming Events"
            icon={<FiCalendar className="h-5 w-5" />}
            action={
              <Link to="/dashboard/events" className="text-sm font-medium text-primary hover:text-primary-light">
                View all →
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
                title="No upcoming events"
                description="Check back soon for fellowship gatherings."
              />
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event.event_id}
                    className="flex gap-4 rounded-xl bg-muted/50 p-4 transition hover:bg-muted"
                  >
                    <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10">
                      <span className="text-xs font-bold uppercase text-primary">
                        {event.event_date
                          ? new Date(event.event_date).toLocaleDateString("en", { month: "short" })
                          : ""}
                      </span>
                      <span className="text-lg font-bold leading-none text-primary">
                        {event.event_date ? new Date(event.event_date).getDate() : ""}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        🕐 {event.event_time} • 📍 {event.location}
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
            title="My Family"
            icon={<FiUsers className="h-5 w-5" />}
            action={
              <Link to="/dashboard/family" className="text-sm font-medium text-primary hover:text-primary-light">
                View all →
              </Link>
            }
          />
          <Card>
            {familyError ? (
              <EmptyState
                icon={<FiUsers className="h-8 w-8" />}
                title="No family yet"
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
                  { label: "Spiritual Father", name: family.father?.name },
                  { label: "Spiritual Mother", name: family.mother?.name },
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
                      Siblings ({family.siblings.length})
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
          title="Recent Attendance"
          icon={<FiCheckCircle className="h-5 w-5" />}
          action={
            <Link to="/dashboard/attendance" className="text-sm font-medium text-primary hover:text-primary-light">
              View all →
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
                  title="No attendance records"
                  description="Your attendance history will appear here."
                />
              </Card>
            </div>
          ) : (
            attendance.slice(0, 4).map((record: any) => (
              <Card key={record.id}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{record.event_title || "Event"}</p>
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
                    {record.status}
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
