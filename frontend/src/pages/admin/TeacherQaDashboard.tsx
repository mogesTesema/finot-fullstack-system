import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  HeartIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import axios from "axios";

import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

// Types
interface PrivateQuestion {
  id: string;
  student_id: number;
  question_body: string;
  category: string;
  created_at: string;
  is_answered: boolean;
}

interface PrivateAnswer {
  id: string;
  question_id: string;
  teacher_id: number;
  teacher_name: string;
  answer_body: string;
  is_primary: boolean;
  parent_answer_id: string | null;
  created_at: string;
}

interface TeacherSpecialization {
  id: string;
  teacher_id: number;
  specialization: string;
}

interface AssignedQuestion {
  id: string;
  question_id: string;
  assigned_to_id: number;
  assigned_by_id: number;
  assigned_at: string;
  question: PrivateQuestion;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const TeacherQaDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // State
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState<PrivateQuestion[]>([]);
  const [assignedQuestions, setAssignedQuestions] = useState<AssignedQuestion[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<PrivateQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("unanswered");
  const [selectedQuestion, setSelectedQuestion] = useState<PrivateQuestion | null>(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch teacher's specializations
  const fetchSpecializations = useCallback(async () => {
    try {
      // Mock data - replace with real API call
      // const response = await api.getTeacherSpecializations(user?.id);
      // For now, use mock data based on user role
      if (user?.role === "teacher") {
        // Mock: Assume teacher has Academic specialization
        setSpecializations(["ACADEMIC"]);
      } else if (user?.role === "soul_teacher") {
        setSpecializations(["SOUL_TEACHER"]);
      } else if (user?.role === "psychotherapist") {
        setSpecializations(["PSYCHOTHERAPIST"]);
      }
    } catch (error) {
      console.error("Failed to fetch specializations", error);
    }
  }, [user?.role]);

  // Fetch unanswered questions based on specialization
  const fetchUnansweredQuestions = useCallback(async () => {
    try {
      const allUnanswered: PrivateQuestion[] = [];
      
      for (const spec of specializations) {
        let category = "";
        if (spec === "ACADEMIC") category = "Academic";
        if (spec === "SOUL_TEACHER") category = "Spiritual";
        
        if (category) {
          // Mock API call - replace with real
          // const response = await api.getUnansweredPrivateQuestions(category);
          // Mock data for now
          const mockQuestions: PrivateQuestion[] = [
            {
              id: "1",
              student_id: 101,
              question_body: "How can I balance my prayer life with exam preparation?",
              category: category,
              created_at: new Date().toISOString(),
              is_answered: false,
            },
            {
              id: "2",
              student_id: 102,
              question_body: "What does the Bible say about handling stress?",
              category: category,
              created_at: new Date(Date.now() - 86400000).toISOString(),
              is_answered: false,
            },
          ];
          allUnanswered.push(...mockQuestions);
        }
      }
      
      setUnansweredQuestions(allUnanswered);
    } catch (error) {
      console.error("Failed to fetch unanswered questions", error);
    }
  }, [specializations]);

  // Fetch assigned questions (for psychotherapist)
  const fetchAssignedQuestions = useCallback(async () => {
    if (!specializations.includes("PSYCHOTHERAPIST")) return;
    
    try {
      // Mock API call - replace with real
      // const response = await api.getAssignedPsychQuestions(user?.id);
      const mockAssigned: AssignedQuestion[] = [
        {
          id: "1",
          question_id: "3",
          assigned_to_id: user?.id || 1,
          assigned_by_id: 1,
          assigned_at: new Date().toISOString(),
          question: {
            id: "3",
            student_id: 103,
            question_body: "I'm feeling depressed and don't know who to talk to.",
            category: "Psychological",
            created_at: new Date().toISOString(),
            is_answered: false,
          },
        },
      ];
      setAssignedQuestions(mockAssigned);
    } catch (error) {
      console.error("Failed to fetch assigned questions", error);
    }
  }, [specializations, user?.id]);

  // Fetch answered questions
  const fetchAnsweredQuestions = useCallback(async () => {
    try {
      // Mock API call - replace with real
      // const response = await api.getTeacherAnsweredQuestions(user?.id);
      const mockAnswered: PrivateQuestion[] = [
        {
          id: "4",
          student_id: 104,
          question_body: "How do I find a spiritual mentor on campus?",
          category: "Spiritual",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          is_answered: true,
        },
      ];
      setAnsweredQuestions(mockAnswered);
    } catch (error) {
      console.error("Failed to fetch answered questions", error);
    }
  }, [user?.id]);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSpecializations();
      await fetchUnansweredQuestions();
      await fetchAssignedQuestions();
      await fetchAnsweredQuestions();
      setLoading(false);
    };
    loadData();
  }, [fetchSpecializations, fetchUnansweredQuestions, fetchAssignedQuestions, fetchAnsweredQuestions]);

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      toast.error(t("please_enter_answer"));
      return;
    }
    
    if (!selectedQuestion) return;
    
    setSubmitting(true);
    try {
      // Mock API call - replace with real
      // await api.postPrivateAnswer({
      //   question_id: selectedQuestion.id,
      //   answer_body: answerText,
      //   is_primary: true,
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(t("answer_submitted_successfully"));
      
      // Remove from unanswered and add to answered
      setUnansweredQuestions(prev => prev.filter(q => q.id !== selectedQuestion.id));
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

  // Get specialization icon
  const getSpecializationIcon = (spec: string) => {
    switch (spec) {
      case "ACADEMIC":
        return <AcademicCapIcon className="h-4 w-4" />;
      case "SOUL_TEACHER":
        return <HeartIcon className="h-4 w-4" />;
      case "PSYCHOTHERAPIST":
        return <UserGroupIcon className="h-4 w-4" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    }
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
          {t("teacher_qa_dashboard")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("answer_student_questions")}
        </p>
        
        {/* Specialization Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {specializations.map((spec) => (
            <span
              key={spec}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {getSpecializationIcon(spec)}
              {t(`specialization_${spec.toLowerCase()}`)}
            </span>
          ))}
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
          {t("unanswered")} ({unansweredQuestions.length + assignedQuestions.length})
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
            {/* Assigned Questions Section (for Psychotherapist) */}
            {assignedQuestions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-primary" />
                  {t("assigned_to_you")}
                </h2>
                <div className="space-y-3">
                  {assignedQuestions.map((aq) => (
                    <div
                      key={aq.id}
                      className="card border-l-4 border-l-primary hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-lg ${getCategoryColor(
                                aq.question.category
                              )}`}
                            >
                              {aq.question.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(aq.question.created_at)}
                            </span>
                          </div>
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            {t("assigned")}
                          </span>
                        </div>
                        <p className="text-foreground">{aq.question.question_body}</p>
                        <button
                          onClick={() => {
                            setSelectedQuestion(aq.question);
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
              </div>
            )}

            {/* Unanswered Questions */}
            {unansweredQuestions.length > 0 ? (
              <div>
                {assignedQuestions.length > 0 && (
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {t("other_questions")}
                  </h2>
                )}
                <div className="space-y-3">
                  {unansweredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="card hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
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
              </div>
            ) : assignedQuestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t("no_unanswered_questions")}</p>
              </div>
            ) : null}
          </>
        ) : (
          // Answered Questions
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

export default TeacherQaDashboard;