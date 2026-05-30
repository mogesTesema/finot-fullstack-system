import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";
import EmptyState from "../../components/ui/EmptyState";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const DonationHistory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.getDonations().then((data) => { setDonations(data); setError(null); })
        .catch(() => setError(t("unable_load_history")))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard/donations" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition">
          <FiArrowLeft className="h-4 w-4" /> {t("back_to_donations")}
        </Link>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="card max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">{t("recent_donations")}</h1>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : donations.length === 0 ? (
          <EmptyState title={t("no_donations_msg")} description={t("no_donations_yet_msg")} action={
            <Link to="/dashboard/donations/give" className="btn-primary text-sm">{t("give_donation")}</Link>
          } />
        ) : (
          <div className="space-y-3">
            {donations.map((d) => (
              <div key={d.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium text-foreground">{t(d.fund_category.toLowerCase().replace(/ /g, "_")) || d.fund_category}</p>
                  <p className="text-xs text-muted-foreground">{new Date(d.donated_at).toLocaleString()}</p>
                  <span className={`text-xs font-medium ${d.payment?.status === "COMPLETED" ? "text-success" : "text-warning"}`}>
                    {d.payment?.status === "COMPLETED" ? t("status_completed") : t("status_pending")}
                  </span>
                </div>
                <div className="sm:text-right">
                  <p className="text-xl font-bold text-primary">{Number(d.payment?.amount ?? 0).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{t("etb")}</span></p>
                  <p className="text-xs text-muted-foreground truncate">{t("reference")}: {d.payment?.transaction_reference ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DonationHistory;
