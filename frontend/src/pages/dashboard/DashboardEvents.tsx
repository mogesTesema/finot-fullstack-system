import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { useTranslation } from "react-i18next";
import { FiCalendar, FiMapPin, FiClock, FiMessageCircle } from "react-icons/fi";

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (<div key={i} className="skeleton h-32 rounded-2xl" />))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: "all", label: t("all_events") },
          { key: "upcoming", label: t("event_upcoming") },
          { key: "completed", label: t("event_completed") },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key as any)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${filter === tab.key ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <EmptyState icon={<FiCalendar className="h-10 w-10" />} title={t("no_events_found")} description={t("events_check_back")} />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const eventDate = event.start_date ? new Date(event.start_date) : null;
            const isPast = eventDate && eventDate < new Date();
            return (
              <Card key={event.id} hoverable className={`overflow-hidden ${isPast ? "opacity-75" : ""}`}>
                {/* Event Image */}
                {event.photo && (
                  <img
                    src={event.photo}
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-t-xl -mt-4 -mx-4 mb-4"
                    style={{ width: 'calc(100% + 2rem)' }}
                  />
                )}
                <div className="flex gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10">
                      <span className="text-xs font-bold uppercase text-primary">{eventDate ? eventDate.toLocaleDateString(undefined, { month: "short" }) : t("tbd")}</span>
                      <span className="text-lg font-medium leading-none text-primary">{eventDate ? eventDate.getDate() : ""}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 items-start justify-between">
                      <div className="flex w-full justify-between items-start">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">{event.title}</h3>
                        {isPast && <Badge variant="default" size="sm" className="ml-2">{t("event_completed")}</Badge>}
                      </div>
                      {event.service_group_name ? (
                        <div className="inline-flex items-center rounded-md bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                          {event.service_group_name} {t("service_group")}
                        </div>
                      ) : (
                        <div className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {t("general")}
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <div className="mt-2 flex gap-2">
                        <FiMessageCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                        <p className="text-sm italic text-muted-foreground line-clamp-2">{event.description}</p>
                      </div>
                    )}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FiClock className="h-4 w-4" />
                        <span>{eventDate ? eventDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : t("location_tbd")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FiMapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {event.place_url ? (
                            <a href={event.place_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {event.place_name || t("view_location")}
                            </a>
                          ) : (
                            event.place_name || t("location_tbd")
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardEvents;
