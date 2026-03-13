import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { api } from "../../lib/api";
import { ServiceGroup } from "../../types";
import { Card } from "../../components/ui/Card";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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
    "group_teaching_name": "/images/service-groups/t1.jpg",
    "group_membership_name": "/images/service-groups/a1.jpg",
    "group_development_name": "/images/service-groups/l4.jpg",
    "group_choir_name": "/images/service-groups/m4.jpg",
    "group_professional_name": "/images/service-groups/my2.jpg",
    "group_language_name": "/images/service-groups/group1.jpg",
    "group_finance_name": "/images/service-groups/group2.jpg",
    "group_audit_name": "/images/service-groups/group3.jpg",
    "group_batch_name": "/images/service-groups/group4.jpg",
    "group_media_name": "/images/service-groups/group5.jpg",
  };
  return images[groupKey || ""] || "/images/service-groups/group1.jpg";
};

const ServiceGroupDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<ServiceGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getServiceGroupById(id).then(setGroup).catch((err: any) => setError(err?.message || t("group_not_found"))).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
        <span className="ml-3 text-sm text-muted-foreground">{t("loading")}...</span>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">{error || t("group_not_found")}</p>
        <Link to="/dashboard/service" className="btn-primary text-sm">{t("back_to_services")}</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/dashboard/service" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition">
        <FiArrowLeft className="h-4 w-4" /> {t("back_to_services")}
      </Link>

      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="md:w-1/3 relative">
              <div className="h-64 md:h-full overflow-hidden">
                <img
                  src={getGroupImage(group.name)}
                  alt={group.name}
                  className="w-full h-full object-cover"
                  onError={(e: any) => { e.target.src = "/images/service-groups/group1.jpg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            </div>

            {/* Details */}
            <div className="md:w-2/3 p-6 md:p-8">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {getGroupKey(group.name) ? t(getGroupKey(group.name)) : group.name}
              </h1>
              <p className="text-muted-foreground leading-relaxed">{group.description || t("learn_more_group")}</p>
              {group.admin_name && (
                <p className="text-sm text-muted-foreground mt-2 italic">{t("admin")}: {group.admin_name}</p>
              )}

              {/* Gallery placeholder */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">{t("gallery")}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-muted h-20 rounded-xl flex items-center justify-center text-muted-foreground text-sm">🖼️ {i}</div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">{t("videos")}</h2>
                <div className="bg-muted h-32 rounded-xl flex items-center justify-center text-muted-foreground">📹 {t("videos_coming_soon")}</div>
              </div>

              <div className="mt-8">
                <button onClick={() => navigate("/dashboard/service/select")} className="btn-primary">{t("select_this_group")}</button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ServiceGroupDetail;
