import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DocumentIcon,
  LinkIcon,
  EyeIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Spinner from "../../components/ui/Spinner";
import { api } from "../../lib/api";

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
  uploaded_by: { id: number; full_name: string };
  created_at: string;
}

const ResourcesList = () => {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<"ALL" | "COURSE" | "SERVICE" | "GENERAL">("ALL");

  // Fetch materials (backend auto-filters based on user role)
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = activeType !== "ALL" ? { type: activeType } : undefined;
      const data = await api.getMaterials(params);
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch materials", error);
      toast.error(t("failed_to_load_resources"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [activeType]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "COURSE":
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t("course")}</span>;
      case "SERVICE":
        return <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{t("service_group")}</span>;
      case "GENERAL":
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{t("general")}</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="h-8 w-8" />
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
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">{t("resources")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("resources_description_auto")}
        </p>
      </motion.div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(["ALL", "COURSE", "SERVICE", "GENERAL"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${
              activeType === type
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {type === "ALL" ? t("all_materials") : t(`type_${type.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl">
          <FolderIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{t("no_resources_found")}</p>
          <p className="text-sm mt-2">{t("resources_will_appear_here")}</p>
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
                    <h3 className="font-semibold text-foreground">{material.title}</h3>
                    {getTypeIcon(material.material_type)}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesList;