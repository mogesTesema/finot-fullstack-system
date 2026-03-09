import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ResetPasswordConfirmPage = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uid || !token) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "The reset link is missing required parameters. Please request a new one.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    if (!formData.new_password || !formData.confirm_password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter and confirm your new password.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      Swal.fire({
        icon: "warning",
        title: "Passwords Do Not Match",
        text: "Make sure both password fields match.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.requestPasswordResetConfirm(uid, token, formData.new_password, formData.confirm_password);
      Swal.fire({
        icon: "success",
        title: "Password Reset",
        text: "Your password has been reset. Please log in with your new credentials.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      navigate("/login");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: error?.response?.data?.detail || error.message || "Unable to reset password. The link may be invalid or expired.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
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
            Set a New Password
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300 hover:text-yellow-400"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300 hover:text-yellow-400"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-[#1B3067] py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Reset Password"}
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

export default ResetPasswordConfirmPage;
