// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/navigation/Sidebar";
import { ArrowLeftIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { api } from "../../lib/api";

const StudentDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const upcomingEvents = await api.getEvents("students_only");
        setEvents(upcomingEvents);
        const notifs = await api.getUserNotifications(user?.id);
        setNotifCount(notifs.filter((n) => !n.is_read).length);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    if (user) fetchDashboardData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return <div className="p-8 text-white">{t("loading")}</div>;

  const fullName = user.full_name || "";
  const userId = user.id || "";
  const profile = user.profile || {};
  const department = profile.department || "";
  const batch = profile.batch || "";
  const assignedGroup = profile.assignedGroup || t("not_assigned");
  const profileImage = profile.profile_image || "/images/default-avatar.jpg";

  return (
    <div className="flex min-h-screen ">
      <Sidebar notifCount={notifCount} onLogout={handleLogout} />

      <main className="flex-1 p-6 overflow-auto pt-20">
        <div className="max-w-5xl mx-auto">
          {/* Back to Home button – this was missing! */}
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              {t("back_to_home_link")}
            </Link>
          </div>

          {/* Profile Summary Card */}
          <div className="bg-[#142850] rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center space-x-6">
              <img
                src={profileImage}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
                onError={(e) => (e.target.src = "/images/default-avatar.jpg")}
              />
              <div>
                <h1 className="text-3xl font-bold text-yellow-400">
                  {fullName}
                </h1>
                <p className="text-gray-300 text-lg">
                  {department} • {batch}
                </p>
                <p className="text-gray-400 text-sm mt-1">ID: {userId}</p>
                <p className="text-green-400 font-semibold mt-2">
                  {t("service_group")}: {assignedGroup}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-[#142850] rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2" />
              {t("upcoming_events")}
            </h2>

            {loadingEvents ? (
              <p className="text-gray-400">{t("loading_events")}</p>
            ) : events.length === 0 ? (
              <p className="text-gray-400">{t("no_upcoming_events")}</p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.event_id}
                    className="bg-[#1B3067] rounded-lg p-4 border border-gray-700 hover:border-yellow-400 transition"
                  >
                    <h3 className="text-lg font-semibold text-yellow-400">
                      {event.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">{event.quote}</p>
                    <p className="text-gray-300 text-sm mt-1">
                      📅 {event.event_date} at {event.event_time} • 📍{" "}
                      {event.location}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
