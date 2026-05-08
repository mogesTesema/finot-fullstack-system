import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  PlusCircleIcon,
  DocumentIcon,
  LinkIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "../../../components/ui/Spinner";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Material {
  id: number;
  title: string;
  description: string | null;
  material_type: "COURSE" | "SERVICE" | "GENERAL";
  file: string | null;
  url: string | null;
  course?: string | { id: string; title: string };
  service_group?: number | { id: number; name: string };
  uploaded_by: { id: number; full_name: string };
  created_at: string;
}

interface MaterialsManagerProps {
  materialType: "COURSE" | "SERVICE" | "GENERAL";
  courseId?: string;  // Required if materialType is COURSE
  serviceGroupId?: number;  // Required if materialType is SERVICE
  title?: string;
  subtitle?: string;
}

const MaterialsManager = ({ 
  materialType, 
  courseId, 
  serviceGroupId,
  title,
  subtitle,
}: MaterialsManagerProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state - all initialized with empty strings to prevent uncontrolled/controlled warnings
  const [formTitle, setFormTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");

  // Check if user can upload (handle both string and array roles)
  const userRole = user?.role;
  const userRoles = user?.role || [];
  const isSuperAdmin = userRole === "SuperAdmin" || userRoles.includes("SuperAdmin");

  let canUpload = false;
  if (materialType === "COURSE") {
    canUpload = isSuperAdmin || userRole === "Course_coordinator" || userRoles.includes("CourseCoordinator");
  } else if (materialType === "SERVICE") {
    canUpload = isSuperAdmin || userRole === "service_admin" || userRoles.includes("ServiceAdmin");
  } else if (materialType === "GENERAL") {
    canUpload = isSuperAdmin;
  }

  // Fetch materials
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let params: any = { type: materialType };
      if (materialType === "COURSE" && courseId) {
        params.course = courseId;
      }
      if (materialType === "SERVICE" && serviceGroupId) {
        params.service_group = serviceGroupId;
      }
      const data = await api.getMaterials(params);
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch materials", error);
      toast.error(t("failed_to_load_materials"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [materialType, courseId, serviceGroupId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error(t("file_too_large"));
        return;
      }
      setFile(selectedFile);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setDescription("");
    setFile(null);
    setLinkUrl("");
    setUploadType("file");
    setShowUploadForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formTitle.trim()) {
      toast.error(t("title_required"));
      return;
    }
    
    if (uploadType === "file" && !file) {
      toast.error(t("file_required"));
      return;
    }
    
    if (uploadType === "link" && !linkUrl.trim()) {
      toast.error(t("link_required"));
      return;
    }
    
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", formTitle);
    formData.append("description", description);
    formData.append("material_type", materialType);
    
    if (materialType === "COURSE" && courseId) {
      formData.append("course", courseId);
    }
    if (materialType === "SERVICE" && serviceGroupId) {
      formData.append("service_group", serviceGroupId.toString());
    }
    
    if (uploadType === "file" && file) {
      formData.append("file", file);
    } else if (uploadType === "link" && linkUrl) {
      formData.append("url", linkUrl);
    }
    
    try {
      await api.uploadMaterial(formData);
      toast.success(t("material_uploaded_success"));
      
      // Reset form
      resetForm();
      
      // Refresh materials
      fetchMaterials();
    } catch (error: any) {
      console.error("Failed to upload material", error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || t("upload_failed");
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!window.confirm(t("confirm_delete_material"))) return;
    try {
      await api.deleteMaterial(materialId);
      toast.success(t("material_deleted_success"));
      fetchMaterials();
    } catch (error) {
      console.error("Failed to delete material", error);
      toast.error(t("failed_to_delete_material"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "COURSE":
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t("course_material")}</span>;
      case "SERVICE":
        return <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{t("service_material")}</span>;
      case "GENERAL":
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{t("general_material")}</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title || t("materials")}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {canUpload && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {showUploadForm ? (
              <><XMarkIcon className="h-4 w-4" /> {t("cancel")}</>
            ) : (
              <><PlusCircleIcon className="h-4 w-4" /> {t("upload_material")}</>
            )}
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm && canUpload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card bg-muted/30"
        >
          <h4 className="font-semibold text-foreground mb-4">{t("upload_new_material")}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("title")} *</label>
              <input
                type="text"
                value={formTitle || ""}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={t("title_placeholder")}
                className="input w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("description")}</label>
              <textarea
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("description_placeholder")}
                rows={2}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("upload_type")} *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUploadType("file")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    uploadType === "file"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <DocumentIcon className="h-4 w-4" />
                  {t("upload_file")}
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("link")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    uploadType === "link"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                  {t("external_link")}
                </button>
              </div>
            </div>
            
            {uploadType === "file" ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("file")} *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.mp4,.mp3,.jpg,.jpeg,.png"
                  className="input w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">{t("supported_files")}</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("link_url")} *</label>
                <input
                  type="url"
                  value={linkUrl || ""}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/resource"
                  className="input w-full"
                />
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? t("uploading") : t("upload")}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline px-4">
                {t("cancel")}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl">
          <FolderIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{t("no_materials_yet")}</p>
          {canUpload && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="btn-primary inline-flex items-center gap-2 mt-4 text-sm"
            >
              <PlusCircleIcon className="h-4 w-4" />
              {t("upload_first_material")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <div key={material.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {material.url ? (
                      <LinkIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <DocumentIcon className="h-5 w-5 text-primary" />
                    )}
                    <h4 className="font-semibold text-foreground">{material.title}</h4>
                    {getTypeBadge(material.material_type)}
                  </div>
                  {material.description && (
                    <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("uploaded_by")}: {material.uploaded_by?.full_name} • {formatDate(material.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={material.url || material.file || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    {t("view")}
                  </a>
                  {material.file && (
                    <a
                      href={material.file}
                      download
                      className="btn-outline text-sm px-3 py-1.5 flex items-center gap-1"
                    >
                      <DocumentIcon className="h-3.5 w-3.5" />
                      {t("download")}
                    </a>
                  )}
                  {canUpload && (
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg transition"
                      title={t("delete")}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsManager;