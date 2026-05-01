import React, { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { PlusIcon, MapPinIcon, TrashIcon, PhotoIcon, PencilIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  place_name: string;
  place_url: string;
}

const emptyForm: EventFormData = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  place_name: "",
  place_url: "",
};

type StatusFilter = "ALL" | "UPCOMING" | "ONGOING" | "COMPLETED";

export default function GroupEventsManager({ groupId }: { groupId?: number | null }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EventFormData>({ ...emptyForm });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    fetchEvents();
  }, [groupId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // The backend already filters events for this admin (global + managed group).
      // We show ALL events the admin can see — not just group-filtered ones —
      // because some events may have been created before the group was assigned.
      const data = await api.getEvents();
      setEvents(data || []);
    } catch (err) {
      toast.error(t("failed_fetch_events"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingEventId(null);
    setShowForm(false);
  };

  const startEdit = (event: any) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      start_date: event.start_date ? event.start_date.slice(0, 16) : "",
      end_date: event.end_date ? event.end_date.slice(0, 16) : "",
      place_name: event.place_name || "",
      place_url: event.place_url || "",
    });
    setPhotoPreview(event.photo || null);
    setPhotoFile(null);
    setShowForm(true);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("start_date", formData.start_date);
      fd.append("end_date", formData.end_date || formData.start_date);
      if (formData.place_name) fd.append("place_name", formData.place_name);
      if (formData.place_url) fd.append("place_url", formData.place_url);
      if (photoFile) fd.append("photo", photoFile);

      const { default: axiosInstance } = await import("../../../lib/axios");

      if (editingEventId) {
        await axiosInstance.patch(`/api/service/events/${editingEventId}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("event_updated_success"));
      } else {
        await axiosInstance.post("/api/service/events/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("event_created_success"));
      }

      resetForm();
      fetchEvents();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const errors = err.response?.data;
      let msg = t("failed_save_event");
      if (detail) msg = detail;
      else if (errors && typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        if (firstKey && Array.isArray(errors[firstKey])) {
          msg = `${firstKey}: ${errors[firstKey][0]}`;
        }
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!window.confirm(t("delete_question_confirm"))) return;
    try {
      const { default: axiosInstance } = await import("../../../lib/axios");
      await axiosInstance.delete(`/api/service/events/${eventId}/`);
      toast.success(t("event_deleted_success"));
      fetchEvents();
    } catch (err) {
      toast.error(t("failed_delete_event"));
    }
  };

  // Apply status filter
  const filteredEvents = statusFilter === "ALL"
    ? events
    : events.filter((e) => e.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">{t("group_events")}</h2>
        <button
          onClick={() => {
            if (showForm) { resetForm(); } else { setShowForm(true); }
          }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {showForm ? (
            <><XMarkIcon className="h-4 w-4" /> {t("cancel")}</>
          ) : (
            <><PlusIcon className="h-4 w-4" /> {t("create_event")}</>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl border border-border shadow-soft space-y-4">
          <h3 className="font-semibold text-lg text-foreground">
            {editingEventId ? t("edit_event") : t("new_event")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("title")} *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("start_date_time")} *</label>
              <input type="datetime-local" name="start_date" required value={formData.start_date} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("end_date_time")}</label>
              <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("place_name_opt")}</label>
              <input type="text" name="place_name" value={formData.place_name} onChange={handleChange} placeholder="e.g. Main Hall"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("maps_url_opt")}</label>
              <input type="url" name="place_url" value={formData.place_url} onChange={handleChange} placeholder="https://maps.google.com/..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">{t("description")}</label>
              <textarea name="description" rows={3} value={formData.description} onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">{t("event_image_opt")}</label>
              <div className="mt-1 flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground transition hover:bg-muted/50">
                  <PhotoIcon className="h-5 w-5" />
                  <span>{photoFile ? photoFile.name : t("choose_image")}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-border" />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={resetForm} className="btn-outline text-sm">{t("cancel")}</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? `${t("saving")}...` : editingEventId ? t("update_event") : t("save_event")}
            </button>
          </div>
        </form>
      )}

      {/* Status Filter Tabs */}
      {!loading && events.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <FunnelIcon className="h-4 w-4 text-muted-foreground" />
          {(["ALL", "UPCOMING", "ONGOING", "COMPLETED"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s === "ALL" ? t("all") : t("event_" + s.toLowerCase())}
              {s !== "ALL" && (
                <span className="ml-1 opacity-70">
                  ({events.filter((e) => e.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-soft text-muted-foreground">
          {events.length === 0 ? t("no_events_created") : t("no_events_match")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div key={event.id} className="rounded-xl border border-border bg-card shadow-soft overflow-hidden flex flex-col">
              {event.photo && (
                <img src={event.photo} alt={event.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-5 flex-1 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-lg line-clamp-1" title={event.title}>{event.title}</h3>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                    event.status === 'UPCOMING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    event.status === 'ONGOING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {t("event_" + event.status.toLowerCase())}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  {new Date(event.start_date).toLocaleString()}
                </p>
                {event.service_group_name && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded bg-accent/20 text-accent-foreground font-medium">
                    {event.service_group_name} {t("group")}
                  </span>
                )}
                {(event.place_name || event.place_url) && (
                  <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-lg">
                    {event.place_name && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <MapPinIcon className="h-4 w-4 text-primary" />
                        <span>{event.place_name}</span>
                      </div>
                    )}
                    {event.place_url && (
                      <a href={event.place_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary-light ml-5 underline underline-offset-2">
                        {t("view_on_map")}
                      </a>
                    )}
                  </div>
                )}
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                )}
              </div>
              <div className="bg-muted/30 px-5 py-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>{t("by")} {event.created_by_name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(event)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title={t("edit_event")}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title={t("delete_event")}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
