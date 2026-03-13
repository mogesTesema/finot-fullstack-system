import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";
import { Card } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const DonationProfile = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getDonations().then(setDonations).catch(console.error).finally(() => setLoading(false));
    }
  }, [user]);

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.payment?.amount ?? 0), 0);
  const donationCount = donations.length;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTotals = Array(12).fill(0);
  donations.forEach((d) => {
    const month = new Date(d.donated_at).getMonth();
    monthlyTotals[month] += Number(d.payment?.amount ?? 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard/donations" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition">
          <FiArrowLeft className="h-4 w-4" /> Back to Donations
        </Link>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
        <div className="flex items-center gap-3">
          <FiHeart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Donation Profile</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : donationCount === 0 ? (
          <Card className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't made any donations yet.</p>
            <Link to="/dashboard/donations/give" className="btn-primary text-sm">Make your first donation</Link>
          </Card>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center">
                <p className="text-sm text-muted-foreground">Total Donated</p>
                <p className="text-2xl font-bold text-primary mt-1">{totalAmount} ETB</p>
              </Card>
              <Card className="text-center">
                <p className="text-sm text-muted-foreground">Number of Gifts</p>
                <p className="text-2xl font-bold text-primary mt-1">{donationCount}</p>
              </Card>
              <Card className="text-center">
                <p className="text-sm text-muted-foreground">Average Gift</p>
                <p className="text-2xl font-bold text-primary mt-1">{donationCount ? Math.round(totalAmount / donationCount) : 0} ETB</p>
              </Card>
            </div>

            {/* Monthly breakdown */}
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Giving</h2>
              <div className="space-y-2">
                {months.map((month, i) =>
                  monthlyTotals[i] > 0 && (
                    <div key={month} className="flex items-center gap-3">
                      <span className="w-10 text-sm text-muted-foreground">{month}</span>
                      <div className="flex-1 bg-muted h-6 rounded-lg overflow-hidden">
                        <div className="bg-primary h-full rounded-lg transition-all" style={{ width: `${totalAmount ? (monthlyTotals[i] / totalAmount) * 100 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{monthlyTotals[i]} ETB</span>
                    </div>
                  )
                )}
              </div>
            </Card>

            {/* Recent donations */}
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Donations</h2>
              <div className="space-y-3">
                {donations.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div>
                      <p className="font-medium text-foreground">{d.fund_category}</p>
                      <p className="text-xs text-muted-foreground">{new Date(d.donated_at).toLocaleDateString()}</p>
                      <Badge variant={d.payment?.status === "COMPLETED" ? "success" : "warning"} size="sm" className="mt-1">
                        {d.payment?.status ?? "PENDING"}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-primary">{d.payment?.amount ?? 0} ETB</span>
                  </div>
                ))}
              </div>
              {donations.length > 5 && (
                <p className="text-sm text-muted-foreground mt-3">and {donations.length - 5} more...</p>
              )}
            </Card>

            <p className="text-center text-success italic text-sm">"Your consistent charity helps us grow. Thank you!"</p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DonationProfile;
