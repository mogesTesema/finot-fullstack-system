import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserGroupIcon, PhoneIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Family, FamilyMember } from "../../types";
import EmptyState from "../../components/ui/EmptyState";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FamilyPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const familyData = await api.getMyFamily();
        setFamily(familyData);
        if (familyData) {
          const membersData = await api.getFamilyMembers(familyData.id);
          setMembers(membersData);
        }
      } catch (error: any) {
        console.error("Failed to fetch family", error);
      } finally { setLoading(false); }
    };
    if (user) fetchFamily();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    );
  }

  if (!family) {
    return (
      <EmptyState
        icon={<UserGroupIcon className="h-10 w-10" />}
        title={t("no_family_assigned")}
        description={t("no_family_assigned_desc")}
      />
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      {/* Family Name */}
      <div className="card">
        <h2 className="text-xl font-bold text-foreground mb-5">{family.name}</h2>

        {/* Parents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {[
            { label: t("spiritual_father"), data: family.father },
            { label: t("spiritual_mother"), data: family.mother },
          ].map(({ label, data }) => (
            <div key={label} className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">{label}</p>
              <p className="font-semibold text-foreground text-lg">{data?.name || "—"}</p>
              {data?.profile && (
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {data.profile.department && <p>{data.profile.department} • {t("batch")} {data.profile.batch}</p>}
                  {data.profile.personal_phone && (
                    <p className="flex items-center gap-1.5">
                      <PhoneIcon className="h-3.5 w-3.5" /> {data.profile.personal_phone}
                    </p>
                  )}
                  {data.profile.telegram && (
                    <p className="flex items-center gap-1.5">
                      <ChatBubbleLeftIcon className="h-3.5 w-3.5" /> {data.profile.telegram}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {family.religious_father && (
          <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
            <p className="text-xs text-muted-foreground font-medium mb-1">{t("religious_father")}</p>
            <p className="font-medium text-foreground">{family.religious_father}</p>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="card">
        <h3 className="font-semibold text-foreground mb-4">
          {t("family_members")} ({members.length})
        </h3>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("no_family_members")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {member.name?.[0] || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.profile?.department || ""} {member.profile?.batch ? `• ${t("batch")} ${member.profile.batch}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FamilyPage;