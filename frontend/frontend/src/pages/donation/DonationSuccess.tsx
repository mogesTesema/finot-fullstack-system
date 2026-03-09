import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "missing">("idle");
  const [details, setDetails] = useState<{ amount?: number; status?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<Donation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) {
      return;
    }
    setHistoryLoading(true);
    try {
      const data = await api.getDonations();
      setHistory(data);
      setHistoryError(null);
    } catch (error: any) {
      console.error("History fetch failed", error);
      setHistoryError("Unable to refresh your donation history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!txRef) {
      setStatus("missing");
      return;
    }

    const verify = async () => {
      setStatus("loading");
      try {
        const data = await api.verifyDonation(txRef);
        setDetails(data);
        setStatus("success");
        if (user) {
          await fetchHistory();
        }
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.detail ||
            error?.response?.data?.status ||
            error?.message ||
            "Unable to verify payment.",
        );
        setStatus("error");
      }
    };

    verify();
  }, [txRef, user]);

  const renderBody = () => {
    switch (status) {
      case "missing":
        return (
          <p className="text-gray-300">
            We could not find a transaction reference. Please start the donation again.
          </p>
        );
      case "loading":
        return <p className="text-gray-300">Verifying your payment with Chapa...</p>;
      case "success":
        return (
          <>
            <p className="text-gray-300 mb-4">
              {details?.status || "Payment verified"}
            </p>
            {typeof details?.amount === "number" && (
              <p className="text-yellow-400 font-semibold text-3xl">
                {details.amount.toFixed(2)} ETB
              </p>
            )}
          </>
        );
      default:
        return (
          <p className="text-red-300">{errorMessage || "Payment could not be verified."}</p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <h1 className="text-3xl font-bold text-center text-yellow-400 mb-2">
            Donation Result
          </h1>
          <div className="text-center mb-6">{renderBody()}</div>
          {(status === "success" || status === "error") && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Link
                  to="/donate/history"
                  className="w-full sm:w-auto text-center bg-yellow-400 text-[#1B3067] px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
                >
                  View Donation History
                </Link>
              ) : (
                <Link
                  to="/donate"
                  className="w-full sm:w-auto text-center bg-yellow-400 text-[#1B3067] px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
                >
                  Donate Again
                </Link>
              )}
              <Link
                to={user ? "/dashboard" : "/"}
                className="w-full sm:w-auto text-center border border-yellow-400/40 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:border-yellow-300 hover:text-yellow-300 transition"
              >
                {user ? "Back to Dashboard" : "Return Home"}
              </Link>
              </div>
            )}
          {status === "success" && user && (
            <div className="mt-8 bg-[#1B3067] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Latest gifts</p>
                <button
                  onClick={fetchHistory}
                  disabled={historyLoading}
                  className="text-xs text-yellow-300 hover:text-yellow-200"
                >
                  {historyLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              {historyError && (
                <p className="text-red-300 text-xs">{historyError}</p>
              )}
              {history.length === 0 ? (
                <p className="text-gray-300 text-sm">
                  Your donation history will appear here once the backend links the payment.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 3).map((donation) => (
                    <div
                      key={donation.id}
                      className="p-3 rounded-lg bg-[#142850] flex justify-between items-center"
                    >
                      <div>
                        <p className="text-white text-sm">
                          {donation.fund_category}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(donation.donated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-semibold">
                          {donation.payment?.amount ?? 0} ETB
                        </p>
                        <p className="text-xs text-gray-500">
                          {donation.payment?.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DonationSuccess;