import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ServiceGroupList from "./ServiceGroupList";
import FamilyPage from "./FamilyPage";
import AttendancePage from "./AttendancePage";

const tabs = [
  { id: "groups", label: "Service Groups", component: ServiceGroupList },
  { id: "family", label: "My Family", component: FamilyPage },
  { id: "attendance", label: "Attendance", component: AttendancePage },
];

const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState("groups");
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-yellow-400">Services</h1>
        </div>


        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === tab.id
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {ActiveComponent ? <ActiveComponent /> : null}
        </motion.div>
      </div>
    </div>
  );
};

export default ServicesPage;