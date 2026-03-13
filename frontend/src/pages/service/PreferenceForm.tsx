import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ServiceGroup, ServiceSelection } from "../../types";
import { Card } from "../../components/ui/Card";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const getGroupKey = (groupName: string) => {
  const mapping: Record<string, string> = {
    "ትምህርት ክፍል": "group_teaching_name",
    "አባላት እና እንክብካቤ ክፍል": "group_membership_name",
    "ልማት ክፍል": "group_development_name",
    "መዝሙር ክፍል": "group_choir_name",
    "ሙያ እና ተራድኦ": "group_professional_name",
    "ቁዋንቁዋና ልዩ ልዩ ክፍል": "group_language_name",
    "ሂሳብ ክፍል": "group_finance_name",
    "ኦዲት ክፍል": "group_audit_name",
    "ባች እና መርሃግብር": "group_batch_name",
    "መረጃ እና ክትትል ክፍል": "group_media_name",
  };
  return mapping[groupName];
};

const PreferenceForm = () => {
  const { t } = useTranslation();
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
        Swal.fire({ icon: "error", title: t("failed"), text: t("failed_load_family") });
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
    if (isApproved) { Swal.fire({ icon: "info", title: t("already_approved"), text: t("already_approved_msg") }); return; }
    if (!formData.choice1 || !formData.choice2 || !formData.choice3) { Swal.fire({ icon: "warning", title: t("missing_choices"), text: t("select_three_prefs") }); return; }
    if (new Set([formData.choice1, formData.choice2, formData.choice3]).size !== 3) { Swal.fire({ icon: "warning", title: t("duplicate_choices"), text: t("all_choices_different") }); return; }

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
      Swal.fire({ icon: "success", title: t("profile_updated"), text: t("changes_saved") });
      navigate("/dashboard/service");
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error.message || "";
      if (msg.includes("already submitted")) { Swal.fire({ icon: "info", title: t("already_submitted_msg"), text: msg }); }
      else if (msg.includes("currently closed")) { setIsSelectionOpen(false); Swal.fire({ icon: "error", title: t("selection_closed_msg"), text: msg }); }
      else { Swal.fire({ icon: "error", title: t("failed"), text: msg || t("something_went_wrong") }); }
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
        <FiArrowLeft className="h-4 w-4" /> {t("back_to_services")}
      </Link>

      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("select_preferences")}</h1>

          {isApproved && (
            <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6">
              <p className="text-success font-semibold">{t("already_approved_msg")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("assigned")}: <span className="text-foreground font-medium">{getGroupKey(user?.profile?.assignedGroup || "") ? t(getGroupKey(user?.profile?.assignedGroup || "")) : user?.profile?.assignedGroup}</span></p>
            </div>
          )}
          {!isApproved && !isSelectionOpen && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6">
              <p className="text-destructive font-semibold">{t("selection_closed_msg")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("check_back_later_admin")}</p>
            </div>
          )}
          {!isApproved && isSelectionOpen && hasSubmitted && (
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-6">
              <p className="text-accent-foreground font-semibold">{t("already_submitted_msg")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("edit_below_approved")}</p>
            </div>
          )}
          {!isApproved && isSelectionOpen && !hasSubmitted && (
            <p className="text-muted-foreground mb-6">{t("rank_choices")}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[{ name: "choice1", label: t("choice_1st") }, { name: "choice2", label: t("choice_2nd") }, { name: "choice3", label: t("choice_3rd") }].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{field.label}</label>
                <select name={field.name} value={(formData as any)[field.name]} onChange={handleChange} disabled={isDisabled} className={selectClass}>
                  <option value="">{t("select_group")}</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {getGroupKey(g.name) ? t(getGroupKey(g.name)) : g.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("reason_choices")}</label>
              <textarea name="reason" rows={3} value={formData.reason} onChange={handleChange} disabled={isDisabled} placeholder={t("tell_us_why")} className={`input ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("skills_talents")}</label>
              <textarea name="skills" rows={2} value={formData.skills} onChange={handleChange} disabled={isDisabled} placeholder={t("eg_skills")} className={`input ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`} />
            </div>
            <button type="submit" disabled={submitting || isDisabled} className="btn-primary w-full">
              {submitting ? t("submitting") : isApproved ? t("already_approved") : !isSelectionOpen ? t("selection_closed") : hasSubmitted ? t("update_preferences") : t("submit_preferences")}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default PreferenceForm;
