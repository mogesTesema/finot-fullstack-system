// src/pages/donation/DonationProfile.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const DonationProfile = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await api.getDonations(user?.id);
        setDonations(data);
      } catch (error) {
        console.error("Failed to fetch donations", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDonations();
  }, [user]);

  const totalAmount = donations.reduce(
    (sum, donation) => sum + Number(donation.payment?.amount ?? 0),
    0,
  );
  const donationCount = donations.length;

  // Group by month for chart (mock)
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyTotals = Array(12).fill(0);
  donations.forEach((donation) => {
    const month = new Date(donation.donated_at).getMonth();
    monthlyTotals[month] += Number(donation.payment?.amount ?? 0);
  });

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
          <img src="/images/logo.png" alt="finot" className="h-12 w-12" />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <HeartIcon className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-yellow-400">
              My Donation Profile
            </h1>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : donationCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                You haven't made any donations yet.
              </p>
              <Link
                to="/donate/inside"
                className="bg-yellow-400 text-[#1B3067] px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
              >
                Make your first donation
              </Link>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1B3067] p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">Total Donated</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {totalAmount} ETB
                  </p>
                </div>
                <div className="bg-[#1B3067] p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">Number of Gifts</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {donationCount}
                  </p>
                </div>
                <div className="bg-[#1B3067] p-4 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">Average Gift</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {donationCount
                      ? Math.round(totalAmount / donationCount)
                      : 0} ETB
                  </p>
                </div>
              </div>

              {/* Monthly breakdown (simple bar chart) */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                  Monthly Giving
                </h2>
                <div className="space-y-2">
                  {months.map(
                    (month, i) =>
                      monthlyTotals[i] > 0 && (
                        <div key={month} className="flex items-center gap-2">
                          <span className="w-10 text-gray-300 text-sm">
                            {month}
                          </span>
                          <div className="flex-1 bg-[#1B3067] h-6 rounded overflow-hidden">
                              <div
                                className="bg-yellow-400 h-full"
                                style={{
                                  width: `${totalAmount ? (monthlyTotals[i] / totalAmount) * 100 : 0}%`,
                                }}
                              />
                          </div>
                          <span className="text-yellow-400 text-sm font-medium">
                            {monthlyTotals[i]} ETB
                          </span>
                        </div>
                      ),
                  )}
                </div>
              </div>

              {/* Recent donations */}
              <div>
                <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                  Recent Donations
                </h2>
                <div className="space-y-3">
                  {donations.slice(0, 5).map((donation) => (
                    <div
                      key={donation.id}
                      className="bg-[#1B3067] p-3 rounded flex justify-between items-center"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {donation.fund_category}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(donation.donated_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {donation.payment?.status ?? "PENDING"}
                        </p>
                      </div>
                      <span className="text-yellow-400 font-bold">
                        {donation.payment?.amount ?? 0} ETB
                      </span>
                    </div>
                  ))}
                </div>
                {donations.length > 5 && (
                  <p className="text-gray-400 text-sm mt-2">
                    and {donations.length - 5} more...
                  </p>
                )}
              </div>

              <div className="mt-8 text-center text-green-400 italic">
                "Your consistent charity helps us grow. Thank you!"
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DonationProfile;
