// src/pages/dashboard/resources/UploadResource.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, DocumentIcon, LinkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { ResourceCategory } from "@/types/resource";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const UploadResource = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("DOCUMENT");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [batchYear, setBatchYear] = useState<string>("");
  const [uploadType, setUploadType] = useState<"file" | "link">("file");
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "BIBLE_STUDY", name: t("category_bible_study") },
    { id: "SERMON", name: t("category_sermon") },
    { id: "DOCUMENT", name: t("category_document") },
    { id: "VIDEO", name: t("category_video") },
    { id: "AUDIO", name: t("category_audio") },
    { id: "LINK", name: t("category_link") },
    { id: "OTHER", name: t("category_other") },
  ];

  const batchOptions = [
    { value: "", label: t("all_batches") },
    { value: "1", label: t("batch_1") },
    { value: "2", label: t("batch_2") },
    { value: "3", label: t("batch_3") },
    { value: "4", label: t("batch_4") },
    { value: "5", label: t("batch_5") },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file size (max 50MB)
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

    if (uploadType === "link" && !link.trim()) {
      toast.error(t("link_required"));
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (batchYear) formData.append("batch_year", batchYear);
    if (uploadType === "file" && file) {
      formData.append("file", file);
    } else if (uploadType === "link" && link) {
      formData.append("link", link);
    }

    try {
      await api.uploadResource(formData);
      toast.success(t("resource_uploaded_success"));
      navigate("/dashboard/resources");
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || t("upload_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex items-center gap-4 mb-6"
      >
        <Link
          to="/dashboard/resources"
          className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("upload_resource")}</h1>
          <p className="text-sm text-muted-foreground">{t("upload_resource_description")}</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Title */}
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("description")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("description_placeholder")}
            rows={3}
            className="input w-full"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("category")} *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ResourceCategory)}
            className="input w-full"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Upload Type Toggle */}
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
                  ? "bg-primary text-white shadow-md"
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
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              {t("external_link")}
            </button>
          </div>
        </div>

        {/* File Upload or Link Input */}
        {uploadType === "file" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("file")} *
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.mp4,.mp3,.jpg,.jpeg,.png,.zip"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <DocumentIcon className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : t("click_to_upload")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("supported_files")}
                </span>
              </label>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("external_link")} *
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/resource"
              className="input w-full"
            />
          </div>
        )}

        {/* Batch Year (Optional) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("batch_year_optional")}
          </label>
          <select
            value={batchYear}
            onChange={(e) => setBatchYear(e.target.value)}
            className="input w-full"
          >
            {batchOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            {t("batch_year_help")}
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? <Spinner size="h-4 w-4" /> : t("upload")}
          </button>
          <Link
            to="/dashboard/resources"
            className="btn-outline px-6"
          >
            {t("cancel")}
          </Link>
        </div>
      </motion.form>
    </div>
  );
};

export default UploadResource;