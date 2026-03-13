import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, SectionHeader } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { useTranslation } from "react-i18next";
import { FiUser, FiMail, FiPhone, FiMapPin, FiHeart, FiEdit, FiMessageCircle, FiHome } from "react-icons/fi";

const DashboardProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
      </div>
    );
  }

  const { id, full_name, email, gender, profile } = user;

  const sections = [
    {
      title: t("personal_information"),
      icon: <FiUser className="h-5 w-5" />,
      items: [
        { label: t("full_name"), value: full_name, icon: <FiUser className="h-4 w-4" /> },
        { label: t("baptismal_name"), value: profile.baptismal_name, icon: <FiUser className="h-4 w-4" /> },
        { label: t("gender_label"), value: t(gender?.toLowerCase()), icon: <FiUser className="h-4 w-4" /> },
        { label: t("department_label"), value: profile.department, icon: <FiUser className="h-4 w-4" /> },
        { label: t("batch_year"), value: profile.batch, icon: <FiUser className="h-4 w-4" /> },
        { label: t("status"), value: profile.status, icon: <FiUser className="h-4 w-4" />, badge: true },
      ],
    },
    {
      title: t("contact_information"),
      icon: <FiMail className="h-5 w-5" />,
      items: [
        { label: t("email"), value: email, icon: <FiMail className="h-4 w-4" /> },
        { label: t("phone"), value: profile.personal_phone, icon: <FiPhone className="h-4 w-4" /> },
        { label: t("telegram"), value: profile.telegram, icon: <FiMessageCircle className="h-4 w-4" /> },
        { label: t("home_address"), value: profile.home_address, icon: <FiMapPin className="h-4 w-4" /> },
      ],
    },
    {
      title: t("campus_information"),
      icon: <FiMapPin className="h-5 w-5" />,
      items: [
        { label: t("dorm_block_room"), value: profile.dorm_block_room, icon: <FiMapPin className="h-4 w-4" /> },
        { label: t("assigned_group"), value: profile.assignedGroup, icon: <FiUser className="h-4 w-4" /> },
      ],
    },
    {
      title: t("spiritual_information"),
      icon: <FiHome className="h-5 w-5" />,
      items: [
        { label: t("confession_father"), value: profile.confession_father, icon: <FiHome className="h-4 w-4" /> },
        { label: t("previous_church"), value: profile.previous_church, icon: <FiHome className="h-4 w-4" /> },
        { label: t("activities_serving"), value: profile.activity_serving, icon: <FiHeart className="h-4 w-4" /> },
      ],
    },
    {
      title: t("emergency_contact"),
      icon: <FiPhone className="h-5 w-5" />,
      items: [
        { label: t("emergency_name"), value: profile.emergency_name, icon: <FiUser className="h-4 w-4" /> },
        { label: t("phone"), value: profile.emergency_phone, icon: <FiPhone className="h-4 w-4" /> },
        { label: t("relationship"), value: profile.emergency_relation, icon: <FiHeart className="h-4 w-4" /> },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title={t("my_profile")} description={t("manage_personal_info")}
        action={
          <Link to="/dashboard/profile/edit" className="btn-primary inline-flex items-center gap-2 text-sm">
            <FiEdit className="h-4 w-4" /> {t("edit_profile")}
          </Link>
        }
      />

      <Card className="border-l-4 border-l-primary">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <Avatar src={profile.profile_image} alt={full_name} size="xl" className="h-24 w-24" />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">{full_name}</h2>
            <p className="mt-1 text-muted-foreground">{profile.department} {profile.batch && `• ${profile.batch}`}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              <Badge variant="primary">{t("student_id")}: {id}</Badge>
              {profile.status === "active" ? <Badge variant="success">{t("active")}</Badge> : <Badge variant="warning">{t("graduated")}</Badge>}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <div className="mb-4 flex items-center gap-2">
              <div className="text-primary">{section.icon}</div>
              <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-0.5 text-muted-foreground">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    {item.badge ? (
                      <Badge variant={item.value === "active" ? "success" : "default"} size="md" className="mt-1">{t(item.value?.toLowerCase()) || "—"}</Badge>
                    ) : (
                      <p className="mt-0.5 text-foreground">{item.value || "—"}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardProfile;
