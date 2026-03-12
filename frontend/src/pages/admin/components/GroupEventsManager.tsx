import React, { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { PlusIcon, MapPinIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string; // Made required in backend typically if no specific time logic, but we'll adapt depending on API
  place_name: string;
  place_url: string;
}

export default function GroupEventsManager({ groupId }: { groupId: number }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    place_name: "",
    place_url: ""
  });

  useEffect(() => {
    fetchEvents();
  }, [groupId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      // Filter the global events down to just this group's events. 
      // The backend should already filter if user is ServiceAdmin, but just in case:
      const groupEvents = data.filter((e: any) => e.service_group === groupId);
      setEvents(groupEvents);
    } catch (err) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // POST to /api/service/events/
      // Backend automatically sets created_by and service_group based on user's role
      const payload = {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date, // e.g. "2024-05-20T10:00:00Z"
        end_date: formData.end_date || formData.start_date,
        place_name: formData.place_name,
        place_url: formData.place_url
      };

      // We might need to map api.createEvent if it doesn't exist, let's assume doing a manual fetch or adding it to api.real.ts
      // For now, I'll use the existing generic axiosInstance if needed or add function.
      // Let's assume we need to import axiosInstance from api
      const { default: axiosInstance } = await import("../../../lib/axios");
      await axiosInstance.post("/api/service/events/", payload);
      
      toast.success("Event created successfully");
      setShowForm(false);
      setFormData({ title: "", description: "", start_date: "", end_date: "", place_name: "", place_url: "" });
      fetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const { default: axiosInstance } = await import("../../../lib/axios");
      await axiosInstance.delete(`/api/service/events/${eventId}/`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Group Events</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          {showForm ? "Cancel" : "Create Event"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border border-border shadow-soft space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date & Time *</label>
              <input
                type="datetime-local"
                name="start_date"
                required
                value={formData.start_date}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Place Name (Optional)</label>
              <input
                type="text"
                name="place_name"
                value={formData.place_name}
                onChange={handleChange}
                placeholder="e.g. Main Hall"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Google Maps URL (Optional)</label>
              <input
                type="url"
                name="place_url"
                value={formData.place_url}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? "Saving..." : "Save Event"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-soft text-muted-foreground">
          No events created for this group yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-border bg-card shadow-soft overflow-hidden flex flex-col">
              <div className="p-5 flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg line-clamp-1" title={event.title}>{event.title}</h3>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${event.status === 'UPCOMING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {event.status}
                  </span>
                </div>
                
                <p className="text-sm text-foreground">
                  {new Date(event.start_date).toLocaleString()}
                </p>
                
                {(event.place_name || event.place_url) && (
                  <div className="flex flex-col gap-1 mt-2 mb-2 p-2 bg-muted/50 rounded-lg">
                    {event.place_name && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <MapPinIcon className="h-4 w-4 text-primary" />
                        <span>{event.place_name}</span>
                      </div>
                    )}
                    {event.place_url && (
                      <a href={event.place_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary-light ml-5 underline underline-offset-2">
                        View on Map
                      </a>
                    )}
                  </div>
                )}
                
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                )}
              </div>
              <div className="bg-muted/30 px-5 py-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>By {event.created_by_name}</span>
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Event"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
