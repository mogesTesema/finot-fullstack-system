import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const DonationHistory = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        const history = await api.getDonations();
        setDonations(history);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load donation history", err);
        setError("Unable to load your donation history right now.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDonations();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/donate/inside"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Donation
          </Link>
          <Link
            to="/dashboard"
            className="text-yellow-400 hover:text-yellow-300"
          >
            Dashboard
          </Link>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">
            Donation History
          </h1>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : error ? (
            <p className="text-red-300">{error}</p>
          ) : donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                You have not made any donations yet.
              </p>
              <Link
                to="/donate/inside"
                className="bg-yellow-400 text-[#1B3067] px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
              >
                Make a Donation
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <article
                  key={donation.id}
                  className="bg-[#1B3067] rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between gap-3"
                >
                  <div>
                    <p className="text-white font-semibold text-lg">
                      {donation.fund_category}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(donation.donated_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Status: {donation.payment?.status ?? "PENDING"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-2xl">
                      {donation.payment?.amount ?? 0} ETB
                    </p>
                    <p className="text-gray-400 text-xs">
                      Ref: {donation.payment?.transaction_reference ?? "—"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DonationHistory;