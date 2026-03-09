import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const categories = [
  { id: "Academic", name: "Academic" },
  { id: "Spiritual", name: "Spiritual" },
  { id: "Family", name: "Family" },
  { id: "Personal", name: "Personal" },
  { id: "Other", name: "Other" },
];

const AskQuestion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !question) {
      Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please select a category and enter your question.", confirmButtonColor: "hsl(52,94%,54%)" });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.postQuestion({
        user_id: (user as any)?.userId || null,
        display_name: nickname.trim() || "Anonymous",
        category,
        question_body: question,
      });
      Swal.fire({ icon: "success", title: "Question Posted", text: "Your question has been submitted anonymously.", confirmButtonColor: "hsl(52,94%,54%)" });
      navigate("/anonymous/questions");
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Failed", text: error.message || "Something went wrong.", confirmButtonColor: "hsl(52,94%,54%)" });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/anonymous/questions" className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition">
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> Back to Questions
          </Link>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="card">
          <h1 className="text-xl font-bold text-foreground mb-1">Ask a Question</h1>
          <p className="text-sm text-muted-foreground mb-6">Your identity will remain anonymous.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nickname (optional)</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g., SilentSeeker" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Your Question *</label>
              <textarea rows={5} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question here..." className="input" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Posting..." : "Post Question"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AskQuestion;