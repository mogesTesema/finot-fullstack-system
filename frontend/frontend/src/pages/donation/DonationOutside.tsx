import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";

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

type GuestDonationForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  purpose: string;
  amount: string;
};

const DonationOutside = () => {
  const [formData, setFormData] = useState<GuestDonationForm>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    purpose: "",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { firstName, lastName, email, purpose, amount } = formData;
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !purpose ||
      !amount
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Required Fields",
        text: "Please complete all required fields before continuing.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    const parsedAmount = Number(amount);
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
        fund_category: purpose,
        amount: amount.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      };
      const { checkout_url } = await api.createDonation(donationPayload);

      window.location.href = checkout_url;
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Unable to start payment",
        text: error?.response?.data?.detail ||
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

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <img src="/images/logo.png" alt="finot" className="h-12 w-12" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-6 sm:p-8"
        >
          <h1 className="text-3xl font-bold text-center text-yellow-400 mb-2">
            Support Our Mission
          </h1>
          <p className="text-center text-gray-300 mb-6">
            Complete the form and we will send you to Chapa to finish the payment.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Abebe"
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kebede"
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Phone Number (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(+251) 912 345 678"
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

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

export default DonationOutside;