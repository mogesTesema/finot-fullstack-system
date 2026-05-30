// src/components/resources/ResourceCard.tsx

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DocumentIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  LinkIcon,
  BookOpenIcon,
  MusicalNoteIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { Resource, ResourceCategory } from "../../types/resource";

interface ResourceCardProps {
  resource: Resource;
  isAdmin?: boolean;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onView?: (resource: Resource) => void;
}

const getCategoryIcon = (category: ResourceCategory) => {
  switch (category) {
    case "BIBLE_STUDY":
      return <BookOpenIcon className="h-8 w-8 text-primary" />;
    case "SERMON":
      return <MusicalNoteIcon className="h-8 w-8 text-primary" />;
    case "DOCUMENT":
      return <DocumentIcon className="h-8 w-8 text-primary" />;
    case "VIDEO":
      return <VideoCameraIcon className="h-8 w-8 text-primary" />;
    case "AUDIO":
      return <SpeakerWaveIcon className="h-8 w-8 text-primary" />;
    case "LINK":
      return <LinkIcon className="h-8 w-8 text-primary" />;
    default:
      return <FolderIcon className="h-8 w-8 text-primary" />;
  }
};

const getCategoryName = (category: ResourceCategory, t: any) => {
  const names: Record<ResourceCategory, string> = {
    BIBLE_STUDY: t("category_bible_study"),
    SERMON: t("category_sermon"),
    DOCUMENT: t("category_document"),
    VIDEO: t("category_video"),
    AUDIO: t("category_audio"),
    LINK: t("category_link"),
    OTHER: t("category_other"),
  };
  return names[category] || category;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const ResourceCard = ({ resource, isAdmin, onEdit, onDelete, onView }: ResourceCardProps) => {
  const { t } = useTranslation();

  const handleDownload = () => {
    if (resource.file) {
      window.open(resource.file, "_blank");
    } else if (resource.link) {
      window.open(resource.link, "_blank");
    }
  };

  const handleView = () => {
    if (onView) {
      onView(resource);
    } else {
      handleDownload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card hover:shadow-lg transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getCategoryIcon(resource.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">
                {resource.title}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-accent/10 text-accent-foreground">
                  {getCategoryName(resource.category, t)}
                </span>
                {resource.batch_year && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">
                    {t("batch_year")} {resource.batch_year}
                  </span>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit?.(resource)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                  title={t("edit")}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete?.(resource)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                  title={t("delete")}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {resource.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {resource.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-muted-foreground">
              {t("uploaded_by")}: {resource.uploaded_by?.full_name || "Admin"} • {formatDate(resource.created_at)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleView}
                className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <EyeIcon className="h-3.5 w-3.5" />
                {t("view")}
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                {t("download")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;