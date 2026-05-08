import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { useTranslation } from "react-i18next";
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock, 
  FiMessageCircle, 
  FiTrendingUp, 
  FiUsers,
  FiSun,
  FiMoon,
  FiCloud
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

type DashboardEvent = {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  place_name?: string;
  place_url?: string;
  photo?: string | null;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  service_group?: number;
  service_group_name?: string;
};

const DashboardEvents = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents((data || []) as DashboardEvent[]);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchEvents();
  }, [user]);

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    const eventDate = event.start_date ? new Date(event.start_date) : null;
    if (filter === "upcoming") return eventDate && eventDate >= new Date();
    if (filter === "completed") return eventDate && eventDate < new Date();
    return true;
  });

  const getEventIcon = () => {
    switch (filter) {
      case "upcoming": return <FiSun className="h-5 w-5" />;
      case "completed": return <FiMoon className="h-5 w-5" />;
      default: return <FiCloud className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section with Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="relative z-10">
          <SectionHeader
            title={t("events")}
            description={t("events_description")}
            icon={<FiCalendar className="h-6 w-6" />}
          />
          
          {/* Quick Stats */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm shadow-sm">
              <FiCalendar className="h-4 w-4 text-primary" />
              <span className="font-medium">{events.length}</span>
              <span className="text-muted-foreground">{t("total_events")}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm shadow-sm">
              <FiTrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">
                {events.filter(e => new Date(e.start_date) >= new Date()).length}
              </span>
              <span className="text-muted-foreground">{t("upcoming_events")}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm shadow-sm">
              <FiUsers className="h-4 w-4 text-blue-600" />
              <span className="font-medium">
                {events.filter(e => e.service_group_name).length}
              </span>
              <span className="text-muted-foreground">{t("group_events")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Enhanced */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: t("all_events"), icon: <FiCloud className="h-4 w-4" /> },
          { key: "upcoming", label: t("event_upcoming"), icon: <FiSun className="h-4 w-4" /> },
          { key: "completed", label: t("event_completed"), icon: <FiMoon className="h-4 w-4" /> },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              filter === tab.key
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <EmptyState 
            icon={<FiCalendar className="h-12 w-12" />} 
            title={t("no_events_found")} 
            description={t("events_check_back")} 
          />
        </Card>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredEvents.map((event, index) => {
              const eventDate = event.start_date ? new Date(event.start_date) : null;
              const isPast = eventDate && eventDate < new Date();
              const isOngoing = eventDate && eventDate <= new Date() && new Date() <= new Date(event.end_date);
              
              let statusColor = "bg-gray-100 text-gray-700";
              let statusText = t("event_completed");
              if (!isPast) {
                statusColor = "bg-green-100 text-green-700";
                statusText = t("event_upcoming");
              }
              if (isOngoing) {
                statusColor = "bg-blue-100 text-blue-700";
                statusText = t("event_ongoing");
              }

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card hoverable className="group overflow-hidden h-full flex flex-col">
                    {/* Image Section */}
                    {event.photo && (
                      <div className="relative -mt-4 -mx-4 mb-4 h-44 overflow-hidden rounded-t-xl">
                        <img
                          src={event.photo}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        
                        {/* Status Badge on Image */}
                        <div className={`absolute top-3 right-3 rounded-full ${statusColor} px-2.5 py-1 text-xs font-medium shadow-lg backdrop-blur-sm`}>
                          {statusText}
                        </div>
                        
                        {/* Date Badge on Image */}
                        {eventDate && (
                          <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-1.5 shadow-lg">
                            <div className="text-center">
                              <div className="text-xs font-semibold uppercase text-primary">
                                {eventDate.toLocaleDateString(undefined, { month: "short" })}
                              </div>
                              <div className="text-xl font-bold leading-none text-foreground">
                                {eventDate.getDate()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1">
                      {/* Title and Group Badge */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <h3 className="text-base font-semibold text-foreground line-clamp-2 flex-1">
                          {event.title}
                        </h3>
                        {event.service_group_name ? (
                          <Badge variant="accent" size="sm" className="flex-shrink-0">
                            {event.service_group_name}
                          </Badge>
                        ) : (
                          <Badge variant="primary" size="sm" className="flex-shrink-0 bg-primary/10 text-primary">
                            {t("general")}
                          </Badge>
                        )}
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <FiClock className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {eventDate 
                            ? `${eventDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` 
                            : t("time_tbd")}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <FiMapPin className="h-4 w-4 flex-shrink-0" />
                        {event.place_url ? (
                          <a 
                            href={event.place_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="truncate text-primary hover:underline transition"
                          >
                            {event.place_name || t("view_location")}
                          </a>
                        ) : (
                          <span className="truncate">{event.place_name || t("location_tbd")}</span>
                        )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <div className="mt-3 flex gap-2 rounded-lg bg-muted/30 p-3">
                          <FiMessageCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                            {event.description}
                          </p>
                        </div>
                      )}

                      {/* Call to Action */}
                      {!isPast && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <button className="w-full rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20">
                            {t("interested_attending")}
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default DashboardEvents;