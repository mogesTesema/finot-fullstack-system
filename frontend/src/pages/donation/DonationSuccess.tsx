import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import type { Donation } from "../../types";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "missing">("idle");
  const [details, setDetails] = useState<{ amount?: number; status?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!txRef) { setStatus("missing"); return; }
    const verify = async () => {
      setStatus("loading");
      try {
        const data = await api.verifyDonation(txRef);
        setDetails(data);
        setStatus("success");
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.detail || error?.message || "Unable to verify payment.");
        setStatus("error");
      }
    };
    verify();
  }, [txRef]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="card max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Payment Verified!</h1>
            <p className="text-muted-foreground mb-2">{details?.status}</p>
            {typeof details?.amount === "number" && (
              <p className="text-3xl font-bold text-primary mb-6">{details.amount.toFixed(2)} ETB</p>
            )}
          </>
        )}
        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Verification Issue</h1>
            <p className="text-destructive text-sm mb-6">{errorMessage}</p>
          </>
        )}
        {status === "missing" && (
          <>
            <h1 className="text-xl font-bold text-foreground mb-2">Missing Reference</h1>
            <p className="text-muted-foreground text-sm mb-6">No transaction reference found. Please try again.</p>
          </>
        )}
        {(status === "success" || status === "error" || status === "missing") && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={user ? "/donate/history" : "/donate"} className="btn-primary text-sm">
              {user ? "View History" : "Donate Again"}
            </Link>
            <Link to={user ? "/dashboard" : "/"} className="btn-outline text-sm">
              {user ? "Dashboard" : "Home"}
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DonationSuccess;