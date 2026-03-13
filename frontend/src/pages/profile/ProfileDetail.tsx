import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const ProfileDetail = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
    </div>
  );

  const { id, full_name, email, gender, profile } = user;

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

  const groupKey = getGroupKey(profile.assignedGroup || "");
  const localizedGroup = groupKey ? t(groupKey) : (profile.assignedGroup || t("not_assigned"));

  const localizedStatus = profile.status === "active" ? t("in_campus") : profile.status === "graduated" ? t("graduated_status") : profile.status || "—";

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition">
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> {t("dashboard")}
          </Link>
          <Link to="/dashboard/profile/edit" className="btn-primary text-sm inline-flex items-center gap-1.5">
            <PencilIcon className="h-4 w-4" /> {t("edit_profile")}
          </Link>
        </div>

        {/* Profile Header */}
        <div className="card mb-6">
          <div className="flex items-center gap-5">
            <img
              src={profile.profile_image || "/images/default-avatar.jpg"}
              alt={full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-accent/30"
              onError={(e: any) => { e.target.src = "/images/default-avatar.jpg"; }}
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{full_name}</h1>
              <p className="text-muted-foreground">{profile.department} • {profile.batch}</p>
              <p className="text-xs text-muted-foreground mt-1">ID: {id}</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        {[
          { title: "personal_information", items: [
            { label: "full_name_label", value: full_name },
            { label: "baptismal_name", value: profile.baptismal_name },
            { label: "gender_label", value: gender === "Male" ? t("male") : gender === "Female" ? t("female") : gender },
            { label: "place_of_birth", value: profile.home_address },
            { label: "dorm_block_room", value: profile.dorm_block_room },
            { label: "confession_father", value: profile.confession_father },
          ]},
          { title: "contact_information", items: [
            { label: "phone", value: profile.personal_phone },
            { label: "email", value: email },
            { label: "telegram", value: profile.telegram },
            { label: "home_address", value: profile.home_address },
          ]},
          { title: "emergency_contact", items: [
            { label: "emergency_name", value: profile.emergency_name },
            { label: "phone", value: profile.emergency_phone },
            { label: "relationship", value: profile.emergency_relation },
          ]},
          { title: "church_experience", items: [
            { label: "previous_church", value: profile.previous_church },
            { label: "activities_serving", value: profile.activity_serving },
            { label: "assigned_group", value: localizedGroup },
            { label: "status", value: localizedStatus },
          ]},
        ].map((section) => (
          <div key={section.title} className="card mb-4">
            <h2 className="font-semibold text-foreground mb-4">{t(section.title)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t(item.label)}</p>
                  <p className="text-foreground mt-0.5">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileDetail;