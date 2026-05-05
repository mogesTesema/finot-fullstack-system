import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  DocumentIcon,
  LinkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "../../components/ui/Spinner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  file_url: string | null;
  link_url: string | null;
  uploaded_at: string;
}

interface SemesterCourse {
  id: string;
  curriculum: { title: string; code: string };
  academic_year: string;
  semester: number;
}

const CourseMaterials = () => {
  const { id: semesterCourseId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<SemesterCourse | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");

  // Check if user is CourseCoordinator
  const isCourseCoordinator = user?.role === "Course_coordinator" || user?.role?.includes("CourseCoordinator");

  // Fetch course and materials
  useEffect(() => {
    const fetchData = async () => {
      if (!semesterCourseId) return;
      
      setLoading(true);
      try {
        // Get course details
        const courses = await api.getSemesterCourses();
        const foundCourse = courses.find((c: any) => c.id === semesterCourseId);
        setCourse(foundCourse || null);
        
        // Get materials
        const materialsData = await api.getCourseMaterials(semesterCourseId);
        setMaterials(materialsData);
      } catch (error) {
        console.error("Failed to fetch materials", error);
        toast.error(t("failed_to_load_materials"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [semesterCourseId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
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
    formData.append("semester_course", semesterCourseId || "");
    formData.append("title", title);
    formData.append("description", description);
    
    if (uploadType === "file" && file) {
      formData.append("file", file);
    } else if (uploadType === "link" && linkUrl) {
      formData.append("link_url", linkUrl);
    }
    
    try {
      await api.uploadCourseMaterial(formData);
      toast.success(t("material_uploaded_success"));
      
      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      setLinkUrl("");
      setShowUploadForm(false);
      
      // Refresh materials
      const materialsData = await api.getCourseMaterials(semesterCourseId || "");
      setMaterials(materialsData);
    } catch (error) {
      console.error("Failed to upload material", error);
      toast.error(t("upload_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("course_not_found")}</p>
        <Link to="/dashboard/courses" className="btn-primary mt-4 inline-block">
          {t("back_to_courses")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex items-center gap-4 mb-6"
      >
        <Link
          to="/dashboard/courses"
          className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("course_materials")}</h1>
          <p className="text-sm text-muted-foreground">
            {course.curriculum?.title} - {t("year")} {course.academic_year} • {t("semester")} {course.semester}
          </p>
        </div>
      </motion.div>

      {/* Upload Button (Course Coordinators Only) */}
      {isCourseCoordinator && (
        <div className="mb-6">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusCircleIcon className="h-4 w-4" />
            {showUploadForm ? t("cancel") : t("upload_material")}
          </button>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && isCourseCoordinator && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card mb-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">{t("upload_new_material")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("title")} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("title_placeholder")}
                className="input w-full"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("description")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("description_placeholder")}
                rows={2}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("upload_type")} *
              </label>
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
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("file")} *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.mp4,.mp3,.jpg,.jpeg,.png"
                  className="input w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("supported_files")}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("link_url")} *
                </label>
                <input
                  type="url"
                  value={linkUrl}
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
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="btn-outline px-4"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <DocumentIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{t("no_materials_yet")}</p>
          {isCourseCoordinator && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="btn-primary inline-flex items-center gap-2 mt-4"
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
                  <div className="flex items-center gap-2">
                    {material.link_url ? (
                      <LinkIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <DocumentIcon className="h-5 w-5 text-primary" />
                    )}
                    <h3 className="font-semibold text-foreground">{material.title}</h3>
                  </div>
                  {material.description && (
                    <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("uploaded")}: {formatDate(material.uploaded_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={material.link_url || material.file_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    {t("view")}
                  </a>
                  {material.file_url && (
                    <a
                      href={material.file_url}
                      download
                      className="btn-outline text-sm px-3 py-1.5 flex items-center gap-1"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      {t("download")}
                    </a>
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

export default CourseMaterials;