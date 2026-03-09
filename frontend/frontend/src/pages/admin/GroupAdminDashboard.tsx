// src/pages/admin/GroupAdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const GroupAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventForm, setEventForm] = useState({
    title: "",
    quote: "",
    date: "",
    time: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Find which group this admin manages
        const adminGroup = await api.getGroupByAdminId(user.id);
        setGroup(adminGroup);
        if (adminGroup) {
          const groupMembers = await api.getUsersByGroup(adminGroup.group_id);
          setMembers(groupMembers);
        }
      } catch (error) {
        console.error("Failed to fetch group data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchGroupData();
  }, [user]);

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (
      !eventForm.title ||
      !eventForm.date ||
      !eventForm.time ||
      !eventForm.location
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all event fields.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.createEvent({
        group_id: group.group_id,
        ...eventForm,
        posted_by: user.id,
        target_audience: "students_only",
      });
      Swal.fire({
        icon: "success",
        title: "Event Created",
        text: "The event has been posted.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      setEventForm({ title: "", quote: "", date: "", time: "", location: "" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.message,
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Group members by year
  const membersByYear = members.reduce((acc, member) => {
    const year = member.profile.batch;
    if (!acc[year]) acc[year] = [];
    acc[year].push(member);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B3067] flex items-center justify-center">
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#1B3067] p-6">
        <div className="max-w-4xl mx-auto bg-[#142850] rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl text-red-400 mb-4">No Group Assigned</h1>
          <p className="text-gray-300">
            You are not an admin of any service group.
          </p>
          <button
            onClick={logout}
            className="mt-4 bg-yellow-400 text-[#1B3067] px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B3067] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-yellow-400">
            Group Admin: {group.group_name}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Members List */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#142850] rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              Members Interested
            </h2>
            {Object.keys(membersByYear).length === 0 ? (
              <p className="text-gray-400">
                No members have selected this group yet.
              </p>
            ) : (
              Object.entries(membersByYear).map(([year, yearMembers]) => (
                <div key={year} className="mb-4">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    {year}
                  </h3>
                  <div className="space-y-2">
                    {yearMembers.map((m) => (
                      <div key={m.id} className="bg-[#1B3067] p-3 rounded">
                        <p className="text-white font-medium">{m.full_name}</p>
                        <p className="text-gray-400 text-sm">
                          {m.profile.department}
                        </p>
                        <p className="text-gray-400 text-sm">
                          📞 {m.profile.personal_phone}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>

          {/* Create Event Form */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-[#142850] rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Post New Event
            </h2>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Quote (optional)
                </label>
                <input
                  type="text"
                  name="quote"
                  value={eventForm.quote}
                  onChange={handleEventChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={eventForm.date}
                  onChange={handleEventChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={eventForm.time}
                  onChange={handleEventChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventChange}
                  placeholder="e.g., Church Main Hall"
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-yellow-400 text-[#1B3067] py-2 rounded-lg font-semibold hover:bg-yellow-300 transition disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Event"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GroupAdminDashboard;
