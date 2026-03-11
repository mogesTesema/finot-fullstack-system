import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { FiCalendar, FiMapPin } from "react-icons/fi";

type DashboardEvent = {
  event_id?: string | number;
  title?: string;
  quote?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  status?: "UPCOMING" | "ONGOING" | "COMPLETED";
};

const DashboardEvents = () => {
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
    if (filter === "upcoming") {
      const eventDate = event.event_date ? new Date(event.event_date) : null;
      return eventDate && eventDate >= new Date();
    }
    if (filter === "completed") {
      const eventDate = event.event_date ? new Date(event.event_date) : null;
      return eventDate && eventDate < new Date();
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Events"
        description="Fellowship gatherings and spiritual activities"
        icon={<FiCalendar className="h-6 w-6" />}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: "all", label: "All Events" },
          { key: "upcoming", label: "Upcoming" },
          { key: "completed", label: "Past" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`
              rounded-xl px-4 py-2 text-sm font-medium transition-all
              ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FiCalendar className="h-10 w-10" />}
            title="No events found"
            description="Check back soon for fellowship gatherings and activities."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const eventDate = event.event_date ? new Date(event.event_date) : null;
            const isPast = eventDate && eventDate < new Date();

            return (
              <Card
                key={event.event_id}
                hoverable
                className={`overflow-hidden ${isPast ? "opacity-75" : ""}`}
              >
                <div className="flex gap-4">
                  {/* Date Badge */}
                  <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10">
                    <span className="text-xs font-bold uppercase text-primary">
                      {eventDate
                        ? eventDate.toLocaleDateString("en", { month: "short" })
                        : "TBD"}
                    </span>
                    <span className="text-2xl font-bold leading-none text-primary">
                      {eventDate ? eventDate.getDate() : ""}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-foreground">{event.title}</h3>
                      {isPast && (
                        <Badge variant="default" size="sm">
                          Completed
                        </Badge>
                      )}
                    </div>

                    {event.quote && (
                      <div className="mt-2 flex gap-2">
                        <Quote className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <p className="text-sm italic text-muted-foreground line-clamp-2">
                          {event.quote}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{event.event_time || "Time TBD"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location || "Location TBD"}</span>
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
