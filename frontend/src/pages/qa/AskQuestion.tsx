import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Question } from "../../types";

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

  const questionTypeOptions = [
    { id: "public", name: t("public") },
    { id: "private", name: t("private") },
  ];

  const { user } = useAuth();
  const [questionType, setQuestionType] = useState<"public" | "private">("public");
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<Question["category"] | "">("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect if we're inside the dashboard
  const isDashboard = location.pathname.startsWith("/dashboard");
  const backRoute = isDashboard ? "/dashboard/questions" : "/anonymous/questions";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) {
      Swal.fire({
        icon: "warning",
        title: t("missing_fields"),
        text: t("missing_category"),
        confirmButtonColor: "hsl(52,94%,54%)",
      });
      return;
    }
    
    if (!question) {
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
        user: user?.id || null,
        display_name: questionType === "public" ? (nickname.trim() || "Anonymous") : user?.full_name,
        category: category as Question["category"],
        question_body: question,
        visibility: questionType === "public" ? "PUBLIC" : "PRIVATE",  // KEY FIELD
      });
      
      Swal.fire({
        icon: "success",
        title: questionType === "public" ? t("question_posted") : t("private_question_posted"),
        text: questionType === "public" ? t("question_posted_text") : t("private_question_posted_text"),
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
            {/* Question Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("question_type")} *</label>
              <div className="flex gap-3">
                {questionTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setQuestionType(option.id as "public" | "private")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                      questionType === option.id
                        ? "bg-primary text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            {questionType === "public" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("nickname_optional")}</label>
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                placeholder={t("nickname_placeholder")} 
                className="input" 
              />
            </div>
          )}

          {/* Category - Show for BOTH public AND private */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("category")} *</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value as Question["category"] | "")} 
              className="input"
            >
              <option value="">{t("select_category")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>


            {/* Question Body */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("your_question")} *</label>
              <textarea 
                rows={5} 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder={t("type_question_here")} 
                className="input" 
              />
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