import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ServiceGroupList from "./ServiceGroupList";
import FamilyPage from "./FamilyPage";
import AttendancePage from "./AttendancePage";

import { useTranslation } from "react-i18next";

const ServicesPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("groups");

  const tabs = [
    { id: "groups", label: t("tab_groups"), component: ServiceGroupList },
    { id: "family", label: t("tab_family"), component: FamilyPage },
    { id: "attendance", label: t("tab_attendance"), component: AttendancePage },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary hover:text-primary-light font-medium transition text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
            {t("back_to_dashboard")}
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t("services")}</h1>
        </div>

        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
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