import React from "react";
import { useTranslation } from "react-i18next";

function DashboardNotifications() {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t("notifications")}</h1>
      <p>{t("notifications_placeholder")}</p>
    </div>
  );
}

export default DashboardNotifications;
