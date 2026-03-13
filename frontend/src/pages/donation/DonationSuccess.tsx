import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

const fadeIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

interface ReceiptDetails {
  status?: string;
  amount?: number;
  currency?: string;
  tx_ref?: string;
  date?: string;
  donor_name?: string;
}

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref");
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "missing">("idle");
  const [details, setDetails] = useState<ReceiptDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!txRef) { setStatus("missing"); return; }
    const verify = async () => {
      setStatus("loading");
      try {
        const data = await api.verifyDonation(txRef);
        setDetails(data);
        setStatus("success");
      } catch (error: unknown) {
        let msg = "Unable to verify payment.";
        if (error && typeof error === "object") {
           const errObj = error as Record<string, any>;
           msg = errObj?.response?.data?.detail || errObj?.message || msg;
        }
        setErrorMessage(msg);
        setStatus("error");
      }
    };
    verify();
  }, [txRef]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4 print:bg-white print:p-0">
      
      {/* Hide navigation and extra UI when printing */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .receipt-container, .receipt-container * { visibility: visible; }
            .receipt-container { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div className="w-full max-w-lg space-y-6">
        
        {/* Main Card */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="receipt-container card p-0 overflow-hidden shadow-xl border-border">
          
          {status === "loading" && (
            <div className="p-12 text-center">
              <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
              <p className="text-muted-foreground font-medium">Verifying your payment...</p>
            </div>
          )}

          {status === "success" && details && (
            <div className="bg-card">
              {/* Receipt Header */}
              <div className="bg-primary/5 p-8 text-center border-b border-border">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 ring-4 ring-green-50">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Payment Successful</h1>
                <p className="text-muted-foreground text-sm">Thank you for your generous donation!</p>
              </div>

              {/* Receipt Body */}
              <div className="p-8 space-y-6">
                <div className="text-center pb-6 border-b border-dashed border-border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Amount Paid</p>
                  <p className="text-4xl font-black text-primary">
                    {details.amount?.toFixed(2)} <span className="text-xl text-muted-foreground font-medium">{details.currency || "ETB"}</span>
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Donor Name</span>
                    <span className="font-medium text-foreground text-right">{details.donor_name || (user ? (user as any).first_name + ' ' + (user as any).last_name : "Generous Donor")}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium text-foreground text-right">
                      {details.date ? new Date(details.date).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Ref</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-foreground">{details.tx_ref || txRef}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs uppercase tracking-wide">Paid</span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="bg-muted/30 p-4 text-center text-xs text-muted-foreground border-t border-border">
                This is an official receipt for your donation to Finot.
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">Verification Issue</h1>
              <p className="text-destructive text-sm bg-red-50 p-3 rounded-lg border border-red-100 inline-block">{errorMessage}</p>
            </div>
          )}

          {status === "missing" && (
            <div className="p-12 text-center">
              <h1 className="text-xl font-bold text-foreground mb-2">Missing Reference</h1>
              <p className="text-muted-foreground text-sm">No transaction reference found. Please return to home and try again.</p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons (Not printed) */}
        {(status === "success" || status === "error" || status === "missing") && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="no-print space-y-3">
            {status === "success" && (
              <button 
                onClick={handlePrint} 
                className="w-full btn-outline flex items-center justify-center gap-2 py-3 bg-card border-border shadow-sm hover:bg-muted"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download / Print Receipt
              </button>
            )}
            
            <div className="flex gap-3">
              <Link 
                to={user ? "/dashboard" : "/"} 
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                {user ? "Back to Dashboard" : "Back to Home"}
              </Link>
              
              <Link 
                to={user ? "/dashboard/donations/history" : "/donate"} 
                className="flex-1 btn-outline bg-card py-3 flex items-center justify-center"
              >
                {user ? "View All Receipts" : "Donate Again"}
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default DonationSuccess;