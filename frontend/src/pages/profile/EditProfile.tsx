// src/pages/profile/EditProfile.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { api } from "../../lib/api";

type EditProfileFormData = {
  full_name: string;
  email: string;
  gender: string;
  baptismal_name: string;
  profile_image: File | null;
  batch: string;
  department: string;
  telegram: string;
  personal_phone: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relation: string;
  home_address: string;
  previous_church: string;
  activity_serving: string;
  dorm_block: string;
  dorm_room: string;
  confession_father: string;
  status: string;
};

const EditProfile = () => {
  const { user, setUser } = useAuth(); // setUser must be added to context
  const navigate = useNavigate();

  const normalizedGender =
    user?.gender === "Male"
      ? "M"
      : user?.gender === "Female"
        ? "F"
        : user?.gender || "";

  const normalizedStatus =
    user?.profile?.status === "active"
      ? "IN_CAMPUS"
      : user?.profile?.status === "graduated"
        ? "GRADUATED"
        : user?.profile?.status || "";

  const parsedBatch =
    user?.profile?.batch
      ? user.profile.batch.replace(/\s*Year\s*/i, "")
      : "";

  const parsedDormBlock =
    (user?.profile?.dorm_block_room
      ? user.profile.dorm_block_room.match(/Block\s*(\d+)/i)?.[1]
      : "");

  const parsedDormRoom =
    (user?.profile?.dorm_block_room
      ? user.profile.dorm_block_room.match(/Room\s*(\d+)/i)?.[1]
      : "");

  // Form state – mirrors the combined user + profile structure
  const [formData, setFormData] = useState<EditProfileFormData>({
    // User fields
    full_name: user?.full_name || "",
    email: user?.email || "",
    gender: normalizedGender,
  
    // Profile fields
    baptismal_name: user?.profile?.baptismal_name || "",
    profile_image: null,
  
    batch: parsedBatch,  // match select name
    department: user?.profile?.department || "",
    telegram: user?.profile?.telegram || "",
    personal_phone: user?.profile?.personal_phone || "",
  
    emergency_name: user?.profile?.emergency_name || "",
    emergency_phone: user?.profile?.emergency_phone || "",
    emergency_relation: user?.profile?.emergency_relation || "",
  
    home_address: user?.profile?.home_address || "",
    previous_church: user?.profile?.previous_church || "",
    activity_serving: user?.profile?.activity_serving || "",
  
    dorm_block: parsedDormBlock?.toString?.() || "",
    dorm_room: parsedDormRoom?.toString?.() || "",
  
    confession_father: user?.profile?.confession_father || "",
    status: normalizedStatus,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(
    user?.profile?.profile_image || "/images/default-avatar.jpg",
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profile_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for API to exactly match Django's StudentProfile expected fields
      const fd = new FormData();
      if (formData.baptismal_name) fd.append('baptismal_name', formData.baptismal_name);

      // If image was changed, the formData.profile_image will be a File instance
      if (formData.profile_image instanceof File) {
        fd.append('profile_image', formData.profile_image);
      }

      if (formData.batch) fd.append('batch_year', formData.batch);

      if (formData.department) fd.append('department', formData.department);
      if (formData.telegram) fd.append('telegram_username', formData.telegram);
      if (formData.personal_phone) fd.append('personal_phone', formData.personal_phone);
      if (formData.emergency_name) fd.append('emergency_name', formData.emergency_name);
      if (formData.emergency_phone) fd.append('emergency_phone', formData.emergency_phone);
      if (formData.emergency_relation) fd.append('emergency_relation', formData.emergency_relation);
      if (formData.home_address) fd.append('home_address', formData.home_address);
      if (formData.previous_church) fd.append('previous_church', formData.previous_church);
      if (formData.activity_serving) fd.append('activity_serving', formData.activity_serving);
      if (formData.dorm_block) fd.append('dorm_block', formData.dorm_block);
      if (formData.dorm_room) fd.append('dorm_room', formData.dorm_room);
      // Parse dorm_block_room (e.g., "Block B - Room 12" -> dorm_block: "B", dorm_room: "12")

      if (formData.confession_father) fd.append('confession_father', formData.confession_father);
      if (formData.status) fd.append('status', formData.status);

      await api.updateProfile(fd);

      // Refresh the user context so downstream consumers get the normalized shape
      const refreshedUser = await api.getUser();
      setUser(refreshedUser);
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your changes have been saved.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
      navigate("/profile");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error?.message || "Something went wrong.",
        confirmButtonColor: "#fbbf24",
        background: "#142850",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options for dropdowns
  const batches = [
    { label: "Freshman", value: "1" },
    { label: "2nd Year", value: "2" },
    { label: "3rd Year", value: "3" },
    { label: "4th Year", value: "4" },
    { label: "5th/GC", value: "5" },
  ];
  const statuses = [
    { label: "In Campus", value: "IN_CAMPUS" },
    { label: "Graduated", value: "GRADUATED" },
  ];

  return (
    <div className="min-h-screen bg-[#1B3067] py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/profile"
          className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Profile
        </Link>

        <div className="bg-[#142850] rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-6">
            Edit Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Image */}
            <div className="flex items-center space-x-6">
              <img
                src={imagePreview}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-yellow-400"
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Change Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-[#1B3067] hover:file:bg-yellow-300"
                />
              </div>
            </div>

            {/* User Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Baptismal Name
                </label>
                <input
                  type="text"
                  name="baptismal_name"
                  value={formData.baptismal_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Batch
                </label>
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select</option>
                  {batches.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Telegram
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Personal Phone
                </label>
                <input
                  type="tel"
                  name="personal_phone"
                  value={formData.personal_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Emergency Name
                </label>
                <input
                  type="text"
                  name="emergency_name"
                  value={formData.emergency_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Emergency Relation
                </label>
                <input
                  type="text"
                  name="emergency_relation"
                  value={formData.emergency_relation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Home Address
                </label>
                <input
                  type="text"
                  name="home_address"
                  value={formData.home_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Previous Church
                </label>
                <input
                  type="text"
                  name="previous_church"
                  value={formData.previous_church}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Activity Serving
                </label>
                <input
                  type="text"
                  name="activity_serving"
                  value={formData.activity_serving}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Dorm Block
                </label>
                <input
                  type="text"
                  name="dorm_block"
                  value={formData.dorm_block}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Dorm Room
                </label>
                <input
                  type="text"
                  name="dorm_room"
                  value={formData.dorm_room}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confession Father
                </label>
                <input
                  type="text"
                  name="confession_father"
                  value={formData.confession_father}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#1B3067] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select</option>
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 text-[#1B3067] py-3 px-6 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
