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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasSentOnce, setHasSentOnce] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Missing Email",
        text: "Please enter your email address.",
        confirmButtonColor: "#EDCF07",
        background: "#253D7F",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.requestPasswordReset(email);
      Swal.fire({
        icon: "success",
        title: "Reset Link Sent",
        text: "If an account exists with that email, you will receive password reset instructions.",
        confirmButtonColor: "#EDCF07",
        background: "#253D7F",
        color: "#fff",
      });
      setHasSentOnce(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: error.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#EDCF07",
        background: "#253D7F",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Missing Email",
        text: "Please enter your email address first, then tap resend.",
        confirmButtonColor: "#EDCF07",
        background: "#253D7F",
        color: "#fff",
      });
      return;
    }
    setIsResending(true);
    try {
      await api.requestPasswordReset(email);
      Swal.fire({
        icon: "success",
        title: "Reset Link Re-sent",
        text: "If an account exists with that email, another reset link has been sent.",
        confirmButtonColor: "#EDCF07",
        background: "#253D7F",
        color: "#fff",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Resend Failed",
        text: error.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#EDCF07",
        background: "#253D7F",
        color: "#fff",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-[#253D7F] hover:text-[#1f3160] font-medium text-sm transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <img src="/images/logo.png" alt="finot" className="h-12 w-12" />
        </div>

        {/* Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-center text-[#253D7F] mb-2">
            Reset Password
          </h1>
          <p className="text-center text-slate-600 mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#253D7F] mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled={hasSentOnce}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-[#EAEFFF] border border-[#253D7F] rounded-lg text-[#253D7F] focus:outline-none focus:ring-2 focus:ring-[#EDCF07] disabled:opacity-50"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSubmitting || hasSentOnce}
              className="w-full bg-[#253D7F] text-[#EDCF07] py-3 px-6 rounded-lg font-semibold hover:bg-[#1f3160] hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResend}
              disabled={!hasSentOnce || isResending || isSubmitting}
              className="w-full border border-[#253D7F] text-[#253D7F] py-3 px-6 rounded-lg font-semibold hover:bg-[#253D7F] hover:text-[#EDCF07] hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Resending..." : "Didn't get it? Resend email"}
            </button>

            {/* Back to Login */}
            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-[#253D7F] hover:text-[#1f3160] transition"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;