import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/navigation/Sidebar";
import QuestionList from "../qa/QuestionList";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const DashboardQA = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return <div className="p-8 text-white">{t("loading")}...</div>;

  return (
    <div className="flex min-h-screen bg-[#1B3067]">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 p-6 overflow-auto pt-20">
        <div className="max-w-5xl mx-auto">
          {/* Back to Dashboard */}
          <div className="mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              {t("back_to_dashboard")}
            </Link>
          </div>

          <div className="bg-[#142850] rounded-2xl shadow-xl p-6 min-h-[80vh]">
             {/* Reuse the list component, passing a prop context if needed */}
             <QuestionList isDashboard={true} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardQA;
