import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";
import EmptyState from "../../components/ui/EmptyState";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const DonationHistory = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.getDonations().then((data) => { setDonations(data); setError(null); })
        .catch(() => setError("Unable to load donation history."))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/donate/inside" className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition">
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> Back
          </Link>
          <Link to="/dashboard" className="text-sm text-primary font-medium hover:text-primary-light">Dashboard</Link>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="card">
          <h1 className="text-xl font-bold text-foreground mb-4">Donation History</h1>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
          ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : donations.length === 0 ? (
            <EmptyState title="No donations yet" description="Your giving history will appear here." action={
              <Link to="/donate/inside" className="btn-primary text-sm">Make a Donation</Link>
            } />
          ) : (
            <div className="space-y-3">
              {donations.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">{d.fund_category}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.donated_at).toLocaleString()}</p>
                    <span className={`text-xs font-medium ${d.payment?.status === "COMPLETED" ? "text-success" : "text-warning"}`}>
                      {d.payment?.status ?? "PENDING"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{d.payment?.amount ?? 0} <span className="text-xs font-normal text-muted-foreground">ETB</span></p>
                    <p className="text-xs text-muted-foreground">Ref: {d.payment?.transaction_reference ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DonationHistory;