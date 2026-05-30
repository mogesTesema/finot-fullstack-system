import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasSentOnce, setHasSentOnce] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: t("missing_email"),
        text: t("enter_email_error"),
        confirmButtonColor: "hsl(52, 94%, 54%)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.requestPasswordReset(email);
      Swal.fire({
        icon: "success",
        title: t("reset_link_sent"),
        text: t("reset_link_sent_desc"),
        confirmButtonColor: "hsl(52, 94%, 54%)",
      });
      setHasSentOnce(true);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("request_failed"),
        text: error.message || t("something_went_wrong"),
        confirmButtonColor: "hsl(52, 94%, 54%)",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: t("missing_email"),
        text: t("enter_email_resend_error"),
        confirmButtonColor: "hsl(52, 94%, 54%)",
      });
      return;
    }
    setIsResending(true);
    try {
      await api.requestPasswordReset(email);
      Swal.fire({
        icon: "success",
        title: t("reset_link_resent"),
        text: t("reset_link_resent_desc"),
        confirmButtonColor: "hsl(52, 94%, 54%)",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("resend_failed"),
        text: error.message || t("something_went_wrong"),
        confirmButtonColor: "hsl(52, 94%, 54%)",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {t("back_to_home")}
          </Link>
          <img src="/images/logo.png" alt="finot" className="h-12 w-12" />
        </div>

        {/* Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="card"
        >
          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            {t("reset_password")}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {t("reset_password_desc")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                {t("email_address")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled={hasSentOnce}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input disabled:opacity-50"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSubmitting || hasSentOnce}
              className="btn-primary w-full"
            >
              {isSubmitting ? t("sending") : t("send_reset_link")}
            </button>

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResend}
              disabled={!hasSentOnce || isResending || isSubmitting}
              className="w-full border border-primary text-primary py-3 px-6 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground hover:scale-105 transition transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? t("resending") : t("resend_email_q")}
            </button>

            {/* Back to Login */}
            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-primary hover:text-primary-light transition"
              >
                {t("back_to_login")}
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;