import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ServiceGroup, ServiceSelection } from "../../types";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const PreferenceForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [formData, setFormData] = useState({
    choice1: "",
    choice2: "",
    choice3: "",
    reason: "",
    skills: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [existingSelections, setExistingSelections] = useState<ServiceSelection[]>([]);
  const [isApproved, setIsApproved] = useState(false);
  const [isSelectionOpen, setIsSelectionOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsData = await api.getServiceGroups();
        setGroups(groupsData || []);

        if (user?.profile?.assignedGroup) {
          setIsApproved(true);
        }

        const selections = await api.getUserSelection();
        setExistingSelections(selections || []);
        if (selections && selections.length > 0) {
          setHasSubmitted(true);
          const sorted = selections.sort((a: ServiceSelection, b: ServiceSelection) => a.priority - b.priority);
          if (sorted.length >= 3) {
            setFormData({
              choice1: sorted[0].service_group.toString(),
              choice2: sorted[1].service_group.toString(),
              choice3: sorted[2].service_group.toString(),
              reason: sorted[0].reason || "",
              skills: sorted[0].skills || "",
            });
          }
        }
        
        // Optionally check if window is open via config api if it exists
        try {
          const config = await api.getSelectionWindow();
          setIsSelectionOpen(config.selection_open);
        } catch (e) {
          // ignore
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load data. Please refresh the page.",
          confirmButtonColor: "#fbbf24",
          background: "#142850",
          color: "#fff",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isApproved) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isApproved) {
      Swal.fire({
        icon: "info",
        title: "Already Approved",
        text: "You have already been assigned to a service group and cannot change your preferences.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    if (!formData.choice1 || !formData.choice2 || !formData.choice3) {
      Swal.fire({
        icon: "warning",
        title: "Missing Choices",
        text: "Please select three preferences.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    if (
      new Set([formData.choice1, formData.choice2, formData.choice3]).size !== 3
    ) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Choices",
        text: "All three choices must be different.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    setSubmitting(true);

    try {
      if (hasSubmitted && existingSelections.length > 0) {
        for (const selection of existingSelections) {
          if (selection.id) {
            await api.deleteSelection(selection.id);
          }
        }
        setExistingSelections([]);
        setHasSubmitted(false);
      }

      const selections: ServiceSelection[] = [
        {
          service_group: parseInt(formData.choice1),
          priority: 1,
          skills: formData.skills,
          reason: formData.reason,
        },
        {
          service_group: parseInt(formData.choice2),
          priority: 2,
          skills: formData.skills,
          reason: formData.reason,
        },
        {
          service_group: parseInt(formData.choice3),
          priority: 3,
          skills: formData.skills,
          reason: formData.reason,
        },
      ];

      // Since backend doesn't support DELETE anymore gracefully in this context or we use bulk update,
      // let's submit selection array.
      // (Assuming you have updated `api.submitSelection` or backend to overwrite or return 400.
      // Our backend handles `AgeglotSelection.objects.filter(student=...).exists()` with a 400).
      
      await api.submitSelection(selections);

      Swal.fire({
        icon: "success",
        title: "Preferences Submitted",
        text: "Your service group preferences have been saved.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Submission error:", error);
      const msg = error?.response?.data?.detail || error.message || "";
      if (msg.includes("already submitted")) {
        Swal.fire({
          icon: "info",
          title: "Already Submitted",
          text: msg || "You have already submitted your preferences. If you need to make changes, please contact an administrator.",
          confirmButtonColor: "#fbbf24",
          background: "#142850",
          color: "#fff",
        });
      } else if (msg.includes("currently closed")) {
        setIsSelectionOpen(false);
        Swal.fire({
          icon: "error",
          title: "Selection Closed",
          text: msg,
          confirmButtonColor: "#fbbf24",
          background: "#142850",
          color: "#fff",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: msg || "Something went wrong.",
          confirmButtonColor: "#fbbf24",
          background: "#142850",
          color: "#fff",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = isApproved || !isSelectionOpen;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B3067] flex items-center justify-center">
        <div className="text-yellow-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            to="/service-groups"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Service Groups
          </Link>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">
            Select Your Preferences
          </h1>

          {isApproved && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-400 font-semibold">
                You have been approved and assigned to a service group.
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Your assigned group:{" "}
                <span className="text-yellow-400">
                  {user?.profile?.assignedGroup}
                </span>
              </p>
            </div>
          )}

          {!isApproved && !isSelectionOpen && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 font-semibold">
                Service selection is currently closed.
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Please check back later or contact an administrator.
              </p>
            </div>
          )}

          {!isApproved && isSelectionOpen && hasSubmitted && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 font-semibold">
                You have already submitted your preferences.
              </p>
              <p className="text-gray-300 text-sm mt-1">
                You can edit them below until you are approved.
              </p>
            </div>
          )}

          {!isApproved && isSelectionOpen && !hasSubmitted && (
            <p className="text-gray-300 mb-6">
              Rank your top three service group choices. You can also tell us
              about your skills and reasons.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Choice 1 */}
            <div>
              <label
                htmlFor="choice1"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                1st Choice *
              </label>
              <select
                id="choice1"
                name="choice1"
                value={formData.choice1}
                onChange={handleChange}
                disabled={isDisabled}
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Choice 2 */}
            <div>
              <label
                htmlFor="choice2"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                2nd Choice *
              </label>
              <select
                id="choice2"
                name="choice2"
                value={formData.choice2}
                onChange={handleChange}
                disabled={isDisabled}
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Choice 3 */}
            <div>
              <label
                htmlFor="choice3"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                3rd Choice *
              </label>
              <select
                id="choice3"
                name="choice3"
                value={formData.choice3}
                onChange={handleChange}
                disabled={isDisabled}
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Reason for your choices
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                value={formData.reason}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="Tell us why you're interested in these groups..."
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Skills */}
            <div>
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Skills / Talents
              </label>
              <textarea
                id="skills"
                name="skills"
                rows={2}
                value={formData.skills}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="e.g., singing, teaching, organizing, etc."
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || isDisabled}
              className="w-full bg-yellow-400 text-[#1B3067] py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Submitting..."
                : isApproved
                  ? "Already Approved"
                  : !isSelectionOpen
                    ? "Selection Closed"
                    : hasSubmitted
                      ? "Update Preferences"
                      : "Submit Preferences"}
            </button>

            {isApproved && (
              <p className="text-center text-gray-400 text-sm mt-2">
                You have been assigned to a group and cannot change your
                preferences.
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PreferenceForm;
