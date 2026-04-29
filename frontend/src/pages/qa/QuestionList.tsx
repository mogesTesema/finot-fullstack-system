import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";
import FilterBar from "../../components/ui/FilterBar";

import { api } from "../../lib/api";
import { BACKEND_PAGE_SIZE } from "../../lib/api.real";
import { useAuth } from "../../context/AuthContext";
import { Question, Answer } from "../../types";

const LONG_ANSWER_LIMIT = 230;

// Fixed category list — matches the backend model's category choices
const ALL_CATEGORIES = ["Spiritual", "Academic", "Family", "Personal", "Other"];

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Private Question type (for JSON Server)
interface PrivateQuestion {
  id: string;
  student_id: number;
  category: string;  // ADD THIS
  question_body: string;
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

const QuestionList = ({ isDashboard = false }: { isDashboard?: boolean }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Public questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editedQuestionBody, setEditedQuestionBody] = useState("");
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<{ question: Question; answer: Answer } | null>(null);

  // Private questions state
  const [privateQuestions, setPrivateQuestions] = useState<PrivateQuestion[]>([]);
  const [privateAnswers, setPrivateAnswers] = useState<Record<string, PrivateAnswer[]>>({});
  const [loadingPrivate, setLoadingPrivate] = useState(false);
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");
  const [privateCategoryFilter, setPrivateCategoryFilter] = useState("all");

  const isAdmin = user?.role === "service_admin";
  const isLoggedIn = !!user;

  const isInitialMount = useRef(true);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);

  // Fetch public questions from server
  const fetchQuestions = useCallback(async (showSpinner: boolean = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await api.getQuestionsPaginated(
        currentPage,
        debouncedSearch || undefined,
        categoryFilter === "all" ? undefined : categoryFilter
      );
      setQuestions(data.results);
      setTotalCount(data.count);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404 && currentPage > 1) {
        setCurrentPage(1);
        return;
      }
      console.error("Failed to fetch questions", error);
      toast.error(t("failed_load_questions"));
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [currentPage, debouncedSearch, categoryFilter, t]);

  // Fetch private questions from JSON Server
  const fetchPrivateQuestions = useCallback(async () => {
    if (!user?.id) return;
    setLoadingPrivate(true);
    try {
      const userPrivateQuestions = await api.getMyPrivateQuestions();
      setPrivateQuestions(userPrivateQuestions);
      
      // Fetch answers for each private question
      const answersMap: Record<string, PrivateAnswer[]> = {};
      for (const q of userPrivateQuestions) {
        const answers = await api.getPrivateAnswers(q.id);
        answersMap[q.id] = answers;
      }
      setPrivateAnswers(answersMap);
    } catch (error) {
      console.error("Failed to fetch private questions", error);
    } finally {
      setLoadingPrivate(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchQuestions(true);
  }, [fetchQuestions]);

  useEffect(() => {
    if (activeTab === "private" && user?.id) {
      fetchPrivateQuestions();
    }
  }, [activeTab, user?.id, fetchPrivateQuestions]);

  const submitAnswer = async (questionId: string) => {
    const answer = answerText[questionId];
    if (!answer?.trim()) return;
    try {
      await api.postAnswer({ 
        question: questionId, 
        display_name: user?.full_name || "Anonymous", 
        answer_body: answer 
      });
      toast.success(t("answer_posted_success"));
      await fetchQuestions(false);
      setAnswerText((prev) => ({ ...prev, [questionId]: "" }));
    } catch (error) { 
      console.error("Failed to post answer", error); 
      toast.error(t("failed_post_answer")); 
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!window.confirm(t("delete_question_confirm"))) return;
    try { 
      await api.deleteQuestion(questionId); 
      toast.success(t("question_deleted")); 
      await fetchQuestions(false); 
    } catch (error) { 
      console.error("Failed to delete question", error); 
      toast.error(t("failed_delete_question")); 
    }
  };

  const deleteAnswer = async (answerId: number) => {
    if (!window.confirm(t("delete_answer_confirm"))) return;
    try { 
      await api.deleteAnswer(answerId); 
      toast.success(t("answer_deleted")); 
      await fetchQuestions(false); 
    } catch (error) { 
      console.error("Failed to delete answer", error); 
      toast.error(t("failed_delete_answer")); 
    }
  };

  const updateQuestion = async (questionId: string, newBody: string) => {
    try {
      await api.updateQuestion(questionId, { question_body: newBody });
      toast.success(t("question_updated"));
      await fetchQuestions(false);
      setEditingQuestion(null);
    } catch (error) { 
      console.error("Failed to update question", error); 
      toast.error(t("failed_update_question")); 
    }
  };

  const canModify = (itemUserId?: number | null) => {
    if (!itemUserId) return false;
    return isAdmin || (isLoggedIn && user?.id === itemUserId);
  };

  const totalPages = Math.ceil(totalCount / BACKEND_PAGE_SIZE);

  const getApprovedAnswers = (q: Question) => (q.answers || []).filter((a) => a.is_approved ?? true);
  const previewAnswer = (text: string) => text.length > LONG_ANSWER_LIMIT ? `${text.slice(0, LONG_ANSWER_LIMIT)}...` : text;

  const askRoute = isDashboard ? "/dashboard/questions/ask" : "/anonymous/ask";
  const backRoute = isDashboard ? "/dashboard" : "/anonymous";

  // Render Private Questions List
  const renderPrivateQuestions = () => {
    if (loadingPrivate) {
      return (
        <div className="flex justify-center py-12">
          <Spinner size="h-8 w-8" />
        </div>
      );
    }

    if (privateQuestions.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          {t("no_private_questions")}
        </div>
      );
    }

    // Filter questions by category
    const filteredQuestions = privateCategoryFilter === "all" 
      ? privateQuestions 
      : privateQuestions.filter((q) => q.category === privateCategoryFilter);
    
    if (filteredQuestions.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          {privateCategoryFilter !== "all" 
            ? t("no_private_questions_match_category")
            : t("no_private_questions")}
        </div>
      );
    }
    
    return filteredQuestions.map((q) => {
      const answers = privateAnswers[q.id] || [];
      const primaryAnswer = answers.find(a => a.is_primary);
      
      return (
        <div key={q.id} className="card border-l-4 border-l-primary">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-primary/10 text-primary flex items-center gap-1">
              <LockClosedIcon className="h-3 w-3" />
              {t("private")}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-accent/10 text-accent-foreground">
              {t(`cat_${q.category?.toLowerCase()}`) || q.category || t("general")}
            </span>
            <span className="text-xs text-muted-foreground">{t("you")} • {formatDate(q.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 self-start">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                {t("answers_count", { count: answers.length })}
              </span>
              {q.is_answered && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-lg">
                  {t("answered")}
                </span>
              )}
            </div>
          </div>

          <p className="text-foreground mt-3">{q.question_body}</p>

          {primaryAnswer && (
            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-primary">{t("answer")}</span>
              </div>
              <p className="text-sm text-foreground/80">{primaryAnswer.answer_body}</p>
            </div>
          )}

          {answers.filter(a => !a.is_primary).length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">{t("additional_comments")}</p>
              {answers.filter(a => !a.is_primary).map((a) => (
                <div key={a.id} className="p-2 bg-muted/30 rounded-lg">
                  <p className="text-xs text-foreground/70">{a.answer_body}</p>
                </div>
              ))}
            </div>
          )}

          {!q.is_answered && (
            <div className="mt-4 text-sm text-muted-foreground bg-amber-50 p-3 rounded-lg">
              {t("awaiting_answer")}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading && activeTab === "public") {
    return (
      <div className={`${isDashboard ? "" : "min-h-screen bg-background"} flex items-center justify-center py-20`}>
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className={isDashboard ? "" : "min-h-screen bg-background py-8 px-4"}>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
          {!isDashboard && (
            <Link to={backRoute} className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition">
              <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> {t("back")}
            </Link>
          )}
          {isDashboard && <div />}
          <Link to={askRoute} className="btn-primary text-sm inline-flex items-center gap-1.5 self-start sm:self-auto">
            <PlusCircleIcon className="h-4 w-4" /> {t("ask_question")}
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("public")}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${
              activeTab === "public"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <GlobeAltIcon className="h-4 w-4 inline mr-1.5" />
            {t("public_questions")}
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${
              activeTab === "private"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LockClosedIcon className="h-4 w-4 inline mr-1.5" />
            {t("my_private_questions")}
          </button>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-5">
          {activeTab === "public" ? (
            <>
              <h1 className="text-lg font-medium text-foreground">{t("community_questions")}</h1>

              <SearchBar value={searchTerm} onChange={(v) => setSearchTerm(v)} />
              <FilterBar categories={ALL_CATEGORIES} selected={categoryFilter} onChange={(v) => setCategoryFilter(v)} />

              {questions.length === 0 && !loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  {debouncedSearch || categoryFilter !== "all"
                    ? t("no_questions_match_filter", "No questions match your search or filter.")
                    : t("no_questions_yet", "No questions yet. Be the first to ask!")}
                </div>
              ) : (
                questions.map((q) => {
                  const answers = getApprovedAnswers(q);
                  return (
                    <div key={q.id} className="card">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-accent/10 text-accent-foreground">
                            {t(`cat_${q.category.toLowerCase()}`) || q.category}
                          </span>
                          <span className="text-xs text-muted-foreground">{q.display_name} • {formatDate(q.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 self-start">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">{t("answers_count", { count: answers.length })}</span>
                          {canModify(q.user) && (
                            <>
                              <button onClick={() => { setEditingQuestion(q.id); setEditedQuestionBody(q.question_body); }} className="text-muted-foreground hover:text-foreground">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteQuestion(q.id)} className="text-muted-foreground hover:text-destructive">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {editingQuestion === q.id ? (
                        <div className="mt-3 space-y-2">
                          <textarea value={editedQuestionBody} onChange={(e) => setEditedQuestionBody(e.target.value)} className="input" rows={3} />
                          <div className="flex gap-2">
                            <button onClick={() => updateQuestion(q.id, editedQuestionBody)} className="btn-primary text-sm px-3 py-1.5">{t("save")}</button>
                            <button onClick={() => setEditingQuestion(null)} className="btn-outline text-sm px-3 py-1.5">{t("cancel")}</button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-foreground mt-3">{q.question_body}</p>
                      )}

                      {answers.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {answers.map((a) => (
                            <div key={a.id} className="p-3 bg-muted/50 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">{a.display_name}</span>
                                {canModify(a.responder) && (
                                  <button onClick={() => deleteAnswer(a.id)} className="text-muted-foreground hover:text-destructive">
                                    <TrashIcon className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-foreground/80 mt-1">{previewAnswer(a.answer_body)}</p>
                              {a.answer_body.length > LONG_ANSWER_LIMIT && (
                                <button onClick={() => setSelectedAnswer({ question: q, answer: a })} className="mt-1.5 text-primary text-xs flex items-center gap-1 font-medium">
                                  <ArrowsPointingOutIcon className="h-3.5 w-3.5" /> {t("read_full_answer")}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4">
                        <textarea
                          value={answerText[q.id] || ""}
                          onChange={(e) => setAnswerText((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder={t("write_answer")}
                          rows={2}
                          className="input text-sm"
                        />
                        <button onClick={() => submitAnswer(q.id)} className="btn-primary text-sm mt-2 px-4 py-2">
                          {t("post_answer")}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
            ) : (
              <>
                <h1 className="text-lg font-medium text-foreground">{t("my_private_questions")}</h1>
                <p className="text-sm text-muted-foreground mb-4">{t("private_questions_description")}</p>
                
                {/* Category Filter for Private Questions */}
                <div className="mb-4">
                  <FilterBar 
                    categories={ALL_CATEGORIES} 
                    selected={privateCategoryFilter} 
                    onChange={(v) => setPrivateCategoryFilter(v)} 
                  />
                </div>
                
                {renderPrivateQuestions()}
              </>
          )}
        </motion.div>
      </div>

      {/* Full answer modal */}
      {selectedAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={() => setSelectedAnswer(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-muted-foreground mb-2">{t("answers_by", { name: selectedAnswer.answer.display_name })}</p>
            <p className="text-foreground leading-relaxed">{selectedAnswer.answer.answer_body}</p>
            <button onClick={() => setSelectedAnswer(null)} className="btn-outline mt-4 text-sm w-full">{t("close")}</button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuestionList;