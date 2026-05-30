import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiArrowLeft } from "react-icons/fi";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { api } from "../../lib/api";

type EditProfileFormData = {
  full_name: string; email: string; gender: string; baptismal_name: string; profile_image: File | null;
  batch: string; department: string; telegram: string; personal_phone: string;
  emergency_name: string; emergency_phone: string; emergency_relation: string;
  home_address: string; previous_church: string; activity_serving: string;
  dorm_block: string; dorm_room: string; confession_father: string; status: string;
};

const EditProfile = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const normalizedGender = user?.gender === "Male" ? "M" : user?.gender === "Female" ? "F" : user?.gender || "";
  const normalizedStatus = user?.profile?.status === "active" ? "IN_CAMPUS" : user?.profile?.status === "graduated" ? "GRADUATED" : "";
  const parsedBatch = user?.profile?.batch ? user.profile.batch.replace(/\s*Year\s*/i, "") : "";
  const parsedDormBlock = user?.profile?.dorm_block_room ? user.profile.dorm_block_room.match(/Block\s*(\d+)/i)?.[1] || "" : "";
  const parsedDormRoom = user?.profile?.dorm_block_room ? user.profile.dorm_block_room.match(/Room\s*(\d+)/i)?.[1] || "" : "";

  const [formData, setFormData] = useState<EditProfileFormData>({
    full_name: user?.full_name || "", email: user?.email || "", gender: normalizedGender,
    baptismal_name: user?.profile?.baptismal_name || "", profile_image: null,
    batch: parsedBatch, department: user?.profile?.department || "",
    telegram: user?.profile?.telegram || "", personal_phone: user?.profile?.personal_phone || "",
    emergency_name: user?.profile?.emergency_name || "", emergency_phone: user?.profile?.emergency_phone || "",
    emergency_relation: user?.profile?.emergency_relation || "",
    home_address: user?.profile?.home_address || "", previous_church: user?.profile?.previous_church || "",
    activity_serving: user?.profile?.activity_serving || "",
    dorm_block: parsedDormBlock, dorm_room: parsedDormRoom,
    confession_father: user?.profile?.confession_father || "", status: normalizedStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profile?.profile_image || "/images/default-avatar.jpg");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setFormData((prev) => ({ ...prev, profile_image: file })); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      if (formData.baptismal_name) fd.append('baptismal_name', formData.baptismal_name);
      if (formData.profile_image instanceof File) fd.append('profile_image', formData.profile_image);
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
      if (formData.confession_father) fd.append('confession_father', formData.confession_father);
      if (formData.status) fd.append('status', formData.status);
      await api.updateProfile(fd);
      const refreshedUser = await api.getUser();
      setUser(refreshedUser);
      Swal.fire({ icon: "success", title: t("profile_updated"), text: t("profile_update_success"), confirmButtonColor: "hsl(var(--accent))" });
      navigate("/dashboard/profile");
    } catch (error: any) {
      Swal.fire({ icon: "error", title: t("update_failed"), text: error?.message || t("something_went_wrong"), confirmButtonColor: "hsl(var(--accent))" });
    } finally { setIsSubmitting(false); }
  };

  const batches = [
    { label: t("freshman"), value: "1" }, { label: t("2nd_year"), value: "2" },
    { label: t("3rd_year"), value: "3" }, { label: t("4th_year"), value: "4" },
    { label: t("5th_gc"), value: "5" },
  ];
  const statuses = [{ label: t("in_campus"), value: "IN_CAMPUS" }, { label: t("graduated_status"), value: "GRADUATED" }];

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";
  const inputClass = "input";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition">
          <FiArrowLeft className="h-4 w-4" /> {t("back_to_profile")}
        </Link>
      </div>

      <div className="card">
        <h1 className="text-xl font-bold text-foreground mb-6">{t("edit_profile")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo */}
          <div className="flex items-center gap-5">
            <img src={imagePreview} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border-2 border-accent/30" />
            <div>
              <label className={labelClass}>{t("change_photo")}</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                className="text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent-hover file:cursor-pointer" />
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "full_name", label: t("full_name_label"), type: "text", required: true },
              { name: "email", label: t("email_address"), type: "email", required: true },
            ].map((f) => (
              <div key={f.name}>
                <label className={labelClass}>{f.label} {f.required && "*"}</label>
                <input type={f.type} name={f.name} value={(formData as any)[f.name]} onChange={handleChange} className={inputClass} />
              </div>
            ))}
            <div>
              <label className={labelClass}>{t("gender_label")} *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="">{t("select_gender")}</option>
                <option value="M">{t("gender_m")}</option>
                <option value="F">{t("gender_f")}</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("baptismal_name")}</label>
              <input type="text" name="baptismal_name" value={formData.baptismal_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("batch_year")}</label>
              <select name="batch" value={formData.batch} onChange={handleChange} className={inputClass}>
                <option value="">{t("select_gender")}</option>
                {batches.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            {[
              { name: "department", label: t("department") },
              { name: "telegram", label: t("telegram"), placeholder: t("telegram_placeholder") },
              { name: "personal_phone", label: t("phone") },
              { name: "emergency_name", label: t("emergency_name") },
              { name: "emergency_phone", label: t("phone") },
              { name: "emergency_relation", label: t("relationship") },
              { name: "home_address", label: t("home_address") },
              { name: "previous_church", label: t("previous_church") },
              { name: "activity_serving", label: t("activities_serving") },
              { name: "dorm_block", label: t("dorm_block") },
              { name: "dorm_room", label: t("dorm_room") },
              { name: "confession_father", label: t("confession_father") },
            ].map((f) => (
              <div key={f.name}>
                <label className={labelClass}>{f.label}</label>
                <input type="text" name={f.name} value={(formData as any)[f.name]} onChange={handleChange} placeholder={(f as any).placeholder || ""} className={inputClass} />
              </div>
            ))}
            <div>
              <label className={labelClass}>{t("status")}</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="">{t("select_gender")}</option>
                {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? t("saving") : t("save_changes")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
