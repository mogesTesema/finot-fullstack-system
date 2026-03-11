import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader, StatsCard } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { Donation } from "../../types";
import { FiHeart, FiCalendar, FiTrendingUp, FiPlus, FiDollarSign } from "react-icons/fi";

const DashboardDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await api.getDonations();
        setDonations(data);
      } catch (error) {
        console.error("Failed to fetch donations", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDonations();
  }, [user]);

  const totalDonations = donations.length;
  const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.payment.amount || "0"), 0);
  const completedDonations = donations.filter((d) => d.payment.status === "COMPLETED").length;

  const statusVariant: Record<string, any> = {
    COMPLETED: "success",
    PENDING: "warning",
    FAILED: "destructive",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (<div key={i} className="skeleton h-24 rounded-2xl" />))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (<div key={i} className="skeleton h-20 rounded-xl" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Donations" description="Your contribution history and giving" icon={<FiHeart className="h-6 w-6" />}
        action={
          <Link to="/dashboard/donations/give" className="btn-primary inline-flex items-center gap-2 text-sm">
            <FiPlus className="h-4 w-4" /> Make Donation
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Donations" value={totalDonations} icon={<FiHeart className="h-6 w-6" />} />
        <StatsCard title="Total Amount" value={`${totalAmount.toFixed(2)} ETB`} icon={<FiDollarSign className="h-6 w-6" />} />
        <StatsCard title="Completed" value={completedDonations} icon={<FiTrendingUp className="h-6 w-6" />} />
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Donation History</h3>
        {donations.length === 0 ? (
          <EmptyState icon={<FiHeart className="h-8 w-8" />} title="No donations yet" description="Your donation history will appear here." />
        ) : (
          <div className="space-y-2">
            {donations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition hover:bg-muted">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-success/10 p-3"><FiHeart className="h-5 w-5 text-success" /></div>
                  <div>
                    <p className="font-medium text-foreground">{donation.fund_category}</p>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><FiCalendar className="h-4 w-4" /><span>{new Date(donation.donated_at).toLocaleDateString()}</span></div>
                      <div className="flex items-center gap-1"><FiDollarSign className="h-4 w-4" /><span>{donation.payment.amount} {donation.payment.currency}</span></div>
                    </div>
                  </div>
                </div>
                <Badge variant={statusVariant[donation.payment.status]} size="md">{donation.payment.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/donate/inside">
          <Card hoverable className="group border-l-4 border-l-success">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-success/10 p-3"><FiPlus className="h-6 w-6 text-success" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">Make a Donation</h3>
                  <p className="text-sm text-muted-foreground">Support the fellowship</p>
                </div>
              </div>
              <FiTrendingUp className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>
        <Link to="/donate/history">
          <Card hoverable className="group border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3"><FiCalendar className="h-6 w-6 text-primary" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">Full History</h3>
                  <p className="text-sm text-muted-foreground">View detailed records</p>
                </div>
              </div>
              <FiTrendingUp className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default DashboardDonations;
