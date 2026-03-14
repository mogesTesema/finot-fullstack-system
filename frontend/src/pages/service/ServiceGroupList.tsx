import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ServiceGroup } from "../../types";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const getGroupKey = (groupName: string) => {
  const mapping: Record<string, string> = {
    "ትምህርት ክፍል": "group_teaching_name",
    "አባላት እና እንክብካቤ ክፍል": "group_membership_name",
    "ልማት ክፍል": "group_development_name",
    "መዝሙር ክፍል": "group_choir_name",
    "ሙያ እና ተራድኦ": "group_professional_name",
    "ቁዋንቁዋና ልዩ ልዩ ክፍል": "group_language_name",
    "ሂሳብ ክፍል": "group_finance_name",
    "ኦዲት ክፍል": "group_audit_name",
    "ባች እና መርሃግብር": "group_batch_name",
    "መረጃ እና ክትትል ክፍል": "group_media_name",
  };
  return mapping[groupName];
};

const getGroupImage = (groupName: string) => {
  const groupKey = getGroupKey(groupName);
  const images: Record<string, string> = {
    "group_teaching_name": "/images/service-groups/t7.jpg",
    "group_membership_name": "/images/service-groups/a1.jpg",
    "group_development_name": "/images/service-groups/l4.jpg",
    "group_choir_name": "/images/service-groups/m4.jpg",
    "group_professional_name": "/images/service-groups/my3.jpg",
    "group_language_name": "/images/service-groups/k1.jpg",
    "group_finance_name": "/images/service-groups/group2.jpg",
    "group_audit_name": "/images/service-groups/group2.jpg",
    "group_batch_name": "/images/service-groups/b1.jpg",
    "group_media_name": "/images/service-groups/group2.jpg",
  };
  return images[groupKey || ""] || "/images/service-groups/group1.jpg";
};

import { useTranslation } from "react-i18next";
const ServiceGroupList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsData = await api.getServiceGroups();
        setGroups(groupsData || []);
        if (user) {
          const selections = await api.getUserSelection();
          if (selections && selections.length > 0) setHasSubmitted(true);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("service_groups")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("choose_group_learn_more")}</p>
        </div>
        {!hasSubmitted ? (
          <button onClick={() => navigate("/dashboard/service/select")} className="btn-primary text-sm">
            {t("select_preferences")}
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl text-sm font-medium">
            <CheckCircleIcon className="h-4 w-4" />
            {t("preferences_submitted")}
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t("no_service_groups")}</p>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <motion.div
              key={group.id}
              variants={fadeIn}
              whileHover={{ y: -4 }}
              className="card cursor-pointer hover:shadow-elevated transition-all overflow-hidden p-0"
              onClick={() => navigate(`/dashboard/service/${group.id}`)}
            >
              <div className="w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={getGroupImage(group.name)}
                  alt={group.name}
                  className="w-full h-full object-cover"
                  onError={(e: any) => { e.target.src = "/images/service-groups/group1.jpg"; }}
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {getGroupKey(group.name) ? t(getGroupKey(group.name)) : group.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {group.description || t("learn_more_group")}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ServiceGroupList;
