import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CalendarIcon } from "@heroicons/react/24/outline";
import GroupEventsManager from "../admin/components/GroupEventsManager";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const EventManagement = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <CalendarIcon className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t("manage_global_events")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("manage_global_events_description")}
        </p>
      </motion.div>

      <GroupEventsManager eventType="global" />
    </div>
  );
};

export default EventManagement;