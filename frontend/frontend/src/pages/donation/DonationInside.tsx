import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const purposes = [
  "Weekly Donation",
  "Building Fund",
  "Charity (Poor)",
  "Special Events",
  "Other",
];

const DonationInside = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    purpose: "",
    amount: "",
  });
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const donations = await api.getDonations();
        setDonationHistory(donations);
      } catch (error) {
        console.error("Failed to fetch donation history", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.purpose || !formData.amount) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select a purpose and enter an amount.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    const parsedAmount = Number(formData.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Amount",
        text: "Enter a donation amount greater than zero.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const donationPayload = {
        fund_category: formData.purpose,
        amount: formData.amount.trim(),
      };
      const { checkout_url } = await api.createDonation(donationPayload);
      window.location.href = checkout_url;
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Unable to start payment",
        text:
          error?.response?.data?.detail ||
          error?.message ||
          "Something went wrong. Please try again later.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDonations = donationHistory.reduce(
    (sum, donation) => sum + Number(donation.payment?.amount ?? 0),
    0,
  );
  const donationCount = donationHistory.length;

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <img src="/images/logo.png" alt="finot" className="h-12 w-12" />
        </div>

        <div className="flex justify-end mb-4">
          <Link
            to="/donate/profile"
            className="inline-flex items-center bg-[#1B3067] text-yellow-400 px-4 py-2 rounded-lg border border-yellow-400/30 hover:bg-[#142850] transition"
          >
            <HeartIcon className="h-5 w-5 mr-2" />
            View Donation Profile
          </Link>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <h1 className="text-3xl font-bold text-center text-yellow-400 mb-2">
            Give a Donation
          </h1>
          <p className="text-center text-gray-300 mb-6">
            Once you submit we will send you to Chapa to finish the payment.
          </p>

          <div className="bg-[#1B3067] rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">
              Your Giving Snapshot
            </h2>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : donationCount === 0 ? (
              <p className="text-gray-400">No donations yet. Be the first!</p>
            ) : (
              <>
                <p className="text-gray-300">
                  Total: <span className="text-yellow-400 font-semibold">{totalDonations} ETB</span>
                </p>
                <p className="text-gray-300">
                  Gifts: <span className="text-yellow-400 font-semibold">{donationCount}</span>
                </p>
                <p className="text-green-400 text-sm mt-2">
                  Thanks for consistently supporting our mission.
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="purpose"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Purpose *
              </label>
              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select a purpose</option>
                {purposes.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Amount (ETB) *
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-[#1B3067] py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Redirecting to Chapa..." : "Donate with Chapa"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationInside;