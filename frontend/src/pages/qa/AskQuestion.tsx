import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AskQuestion = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { id: "Academic", name: t("cat_academic") },
    { id: "Spiritual", name: t("cat_spiritual") },
    { id: "Family", name: t("cat_family") },
    { id: "Personal", name: t("cat_personal") },
    { id: "Other", name: t("cat_other") },
  ];
  const { user } = useAuth();
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect if we're inside the dashboard
  const isDashboard = location.pathname.startsWith("/dashboard");
  const backRoute = isDashboard ? "/dashboard/questions" : "/anonymous/questions";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !question) {
      Swal.fire({
        icon: "warning",
        title: t("missing_fields"),
        text: t("missing_qa_fields"),
        confirmButtonColor: "hsl(52,94%,54%)",
      });
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
      Swal.fire({
        icon: "success",
        title: t("question_posted"),
        text: t("question_posted_text"),
        confirmButtonColor: "hsl(52,94%,54%)",
      });
      navigate(backRoute);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("failed"),
        text: error.message || t("something_went_wrong"),
        confirmButtonColor: "hsl(52,94%,54%)",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isDashboard ? "" : "min-h-screen bg-background py-12 px-4"}>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to={backRoute} className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition">
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> {t("back_to_questions")}
          </Link>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="card">
          <h1 className="text-xl font-bold text-foreground mb-1">{t("ask_question")}</h1>
          <p className="text-sm text-muted-foreground mb-6">{t("identity_anonymous")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("nickname_optional")}</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t("nickname_placeholder")} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("category")} *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                <option value="">{t("select_category")}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("your_question")} *</label>
              <textarea rows={5} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("type_question_here")} className="input" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? t("posting") : t("post_question")}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AskQuestion;