import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const purposes = ["Weekly Donation", "Building Fund", "Charity (Poor)", "Special Events", "Other"];

const DonationOutside = () => {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", email: "", purpose: "", amount: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, purpose, amount } = formData;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !purpose || !amount) {
      Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please complete all required fields.", confirmButtonColor: "hsl(52,94%,54%)" });
      return;
    }
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Swal.fire({ icon: "warning", title: "Invalid Amount", text: "Enter a valid amount.", confirmButtonColor: "hsl(52,94%,54%)" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { checkout_url } = await api.createDonation({ fund_category: purpose, amount: amount.trim(), first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim() });
      window.location.href = checkout_url;
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Payment Error", text: error?.response?.data?.detail || error?.message || "Something went wrong.", confirmButtonColor: "hsl(52,94%,54%)" });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition">
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> Back to Home
          </Link>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="card">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-2xl mb-3">
              <span className="text-2xl">💚</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Support Our Mission</h1>
            <p className="text-sm text-muted-foreground mt-1">We'll redirect you to Chapa to complete the payment.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">First Name *</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Abebe" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Last Name *</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Kebede" className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+251 912 345 678" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Purpose *</label>
              <select name="purpose" value={formData.purpose} onChange={handleChange} className="input">
                <option value="">Select a purpose</option>
                {purposes.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount (ETB) *</label>
              <input name="amount" type="number" min="1" step="0.01" value={formData.amount} onChange={handleChange} placeholder="100" className="input" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Redirecting to Chapa..." : "Donate with Chapa"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DonationOutside;