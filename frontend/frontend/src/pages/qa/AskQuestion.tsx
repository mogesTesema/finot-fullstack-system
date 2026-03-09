import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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
  const { user } = useAuth(); // may be null if outsider
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !question) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select a category and enter your question.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const questionData = {
        user_id: user?.userId || null, // null for outsiders
        display_name: nickname.trim() || "Anonymous",
        category,
        question_body: question,
      };
      await api.postQuestion(questionData);

      Swal.fire({
        icon: "success",
        title: "Question Posted",
        text: "Your question has been submitted anonymously.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });

      navigate("/anonymous/questions");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.message || "Something went wrong.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/anonymous/questions"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Questions
          </Link>
          <img src="/images/logo.png" alt="finot" className="h-12 w-12" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-yellow-400 mb-6">
            Ask a Question
          </h1>
          <p className="text-gray-300 mb-6">
            Your identity will remain anonymous. You can use a nickname if you
            like.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname (optional) */}
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Nickname (optional)
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., SilentSeeker"
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Question */}
            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Your Question *
              </label>
              <textarea
                id="question"
                rows="5"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-[#1B3067] py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post Question"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AskQuestion;
