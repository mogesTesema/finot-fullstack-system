import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  UsersIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const purposes = [
  "Weekly Donation",
  "Building Fund",
  "Charity (Poor)",
  "Special Events",
  "Other",
];

// Cards data with Heroicons
const introCards = [
  {
    title: "Student Donations",
    description:
      "Members can donate continuously through the weekly system to support fellow students.",
    icon: UsersIcon,
    color: "#253D7F",
  },
  {
    title: "One-Time Donations",
    description:
      "Outsiders can contribute anytime as they wish to support community projects.",
    icon: CurrencyDollarIcon,
    color: "#EDCF07",
  },
  {
    title: "Transparent & Trackable",
    description:
      "Every contribution is recorded, ensuring accountability and clarity.",
    icon: ShieldCheckIcon,
    color: "#253D7F",
  },
];

const DonationOutside = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    purpose: "",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        title: "Missing Fields",
        text: "Please complete all required fields.",
        confirmButtonColor: "hsl(52,94%,54%)",
      });
      return;
    }
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Amount",
        text: "Enter a valid amount.",
        confirmButtonColor: "hsl(52,94%,54%)",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { checkout_url } = await api.createDonation({
        fund_category: purpose,
        amount: amount.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      window.location.href = checkout_url;
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Payment Error",
        text:
          error?.response?.data?.detail ||
          error?.message ||
          "Something went wrong.",
        confirmButtonColor: "hsl(52,94%,54%)",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navbar back link */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-[#253D7F] hover:text-[#1f3160] font-medium text-sm transition"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> Back to Home
          </Link>
        </div>

        {/* Donation Intro Section */}
        {/* Donation Intro Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#253D7F] mb-6 text-center">
            Support Our Students & Community
          </h1>
          <p className="text-center text-slate-700 mb-8 max-w-2xl mx-auto">
            Contribute to a growing and sustainable community. Students can
            donate continuously, while supporters from outside can donate as
            they wish. Every donation counts!
          </p>

          {/* Gradient Hover Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {introCards.map((card, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl shadow-lg p-6 flex flex-col items-center text-center min-h-[200px] transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer group"
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b from-transparent to-transparent group-hover:from-[${card.color}] group-hover:to-white opacity-30 transition-all duration-500`}
                />

                <div
                  className="rounded-full p-4 mb-4 flex items-center justify-center z-10"
                  style={{ backgroundColor: card.color }}
                >
                  <card.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-xl text-[#253D7F] mb-2 z-10 group-hover:text-[#EDCF07] transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 z-10">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Donation Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="card"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#EDCF07] rounded-2xl mb-3">
              <CurrencyDollarIcon className="h-6 w-6 text-[#253D7F]" />
            </div>
            <h1 className="text-xl font-bold text-[#253D7F]">Donate Now</h1>
            <p className="text-sm text-slate-700 mt-1">
              We'll redirect you to Chapa to complete the payment securely.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                  First Name *
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Abebe"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                  Last Name *
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kebede"
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                Phone (optional)
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+251 912 345 678"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                Purpose *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select a purpose</option>
                {purposes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                Amount (ETB) *
              </label>
              <input
                name="amount"
                type="number"
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="100"
                className="input"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
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
