import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, SectionHeader } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { FiUser, FiMail, FiPhone, FiMapPin, FiHeart, FiEdit, FiMessageCircle, FiHome } from "react-icons/fi";

const DashboardProfile = () => {
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
      title: "Personal Information",
      icon: <FiUser className="h-5 w-5" />,
      items: [
        { label: "Full Name", value: full_name, icon: <FiUser className="h-4 w-4" /> },
        { label: "Baptismal Name", value: profile.baptismal_name, icon: <FiUser className="h-4 w-4" /> },
        { label: "Gender", value: gender, icon: <FiUser className="h-4 w-4" /> },
        { label: "Department", value: profile.department, icon: <FiUser className="h-4 w-4" /> },
        { label: "Batch Year", value: profile.batch, icon: <FiUser className="h-4 w-4" /> },
        { label: "Status", value: profile.status, icon: <FiUser className="h-4 w-4" />, badge: true },
      ],
    },
    {
      title: "Contact Information",
      icon: <FiMail className="h-5 w-5" />,
      items: [
        { label: "Email", value: email, icon: <FiMail className="h-4 w-4" /> },
        { label: "Phone", value: profile.personal_phone, icon: <FiPhone className="h-4 w-4" /> },
        { label: "Telegram", value: profile.telegram, icon: <FiMessageCircle className="h-4 w-4" /> },
        { label: "Home Address", value: profile.home_address, icon: <FiMapPin className="h-4 w-4" /> },
      ],
    },
    {
      title: "Campus Information",
      icon: <FiMapPin className="h-5 w-5" />,
      items: [
        { label: "Dorm/Room", value: profile.dorm_block_room, icon: <FiMapPin className="h-4 w-4" /> },
        { label: "Assigned Group", value: profile.assignedGroup, icon: <FiUser className="h-4 w-4" /> },
      ],
    },
    {
      title: "Spiritual Information",
      icon: <FiHome className="h-5 w-5" />,
      items: [
        { label: "Confession Father", value: profile.confession_father, icon: <FiHome className="h-4 w-4" /> },
        { label: "Previous Church", value: profile.previous_church, icon: <FiHome className="h-4 w-4" /> },
        { label: "Activities Serving", value: profile.activity_serving, icon: <FiHeart className="h-4 w-4" /> },
      ],
    },
    {
      title: "Emergency Contact",
      icon: <FiPhone className="h-5 w-5" />,
      items: [
        { label: "Name", value: profile.emergency_name, icon: <FiUser className="h-4 w-4" /> },
        { label: "Phone", value: profile.emergency_phone, icon: <FiPhone className="h-4 w-4" /> },
        { label: "Relationship", value: profile.emergency_relation, icon: <FiHeart className="h-4 w-4" /> },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="My Profile" description="View and manage your personal information"
        action={
          <Link to="/dashboard/profile/edit" className="btn-primary inline-flex items-center gap-2 text-sm">
            <FiEdit className="h-4 w-4" /> Edit Profile
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
              <Badge variant="primary">Student ID: {id}</Badge>
              {profile.status === "active" ? <Badge variant="success">Active</Badge> : <Badge variant="warning">Graduated</Badge>}
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
                      <Badge variant={item.value === "active" ? "success" : "default"} size="md" className="mt-1">{item.value || "—"}</Badge>
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
