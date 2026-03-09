import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api"; // <-- import the api

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
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the API method
      await api.requestPasswordReset(email);

      Swal.fire({
        icon: "success",
        title: "Reset Link Sent",
        text: "If an account exists with that email, you will receive password reset instructions.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      setHasSentOnce(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: error.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
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
        confirmButtonColor: "#fbbf24",
        background: "#142850",
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
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Resend Failed",
        text: error.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
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
          className="bg-[#142850] rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-center text-yellow-400 mb-2">
            Reset Password
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled={hasSentOnce}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || hasSentOnce}
              className="w-full bg-yellow-400 text-[#1B3067] py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={!hasSentOnce || isResending || isSubmitting}
              className="w-full border border-yellow-400 text-yellow-400 py-3 px-6 rounded-lg font-semibold hover:bg-yellow-400 hover:text-[#1B3067] transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Resending..." : "Didn't get it? Resend email"}
            </button>

            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-yellow-400 hover:text-yellow-300 transition"
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
