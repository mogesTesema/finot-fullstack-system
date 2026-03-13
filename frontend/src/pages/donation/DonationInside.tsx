import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const purposes = ["Weekly Donation", "Building Fund", "Charity (Poor)", "Special Events", "Other"];

const DonationInside = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ purpose: "", amount: "" });
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
      Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please select a purpose and amount." });
      return;
    }
    setIsSubmitting(true);
    try {
      const { checkout_url } = await api.createDonation({ fund_category: formData.purpose, amount: formData.amount.trim() });
      window.location.href = checkout_url;
    } catch (error: unknown) {
      let msg = "Something went wrong.";
      if (error && typeof error === "object") {
        const errObj = error as Record<string, any>;
        msg = errObj?.response?.data?.detail || errObj?.message || msg;
      }
      Swal.fire({ icon: "error", title: "Payment Error", text: msg });
    } finally { setIsSubmitting(false); }
  };

  const totalDonations = donationHistory.reduce((sum, d) => sum + Number(d.payment?.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard/donations" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition">
          <FiArrowLeft className="h-4 w-4" /> Back to Donations
        </Link>
        <Link to="/dashboard/donations/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80">
          <FiHeart className="h-4 w-4" /> Donation Profile
        </Link>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="card max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground text-center mb-1">Give a Donation</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Complete and we'll redirect to Chapa.</p>

        {/* Stats */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-foreground text-sm mb-2">Your Giving Snapshot</h2>
          {loading ? (
            <div className="skeleton h-8 w-1/2 rounded-lg" />
          ) : donationHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No donations yet. Be the first!</p>
          ) : (
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-primary">{totalDonations.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">ETB</span></p>
                <p className="text-xs text-muted-foreground">Total given</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{donationHistory.length}</p>
                <p className="text-xs text-muted-foreground">Gifts</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Purpose *</label>
            <select name="purpose" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="input">
              <option value="">Select a purpose</option>
              {purposes.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Amount (ETB) *</label>
            <input name="amount" type="number" min="1" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="100" className="input" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Redirecting to Chapa..." : "Donate with Chapa"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DonationInside;
