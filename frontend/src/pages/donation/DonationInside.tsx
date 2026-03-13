import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const DonationInside = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ purpose: "", amount: "" });

  const purposes = [
    { label: t("weekly_donation"), value: "Weekly Donation" },
    { label: t("building_fund"), value: "Building Fund" },
    { label: t("charity_(poor)"), value: "Charity (Poor)" },
    { label: t("special_events"), value: "Special Events" },
    { label: t("other"), value: "Other" },
  ];
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getDonations().then(setDonationHistory).catch(console.error).finally(() => setLoading(false));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purpose || !formData.amount) {
      Swal.fire({ icon: "warning", title: t("missing_fields"), text: t("missing_donation_fields") }); 
      return;
    }
    setIsSubmitting(true);
    try {
      const { checkout_url } = await api.createDonation({ fund_category: formData.purpose, amount: formData.amount.trim() });
      window.location.href = checkout_url;
    } catch (error: any) {
      Swal.fire({ icon: "error", title: t("failed"), text: error?.response?.data?.detail || t("something_went_wrong") });
    } finally { setIsSubmitting(false); }
  };

  const totalDonations = donationHistory.reduce((sum, d) => sum + Number(d.payment?.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard/donations" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition">
          <FiArrowLeft className="h-4 w-4" /> {t("back_to_donations")}
        </Link>
        <Link to="/dashboard/donations/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80">
          <FiHeart className="h-4 w-4" /> {t("donation_profile")}
        </Link>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="card max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground text-center mb-1">{t("give_donation")}</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">{t("complete_redirect_chapa")}</p>

        {/* Stats */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-foreground text-sm mb-2">{t("giving_snapshot")}</h2>
          {loading ? (
            <div className="skeleton h-8 w-1/2 rounded-lg" />
          ) : donationHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("no_donations_msg")}</p>
          ) : (
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-primary">{totalDonations.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">{t("etb")}</span></p>
                <p className="text-xs text-muted-foreground">{t("total_given")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{donationHistory.length}</p>
                <p className="text-xs text-muted-foreground">{t("gifts")}</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("reason_choices")} *</label>
            <select name="purpose" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="input">
              <option value="">{t("select_purpose")}</option>
              {purposes.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("amount_etb")} *</label>
            <input name="amount" type="number" min="1" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="100" className="input" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? t("submitting") : t("donate_with_chapa")}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DonationInside;
