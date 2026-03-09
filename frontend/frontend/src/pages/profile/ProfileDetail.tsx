// src/pages/profile/ProfileDetail.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";

const ProfileDetail = () => {
  const { user } = useAuth();

  if (!user) return <div className="p-8 text-white">Loading...</div>;

  const { id, full_name, email, gender, profile } = user;

  return (
    <div className="min-h-screen bg-[#1B3067] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back to Dashboard & Edit Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-3 py-1 bg-[#1B3067] rounded-lg text-yellow-400 hover:bg-[#142850] transition border border-yellow-400/30"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 text-yellow-400" />
            <span className="font-semibold">Back to Dashboard</span>
            <span className="ml-1 text-yellow-400 sm:hidden">←</span>
          </Link>
          <Link
            to="/profile/edit"
            className="inline-flex items-center bg-yellow-400 text-[#1B3067] px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Profile
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-[#142850] rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center space-x-6">
            <img
              src={profile.profile_image || "/images/default-avatar.jpg"}
              alt={full_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
              onError={(e) => (e.target.src = "/images/default-avatar.jpg")}
            />
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">
                {full_name}
              </h1>
              <p className="text-gray-300 text-lg">
                {profile.department} • {profile.batch}
              </p>
              <p className="text-gray-400 text-sm mt-1">ID: {id}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <Section title="Personal Information">
          <InfoGrid>
            <InfoItem label="Full Name" value={full_name} />
            <InfoItem label="Baptismal Name" value={profile.baptismal_name} />
            <InfoItem label="Gender" value={gender} />
            <InfoItem label="Place of Birth" value={profile.home_address} />
            <InfoItem label="Dorm/Room" value={profile.dorm_block_room} />
            <InfoItem
              label="Confession Father"
              value={profile.confession_father}
            />
          </InfoGrid>
        </Section>

        {/* Contact Information */}
        <Section title="Contact">
          <InfoGrid>
            <InfoItem label="Phone" value={profile.personal_phone} />
            <InfoItem label="Email" value={email} />
            <InfoItem label="Telegram" value={profile.telegram} />
            <InfoItem label="Home Address" value={profile.home_address} />
          </InfoGrid>
        </Section>

        {/* Emergency Contact */}
        <Section title="Emergency Contact">
          <InfoGrid>
            <InfoItem label="Name" value={profile.emergency_name} />
            <InfoItem label="Phone" value={profile.emergency_phone} />
            <InfoItem label="Relationship" value={profile.emergency_relation} />
          </InfoGrid>
        </Section>

        {/* Church Experience */}
        <Section title="Church Experience">
          <InfoGrid>
            <InfoItem label="Previous Church" value={profile.previous_church} />
            <InfoItem label="Activities" value={profile.activity_serving} />
            <InfoItem label="Assigned Group" value={profile.assignedGroup} />
            <InfoItem label="Status" value={profile.status} />
          </InfoGrid>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-[#142850] rounded-2xl shadow-xl p-6 mb-6">
    <h2 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h2>
    {children}
  </div>
);

const InfoGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-white font-medium">{value || "—"}</p>
  </div>
);

export default ProfileDetail;
