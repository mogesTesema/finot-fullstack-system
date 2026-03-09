import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";

const ProfileDetail = () => {
  const { user } = useAuth();

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
    </div>
  );

  const { id, full_name, email, gender, profile } = user;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-primary hover:text-primary-light font-medium text-sm transition">
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" /> Dashboard
          </Link>
          <Link to="/profile/edit" className="btn-primary text-sm inline-flex items-center gap-1.5">
            <PencilIcon className="h-4 w-4" /> Edit Profile
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
          { title: "Personal Information", items: [
            { label: "Full Name", value: full_name },
            { label: "Baptismal Name", value: profile.baptismal_name },
            { label: "Gender", value: gender },
            { label: "Place of Birth", value: profile.home_address },
            { label: "Dorm/Room", value: profile.dorm_block_room },
            { label: "Confession Father", value: profile.confession_father },
          ]},
          { title: "Contact", items: [
            { label: "Phone", value: profile.personal_phone },
            { label: "Email", value: email },
            { label: "Telegram", value: profile.telegram },
            { label: "Home Address", value: profile.home_address },
          ]},
          { title: "Emergency Contact", items: [
            { label: "Name", value: profile.emergency_name },
            { label: "Phone", value: profile.emergency_phone },
            { label: "Relationship", value: profile.emergency_relation },
          ]},
          { title: "Church Experience", items: [
            { label: "Previous Church", value: profile.previous_church },
            { label: "Activities", value: profile.activity_serving },
            { label: "Assigned Group", value: profile.assignedGroup },
            { label: "Status", value: profile.status },
          ]},
        ].map((section) => (
          <div key={section.title} className="card mb-4">
            <h2 className="font-semibold text-foreground mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{item.label}</p>
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