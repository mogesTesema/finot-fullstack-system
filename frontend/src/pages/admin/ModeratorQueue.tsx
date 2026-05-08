import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "../../components/ui/Spinner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface PendingQuestion {
  id: string;
  user: number | null;
  display_name: string;
  category: string;
  question_body: string;
  is_approved: boolean;
  visibility: "PUBLIC" | "PRIVATE";
  created_at: string;
  answers?: PendingAnswer[];
}

interface PendingAnswer {
  id: number;
  question: string | number;
  responder: number | null;
  display_name: string;
  answer_body: string;
  is_approved: boolean;
  created_at: string;
}

const ModeratorQueue = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<Record<string, PendingAnswer[]>>({});
  const [loadingAnswers, setLoadingAnswers] = useState<Record<string, boolean>>({});

  // Check if user has QAModerator role
  const isModerator = user?.role?.includes("QA_moderator") || user?.role === "QAModerator";

  // Fetch moderation queue
  const fetchModerationQueue = async () => {
    setLoading(true);
    try {
      const questions = await api.getModerationQueue();
      setPendingQuestions(questions);
    } catch (error) {
      console.error("Failed to fetch moderation queue", error);
      toast.error(t("failed_to_load_moderation_queue"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending answers for a specific question
  const fetchPendingAnswers = async (questionId: string) => {
    setLoadingAnswers(prev => ({ ...prev, [questionId]: true }));
    try {
      const answers = await api.getPendingAnswers(questionId);
      setPendingAnswers(prev => ({ ...prev, [questionId]: answers }));
    } catch (error) {
      console.error("Failed to fetch pending answers", error);
    } finally {
      setLoadingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };

  useEffect(() => {
    if (isModerator) {
      fetchModerationQueue();
    }
  }, [isModerator]);

  // Handle expand/collapse question
  const handleExpandQuestion = async (questionId: string) => {
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(questionId);
      if (!pendingAnswers[questionId]) {
        await fetchPendingAnswers(questionId);
      }
    }
  };

  // Approve question
  const handleApproveQuestion = async (questionId: string) => {
    try {
      await api.approveQuestion(questionId);
      toast.success(t("question_approved"));
      setPendingQuestions((prev) => prev.filter((q) => q.id !== questionId));
      if (expandedQuestionId === questionId) {
        setExpandedQuestionId(null);
      }
    } catch (error) {
      console.error("Failed to approve question", error);
      toast.error(t("failed_to_approve_question"));
    }
  };

  // REJECT/DELETE question
  const handleRejectQuestion = async (questionId: string) => {
    if (!window.confirm(t("confirm_reject_question"))) return;
    try {
      await api.rejectQuestion(questionId);
      toast.success(t("question_rejected"));
      setPendingQuestions((prev) => prev.filter((q) => q.id !== questionId));
      if (expandedQuestionId === questionId) {
        setExpandedQuestionId(null);
      }
    } catch (error) {
      console.error("Failed to reject question", error);
      toast.error(t("failed_to_reject_question"));
    }
  };

  // Approve answer
  const handleApproveAnswer = async (answerId: number, questionId: string) => {
    try {
      await api.approveAnswer(answerId);
      toast.success(t("answer_approved"));
      setPendingAnswers(prev => ({
        ...prev,
        [questionId]: (prev[questionId] || []).filter(a => a.id !== answerId)
      }));
    } catch (error) {
      console.error("Failed to approve answer", error);
      toast.error(t("failed_to_approve_answer"));
    }
  };

  // REJECT/DELETE answer
  const handleRejectAnswer = async (answerId: number, questionId: string) => {
    if (!window.confirm(t("confirm_reject_answer"))) return;
    try {
      await api.rejectAnswer(answerId);
      toast.success(t("answer_rejected"));
      setPendingAnswers(prev => ({
        ...prev,
        [questionId]: (prev[questionId] || []).filter(a => a.id !== answerId)
      }));
    } catch (error) {
      console.error("Failed to reject answer", error);
      toast.error(t("failed_to_reject_answer"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "academic":
        return "bg-blue-100 text-blue-700";
      case "spiritual":
        return "bg-purple-100 text-purple-700";
      case "family":
        return "bg-green-100 text-green-700";
      case "personal":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!isModerator && !loading) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <CheckCircleIcon className="h-12 w-12 mx-auto text-red-500 mb-3" />
          <p className="text-foreground font-medium">{t("access_denied")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("moderator_access_only")}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("moderation_queue")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("moderation_queue_description")}
            </p>
          </div>
          <button
            onClick={fetchModerationQueue}
            className="btn-outline text-sm px-3 py-2 flex items-center gap-2"
            title={t("refresh")}
          >
            <ArrowPathIcon className="h-4 w-4" />
            {t("refresh")}
          </button>
        </div>
      </motion.div>

      {/* Stats Card */}
      <div className="mb-6">
        <div className="card p-4 text-center bg-primary/5 border-primary/20">
          <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingQuestions.length}</p>
          <p className="text-sm text-muted-foreground">{t("pending_questions")}</p>
        </div>
      </div>

      {/* Pending Questions List */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-foreground">{t("questions_awaiting_approval")}</h2>
        
        {pendingQuestions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("no_pending_questions")}</p>
          </div>
        ) : (
          pendingQuestions.map((question) => (
            <div key={question.id} className="card">
              <div className="flex flex-col gap-3">
                {/* Question Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-lg ${getCategoryColor(
                        question.category
                      )}`}
                    >
                      {question.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {question.display_name} • {formatDate(question.created_at)}
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      {t("pending")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveQuestion(question.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition"
                      title={t("approve")}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      {t("approve")}
                    </button>
                    <button
                      onClick={() => handleRejectQuestion(question.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition"
                      title={t("reject")}
                    >
                      <TrashIcon className="h-4 w-4" />
                      {t("reject")}
                    </button>
                    <button
                      onClick={() => handleExpandQuestion(question.id)}
                      className="btn-outline text-sm px-3 py-1.5 flex items-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      {expandedQuestionId === question.id ? t("show_less") : t("show_details")}
                    </button>
                  </div>
                </div>
                
                {/* Question Body */}
                <p className="text-foreground">{question.question_body}</p>
                
                {/* Expanded Section - Pending Answers */}
                {expandedQuestionId === question.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      {t("pending_answers_for_this_question")}
                    </h4>
                    
                    {loadingAnswers[question.id] ? (
                      <div className="flex justify-center py-4">
                        <Spinner size="h-5 w-5" />
                      </div>
                    ) : (pendingAnswers[question.id] || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t("no_pending_answers_for_this_question")}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {(pendingAnswers[question.id] || []).map((answer) => (
                          <div key={answer.id} className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">
                                {answer.display_name} • {formatDate(answer.created_at)}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveAnswer(answer.id, question.id)}
                                  className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                                  title={t("approve")}
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                  {t("approve")}
                                </button>
                                <button
                                  onClick={() => handleRejectAnswer(answer.id, question.id)}
                                  className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                                  title={t("reject")}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  {t("reject")}
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-foreground">{answer.answer_body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default ModeratorQueue;