import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const AnonymousIntro = () => {
  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back to Home */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <img src="/images/logo.png" alt="finot" className="h-12 w-12" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#142850] rounded-2xl shadow-xl p-8 text-center"
        >
          <ChatBubbleLeftRightIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">እማሆይ የልቤ</h1>
          <p className="text-gray-300 text-lg mb-6">
            A safe space to ask questions anonymously and get answers from the
            community. No judgment, just support.
          </p>
          <div className="bg-[#1B3067] rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">
              How it works
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>
                You can ask any question using a nickname – your identity stays
                hidden.
              </li>
              <li>
                Anyone can answer questions, also anonymously if they wish.
              </li>
              <li>
                Questions are grouped by categories: Academic, Spiritual,
                Family, Personal, Other.
              </li>
              <li>Be respectful – the community moderates itself.</li>
            </ul>
          </div>
          <Link
            to="/anonymous/questions"
            className="inline-block bg-yellow-400 text-[#1B3067] px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition transform hover:scale-105"
          >
            Join the Conversation
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AnonymousIntro;
