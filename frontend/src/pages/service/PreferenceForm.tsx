import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ServiceGroup, ServiceSelection } from "../../types";
import { Card } from "../../components/ui/Card";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PreferenceForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [formData, setFormData] = useState({ choice1: "", choice2: "", choice3: "", reason: "", skills: "" });
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
        if (user?.profile?.assignedGroup) setIsApproved(true);
        const selections = await api.getUserSelection();
        setExistingSelections(selections || []);
        if (selections && selections.length > 0) {
          setHasSubmitted(true);
          const sorted = selections.sort((a: ServiceSelection, b: ServiceSelection) => a.priority - b.priority);
          if (sorted.length >= 3) {
            setFormData({
              choice1: sorted[0].service_group.toString(), choice2: sorted[1].service_group.toString(),
              choice3: sorted[2].service_group.toString(), reason: sorted[0].reason || "", skills: sorted[0].skills || "",
            });
          }
        }
        try { const config = await api.getSelectionWindow(); setIsSelectionOpen(config.selection_open); } catch {}
      } catch (error) {
        console.error("Failed to fetch data", error);
        Swal.fire({ icon: "error", title: "Error", text: "Failed to load data. Please refresh the page." });
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isApproved) return;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApproved) { Swal.fire({ icon: "info", title: "Already Approved", text: "You have been assigned and cannot change preferences." }); return; }
    if (!formData.choice1 || !formData.choice2 || !formData.choice3) { Swal.fire({ icon: "warning", title: "Missing Choices", text: "Please select three preferences." }); return; }
    if (new Set([formData.choice1, formData.choice2, formData.choice3]).size !== 3) { Swal.fire({ icon: "warning", title: "Duplicate Choices", text: "All three choices must be different." }); return; }

    setSubmitting(true);
    try {
      if (hasSubmitted && existingSelections.length > 0) {
        for (const sel of existingSelections) { if (sel.id) await api.deleteSelection(sel.id); }
        setExistingSelections([]); setHasSubmitted(false);
      }
      const selections: ServiceSelection[] = [
        { service_group: parseInt(formData.choice1), priority: 1, skills: formData.skills, reason: formData.reason },
        { service_group: parseInt(formData.choice2), priority: 2, skills: formData.skills, reason: formData.reason },
        { service_group: parseInt(formData.choice3), priority: 3, skills: formData.skills, reason: formData.reason },
      ];
      await api.submitSelection(selections);
      Swal.fire({ icon: "success", title: "Preferences Submitted", text: "Your service group preferences have been saved." });
      navigate("/dashboard/service");
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error.message || "";
      if (msg.includes("already submitted")) { Swal.fire({ icon: "info", title: "Already Submitted", text: msg }); }
      else if (msg.includes("currently closed")) { setIsSelectionOpen(false); Swal.fire({ icon: "error", title: "Selection Closed", text: msg }); }
      else { Swal.fire({ icon: "error", title: "Submission Failed", text: msg || "Something went wrong." }); }
    } finally { setSubmitting(false); }
  };

  const isDisabled = isApproved || !isSelectionOpen;
  const selectClass = "input disabled:opacity-50 disabled:cursor-not-allowed";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/dashboard/service" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition">
        <FiArrowLeft className="h-4 w-4" /> Back to Service Groups
      </Link>

      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">Select Your Preferences</h1>

          {isApproved && (
            <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6">
              <p className="text-success font-semibold">You have been approved and assigned to a service group.</p>
              <p className="text-sm text-muted-foreground mt-1">Assigned: <span className="text-foreground font-medium">{user?.profile?.assignedGroup}</span></p>
            </div>
          )}
          {!isApproved && !isSelectionOpen && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6">
              <p className="text-destructive font-semibold">Service selection is currently closed.</p>
              <p className="text-sm text-muted-foreground mt-1">Please check back later or contact an administrator.</p>
            </div>
          )}
          {!isApproved && isSelectionOpen && hasSubmitted && (
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6">
              <p className="text-accent-foreground font-semibold">You have already submitted your preferences.</p>
              <p className="text-sm text-muted-foreground mt-1">You can edit them below until you are approved.</p>
            </div>
          )}
          {!isApproved && isSelectionOpen && !hasSubmitted && (
            <p className="text-muted-foreground mb-6">Rank your top three service group choices.</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[{ name: "choice1", label: "1st Choice *" }, { name: "choice2", label: "2nd Choice *" }, { name: "choice3", label: "3rd Choice *" }].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{field.label}</label>
                <select name={field.name} value={(formData as any)[field.name]} onChange={handleChange} disabled={isDisabled} className={selectClass}>
                  <option value="">Select</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Reason for your choices</label>
              <textarea name="reason" rows={3} value={formData.reason} onChange={handleChange} disabled={isDisabled} placeholder="Tell us why..." className={`input ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Skills / Talents</label>
              <textarea name="skills" rows={2} value={formData.skills} onChange={handleChange} disabled={isDisabled} placeholder="e.g., singing, teaching..." className={`input ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`} />
            </div>
            <button type="submit" disabled={submitting || isDisabled} className="btn-primary w-full">
              {submitting ? "Submitting..." : isApproved ? "Already Approved" : !isSelectionOpen ? "Selection Closed" : hasSubmitted ? "Update Preferences" : "Submit Preferences"}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default PreferenceForm;
