import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
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
const DonationOutside = () => {
  const { t } = useTranslation();

  const purposes = [
    t("weekly_donation"),
    t("building_fund"),
    t("charity_(poor)"),
    t("special_events"),
    t("other"),
  ];

  const introCards = [
    {
      title: t("student_donations"),
      description: t("student_donations_desc"),
      icon: UsersIcon,
      color: "#253D7F",
    },
    {
      title: t("one_time_donations"),
      description: t("one_time_donations_desc"),
      icon: CurrencyDollarIcon,
      color: "#EDCF07",
    },
    {
      title: t("transparent_trackable"),
      description: t("transparent_trackable_desc"),
      icon: ShieldCheckIcon,
      color: "#253D7F",
    },
  ];
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
        title: t("missing_fields"),
        text: t("missing_donation_fields"),
        confirmButtonColor: "hsl(52,94%,54%)",
      });
      return;
    }
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: t("invalid_amount"),
        text: t("invalid_amount_text"),
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
        title: t("payment_error"),
        text:
          error?.response?.data?.detail ||
          error?.message ||
          t("something_went_wrong"),
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
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> {t("back_to_home_link")}
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
            {t("support_students_community")}
          </h1>
          <p className="text-center text-slate-700 mb-8 max-w-2xl mx-auto">
            {t("donation_intro_desc")}
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
            <h1 className="text-xl font-bold text-[#253D7F]">{t("donate_now")}</h1>
            <p className="text-sm text-slate-700 mt-1">
              {t("chapa_redirect")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                  {t("first_name_label")} *
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t("first_name_placeholder")}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                  {t("last_name_label")} *
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t("last_name_placeholder")}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                {t("email")} *
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
                {t("phone")} ({t("optional")})
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
                {t("purpose")} *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="input"
              >
                <option value="">{t("select_purpose")}</option>
                {purposes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#253D7F] mb-1.5">
                {t("amount_etb")} *
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
              {isSubmitting ? t("redirecting_to_chapa") : t("donate_with_chapa")}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationOutside;
