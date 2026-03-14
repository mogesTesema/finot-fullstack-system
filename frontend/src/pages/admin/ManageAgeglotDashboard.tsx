import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserGroupIcon, CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import GroupEventsManager from "./components/GroupEventsManager";
import GroupAttendanceManager from "./components/GroupAttendanceManager";

export default function ManageAgeglotDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"events" | "attendance">("events");
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Find which group this admin manages
        const adminGroup = await api.getMyManagedGroup();
        setGroup(adminGroup);
      } catch (error) {
        console.error("Failed to fetch group data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchGroupData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
        <span className="ml-3 text-sm text-muted-foreground">{t("loading")}...</span>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <UserGroupIcon className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">{t("no_group_assigned")}</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          {t("no_group_assigned_msg")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("manage_group", { name: group.name })}</h1>
          <p className="text-muted-foreground">{group.description}</p>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-2 rounded-xl bg-card p-1 shadow-sm border border-border">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "events"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{t("events")}</span>
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "attendance"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <UsersIcon className="h-4 w-4" />
            <span>{t("attendance")}</span>
          </button>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-[500px]"
      >
        {activeTab === "events" ? (
          <GroupEventsManager groupId={group.id} />
        ) : (
          <GroupAttendanceManager groupId={group.id} />
        )}
      </motion.div>
    </div>
  );
}
