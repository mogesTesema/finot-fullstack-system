import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Question, Answer } from "@/types";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Extended Question type for counselor view
interface CounselorQuestion extends Question {
  student_name?: string;
  is_answered?: boolean;
}

const CounselorQueue = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // State
  const [counselorQueue, setCounselorQueue] = useState<CounselorQuestion[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<CounselorQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("unanswered");
  const [selectedQuestion, setSelectedQuestion] = useState<CounselorQuestion | null>(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch counselor queue (unanswered private questions)
  const fetchCounselorQueue = useCallback(async () => {
    try {
      const response = await api.getCounselorQueue();
      // Filter unanswered questions (questions without answers or where is_answered is false)
      const unanswered = response.filter((q: CounselorQuestion) => {
        return !q.is_answered && (!q.answers || q.answers.length === 0);
      });
      setCounselorQueue(unanswered);
    } catch (error) {
      console.error("Failed to fetch counselor queue", error);
      toast.error(t("failed_to_load_questions"));
    }
  }, []);

  // Fetch answered questions (counselor's own answers)
  const fetchAnsweredQuestions = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Get counselor's own answers from my-contributions
      const contributions = await api.getMyContributions();
      // Get questions that counselor has answered
      const answeredQIds = contributions.answers.map((a: Answer) => a.question);
      const uniqueQIds = [...new Set(answeredQIds)];
      
      // Fetch full question details for answered questions
      const answered: CounselorQuestion[] = [];
      for (const qId of uniqueQIds) {
        try {
          const question = await api.getQuestionById(qId);
          if (question.visibility === "PRIVATE") {
            answered.push(question);
          }
        } catch (e) {
          console.error("Failed to fetch question", qId);
        }
      }
      setAnsweredQuestions(answered);
    } catch (error) {
      console.error("Failed to fetch answered questions", error);
    }
  }, [user?.id]);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCounselorQueue();
      await fetchAnsweredQuestions();
      setLoading(false);
    };
    loadData();
  }, [fetchCounselorQueue, fetchAnsweredQuestions]);

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      toast.error(t("please_enter_answer"));
      return;
    }
    
    if (!selectedQuestion) return;
    
    setSubmitting(true);
    try {
      // Post answer using the real endpoint
      await api.postAnswer({
        question: selectedQuestion.id,
        display_name: user?.full_name || "Counselor",
        answer_body: answerText,
      });
      
      toast.success(t("answer_submitted_successfully"));
      
      // Move from unanswered to answered
      setCounselorQueue(prev => prev.filter(q => q.id !== selectedQuestion.id));
      setAnsweredQuestions(prev => [selectedQuestion, ...prev]);
      
      // Close modal
      setShowAnswerModal(false);
      setAnswerText("");
      setSelectedQuestion(null);
    } catch (error) {
      console.error("Failed to submit answer", error);
      toast.error(t("failed_to_submit_answer"));
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} ${t("hours_ago")}`;
    }
    return date.toLocaleDateString();
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "academic":
        return "bg-blue-100 text-blue-700";
      case "spiritual":
        return "bg-purple-100 text-purple-700";
      case "psychological":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">
          {t("counselor_dashboard")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("counselor_dashboard_description")}
        </p>
        
        {/* Role Badge - Just for display, not for access control */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <ChatBubbleLeftRightIcon className="h-3 w-3" />
            QA Counselor
          </span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("unanswered")}
          className={`px-4 py-2 font-medium text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "unanswered"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClockIcon className="h-4 w-4" />
          {t("unanswered")} ({counselorQueue.length})
        </button>
        <button
          onClick={() => setActiveTab("answered")}
          className={`px-4 py-2 font-medium text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "answered"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircleIcon className="h-4 w-4" />
          {t("answered")} ({answeredQuestions.length})
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="space-y-4"
      >
        {activeTab === "unanswered" ? (
          <>
            {counselorQueue.length > 0 ? (
              <div className="space-y-3">
                {counselorQueue.map((q) => (
                  <div
                    key={q.id}
                    className="card border-l-4 border-l-primary hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-lg ${getCategoryColor(
                              q.category
                            )}`}
                          >
                            {q.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(q.created_at)}
                          </span>
                        </div>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {t("pending")}
                        </span>
                      </div>
                      <p className="text-foreground">{q.question_body}</p>
                      <button
                        onClick={() => {
                          setSelectedQuestion(q);
                          setShowAnswerModal(true);
                        }}
                        className="btn-primary text-sm px-4 py-2 self-start"
                      >
                        {t("answer_question")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t("no_unanswered_questions")}</p>
              </div>
            )}
          </>
        ) : (
          answeredQuestions.length > 0 ? (
            <div className="space-y-3">
              {answeredQuestions.map((q) => (
                <div key={q.id} className="card bg-muted/30">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-lg ${getCategoryColor(
                            q.category
                          )}`}
                        >
                          {q.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(q.created_at)}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3" />
                        {t("answered")}
                      </span>
                    </div>
                    <p className="text-foreground">{q.question_body}</p>
                    {q.answers && q.answers.length > 0 && (
                      <div className="mt-2 p-2 bg-primary/5 rounded-lg">
                        <p className="text-xs text-muted-foreground">{t("your_answer")}:</p>
                        <p className="text-sm text-foreground/80">{q.answers[0]?.answer_body?.substring(0, 150)}...</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("no_answered_questions")}</p>
            </div>
          )
        )}
      </motion.div>

      {/* Answer Modal */}
      {showAnswerModal && selectedQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowAnswerModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">{t("answer_question")}</h2>
              <button
                onClick={() => setShowAnswerModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-lg ${getCategoryColor(
                    selectedQuestion.category
                  )}`}
                >
                  {selectedQuestion.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(selectedQuestion.created_at)}
                </span>
              </div>
              <p className="text-foreground">{selectedQuestion.question_body}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("your_answer")} *
              </label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={6}
                className="input w-full"
                placeholder={t("write_answer_placeholder")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("answer_will_be_sent_to_student")}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? t("submitting") : t("submit_answer")}
              </button>
              <button
                onClick={() => setShowAnswerModal(false)}
                className="btn-outline px-4"
              >
                {t("cancel")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CounselorQueue;