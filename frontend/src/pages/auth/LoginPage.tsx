
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter both email and password.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      const { user } = response;

      // All users go to dashboard (you can later differentiate by role)
      navigate("/dashboard");
    } catch (error) {
      if (error.message.includes("Incorrect Email or Password")) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          html: `Incorrect Email or Password. <br/><br/>If you don't have an account, please <a href="/register" style="color: #fbbf24; text-decoration: underline;">register here</a>.`,
          confirmButtonColor: "#fbbf24",
          background: "#142850",
          color: "#fff",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.message || "Invalid email or password.",
          confirmButtonColor: "#fbbf24",
          background: "#142850",
          color: "#fff",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
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
          className="bg-[#142850] rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-center text-yellow-400 mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Sign in to your finot account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-yellow-400"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="text-yellow-400 hover:text-yellow-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="text-sm">
                <Link
                  to="/register"
                  className="text-yellow-400 hover:text-yellow-300 transition"
                >
                  Create account
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-[#1B3067] py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;