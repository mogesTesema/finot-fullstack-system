import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeftIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";
import SearchBar from "../../components/ui/SearchBar";
import FilterBar from "../../components/ui/FilterBar";

import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Question, Answer } from "../../types";

const LONG_ANSWER_LIMIT = 230;
const QUESTIONS_PER_PAGE = 5;

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const QuestionList = ({ isDashboard = false }: { isDashboard?: boolean }) => {
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editedQuestionBody, setEditedQuestionBody] = useState("");

  const [editingAnswer, setEditingAnswer] = useState<{
    answerId: number;
    questionId: string;
  } | null>(null);

  const [editedAnswerBody, setEditedAnswerBody] = useState("");

  const [answerText, setAnswerText] = useState<Record<string, string>>({});

  const [selectedAnswer, setSelectedAnswer] = useState<{
    question: Question;
    answer: Answer;
  } | null>(null);

  const isAdmin = user?.role === "super_admin";
  const isLoggedIn = !!user;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await api.getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswerText((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitAnswer = async (questionId: string) => {
    const answer = answerText[questionId];
    if (!answer?.trim()) return;

    try {
      await api.postAnswer({
        question: questionId,
        display_name: user?.full_name || "Anonymous",
        answer_body: answer,
      });

      await fetchQuestions();

      setAnswerText((prev) => ({
        ...prev,
        [questionId]: "",
      }));
    } catch (error) {
      console.error("Failed to post answer", error);
    }
  };

  const startEditQuestion = (question: Question) => {
    setEditingQuestion(question.id);
    setEditedQuestionBody(question.question_body);
  };

  const cancelEditQuestion = () => {
    setEditingQuestion(null);
    setEditedQuestionBody("");
  };

  const saveEditQuestion = async (questionId: string) => {
    if (!editedQuestionBody.trim()) return;

    try {
      await api.updateQuestion(questionId, {
        question_body: editedQuestionBody,
      });

      await fetchQuestions();
      cancelEditQuestion();
    } catch (error) {
      console.error("Failed to update question", error);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await api.deleteQuestion(questionId);
      await fetchQuestions();
    } catch (error) {
      console.error("Failed to delete question", error);
    }
  };

  const startEditAnswer = (answer: Answer, questionId: string) => {
    setEditingAnswer({
      answerId: answer.id,
      questionId,
    });

    setEditedAnswerBody(answer.answer_body);
  };

  const cancelEditAnswer = () => {
    setEditingAnswer(null);
    setEditedAnswerBody("");
  };

  const saveEditAnswer = async () => {
    if (!editingAnswer || !editedAnswerBody.trim()) return;

    try {
      await api.updateAnswer(editingAnswer.answerId, {
        answer_body: editedAnswerBody,
      });

      await fetchQuestions();
      cancelEditAnswer();
    } catch (error) {
      console.error("Failed to update answer", error);
    }
  };

  const deleteAnswer = async (answerId: number) => {
    if (!window.confirm("Delete this answer?")) return;

    try {
      await api.deleteAnswer(answerId);
      await fetchQuestions();
    } catch (error) {
      console.error("Failed to delete answer", error);
    }
  };

  const canModify = (itemUserId?: number | null) => {
    if (!itemUserId) return false;
    return isAdmin || (isLoggedIn && user?.id === itemUserId);
  };

  const visibleQuestions = questions.filter((q) => q.is_approved ?? true);

  const categories = [
    ...new Set(visibleQuestions.map((q) => q.category).filter(Boolean)),
  ];

  const filteredQuestions = visibleQuestions.filter((q) => {
    const matchesSearch =
      q.question_body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.display_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || q.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);

  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE
  );

  const getApprovedAnswers = (question: Question) =>
    (question.answers || []).filter((a) => a.is_approved ?? true);

  const previewAnswer = (text: string) =>
    text.length > LONG_ANSWER_LIMIT
      ? `${text.slice(0, LONG_ANSWER_LIMIT)}...`
      : text;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B3067]">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div
      className={`${
        isDashboard
          ? ""
          : "min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8"
      }`}
    >
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        {!isDashboard && (
          <div className="flex justify-between mb-8">
            <Link
              to="/anonymous"
              className="text-yellow-400 hover:text-yellow-300 flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </Link>

            <Link
              to="/anonymous/ask"
              className="bg-yellow-400 text-[#1B3067] px-4 py-2 rounded-lg flex items-center"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Ask Question
            </Link>
          </div>
        )}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold text-yellow-400">
            Community Questions
          </h1>

          {/* SEARCH */}

          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
          />

          {/* FILTER */}

          <FilterBar
            categories={categories}
            selected={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}
          />

          {paginatedQuestions.map((q) => {
            const answers = getApprovedAnswers(q);

            return (
              <div
                key={q.id}
                className="bg-[#142850] p-6 rounded-2xl border border-gray-700"
              >
                <div className="flex justify-between">

                  <div>
                    <span className="bg-yellow-400 text-[#1B3067] text-xs px-2 py-1 rounded">
                      {q.category}
                    </span>

                    <span className="ml-2 text-gray-400 text-sm">
                      {q.display_name} • {formatDate(q.created_at)}
                    </span>
                  </div>

                  <div className="flex gap-2">

                    <span className="text-xs text-gray-300 px-2 py-1 bg-[#1B3067] rounded">
                      {answers.length} answers
                    </span>

                    {canModify(q.user) && (
                      <>
                        <button
                          onClick={() => startEditQuestion(q)}
                          className="text-yellow-400"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="text-red-400"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-white text-lg mt-3">
                  {q.question_body}
                </p>

                {/* ANSWERS */}

                {answers.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {answers.map((a) => (
                      <div
                        key={a.id}
                        className="bg-[#1B3067] p-4 rounded-lg"
                      >
                        <span className="text-gray-400 text-sm">
                          {a.display_name}
                        </span>

                        <p className="text-gray-300 mt-2">
                          {previewAnswer(a.answer_body)}
                        </p>

                        {a.answer_body.length > LONG_ANSWER_LIMIT && (
                          <button
                            onClick={() =>
                              setSelectedAnswer({
                                question: q,
                                answer: a,
                              })
                            }
                            className="mt-2 text-yellow-400 text-sm flex items-center"
                          >
                            <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
                            Read full answer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ADD ANSWER */}

                <div className="mt-4">
                  <textarea
                    value={answerText[q.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(q.id, e.target.value)
                    }
                    placeholder="Write your answer..."
                    rows={2}
                    className="w-full bg-[#1B3067] border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />

                  <button
                    onClick={() => submitAnswer(q.id)}
                    className="mt-2 bg-yellow-400 text-[#1B3067] px-4 py-2 rounded-lg"
                  >
                    Post Answer
                  </button>
                </div>
              </div>
            );
          })}

          {/* PAGINATION */}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default QuestionList;