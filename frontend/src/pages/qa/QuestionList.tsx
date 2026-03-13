import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";
import FilterBar from "../../components/ui/FilterBar";

import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Question, Answer } from "../../types";

const LONG_ANSWER_LIMIT = 230;
const QUESTIONS_PER_PAGE = 5;

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const QuestionList = ({ isDashboard = false }: { isDashboard?: boolean }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editedQuestionBody, setEditedQuestionBody] = useState("");
  const [editingAnswer, setEditingAnswer] = useState<{ answerId: number; questionId: string } | null>(null);
  const [editedAnswerBody, setEditedAnswerBody] = useState("");
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<{ question: Question; answer: Answer } | null>(null);

  const isAdmin = user?.role === "service_admin";
  const isLoggedIn = !!user;

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    try { const data = await api.getQuestions(); setQuestions(data); }
    catch (error) { console.error("Failed to fetch questions", error); toast.error(t("failed_load_questions")); }
    finally { setLoading(false); }
  };

  const submitAnswer = async (questionId: string) => {
    const answer = answerText[questionId];
    if (!answer?.trim()) return;
    try {
      await api.postAnswer({ question: questionId, display_name: user?.full_name || "Anonymous", answer_body: answer });
      toast.success(t("answer_posted_success"));
      await fetchQuestions();
      setAnswerText((prev) => ({ ...prev, [questionId]: "" }));
    } catch (error) { console.error("Failed to post answer", error); toast.error(t("failed_post_answer")); }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!window.confirm(t("delete_question_confirm"))) return;
    try { await api.deleteQuestion(questionId); toast.success(t("question_deleted")); await fetchQuestions(); }
    catch (error) { console.error("Failed to delete question", error); toast.error(t("failed_delete_question")); }
  };

  const deleteAnswer = async (answerId: number) => {
    if (!window.confirm(t("delete_answer_confirm"))) return;
    try { await api.deleteAnswer(answerId); toast.success(t("answer_deleted")); await fetchQuestions(); }
    catch (error) { console.error("Failed to delete answer", error); toast.error(t("failed_delete_answer")); }
  };

  const canModify = (itemUserId?: number | null) => {
    if (!itemUserId) return false;
    return isAdmin || (isLoggedIn && user?.id === itemUserId);
  };

  const visibleQuestions = questions.filter((q) => q.is_approved ?? true);
  const categories = [...new Set(visibleQuestions.map((q) => q.category).filter(Boolean))];

  const filteredQuestions = visibleQuestions.filter((q) => {
    const matchesSearch = q.question_body.toLowerCase().includes(searchTerm.toLowerCase()) || q.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE);

  const getApprovedAnswers = (q: Question) => (q.answers || []).filter((a) => a.is_approved ?? true);
  const previewAnswer = (text: string) => text.length > LONG_ANSWER_LIMIT ? `${text.slice(0, LONG_ANSWER_LIMIT)}...` : text;

  // Determine the correct Ask Question route & back route
  const askRoute = isDashboard ? "/dashboard/questions/ask" : "/anonymous/ask";
  const backRoute = isDashboard ? "/dashboard" : "/anonymous";

  if (loading) {
    return (
      <div className={`${isDashboard ? "" : "min-h-screen bg-background"} flex items-center justify-center py-20`}>
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className={isDashboard ? "" : "min-h-screen bg-background py-8 px-4"}>
      <div className="max-w-3xl mx-auto">
        {/* Header with Ask Question button */}
        <div className="flex justify-between items-center mb-6">
          {!isDashboard && (
            <Link to={backRoute} className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition">
              <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> {t("back")}
            </Link>
          )}
          {isDashboard && <div />}
          <Link to={askRoute} className="btn-primary text-sm inline-flex items-center gap-1.5">
            <PlusCircleIcon className="h-4 w-4" /> {t("ask_question")}
          </Link>
        </div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-5">
          <h1 className="text-2xl font-bold text-foreground">{t("community_questions")}</h1>

          <SearchBar value={searchTerm} onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }} />
          <FilterBar categories={categories} selected={categoryFilter} onChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }} />

          {paginatedQuestions.map((q) => {
            const answers = getApprovedAnswers(q);
            return (
              <div key={q.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-accent/10 text-accent-foreground">
                      {t(`cat_${q.category.toLowerCase()}`) || q.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{q.display_name} • {formatDate(q.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                      <button onClick={async () => {
                        try {
                          await api.updateQuestion(q.id, { question_body: editedQuestionBody });
                          toast.success(t("question_updated"));
                          await fetchQuestions();
                          setEditingQuestion(null);
                        } catch { toast.error(t("failed_update_question")); }
                      }} className="btn-primary text-sm px-3 py-1.5">{t("save")}</button>
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
          })}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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