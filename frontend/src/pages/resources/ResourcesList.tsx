// src/pages/dashboard/resources/ResourcesList.tsx

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Spinner from "@/components/ui/Spinner";
import SearchBar from "@/components/ui/SearchBar";
import ResourceCard from "@/components/resources/ResourceCard";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Resource, ResourceCategory } from "@/types/resource";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ResourcesList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";

  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const batchOptions = [
    { value: "all", label: t("all_batches") },
    { value: "1", label: t("batch_1") },
    { value: "2", label: t("batch_2") },
    { value: "3", label: t("batch_3") },
    { value: "4", label: t("batch_4") },
    { value: "5", label: t("batch_5") },
  ];

  // Fetch resources
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getResources();
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error("Failed to fetch resources", error);
      toast.error(t("failed_to_load_resources"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getResourceCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, [fetchResources, fetchCategories]);

  // Filter resources
  useEffect(() => {
    let filtered = [...resources];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    // Filter by batch year
    if (selectedBatch !== "all") {
      filtered = filtered.filter(
        (r) => r.batch_year === parseInt(selectedBatch)
      );
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedCategory, selectedBatch]);

  const handleDelete = async (resource: Resource) => {
    if (!window.confirm(t("confirm_delete_resource"))) return;
    
    try {
      await api.deleteResource(resource.id);
      toast.success(t("resource_deleted"));
      fetchResources();
    } catch (error) {
      console.error("Failed to delete resource", error);
      toast.error(t("failed_to_delete_resource"));
    }
  };

  const handleView = (resource: Resource) => {
    if (resource.file) {
      window.open(resource.file, "_blank");
    } else if (resource.link) {
      window.open(resource.link, "_blank");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedBatch("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("resources")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("resources_description")}
          </p>
        </div>

        {isAdmin && (
          <Link to="/dashboard/resources/upload" className="btn-primary flex items-center gap-2 self-start">
            <PlusCircleIcon className="h-4 w-4" />
            {t("upload_resource")}
          </Link>
        )}
      </motion.div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(v) => setSearchTerm(v)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-outline px-4 flex items-center gap-2 ${
              showFilters ? "bg-primary/10 border-primary" : ""
            }`}
          >
            <FunnelIcon className="h-4 w-4" />
            {t("filters")}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-muted/30 rounded-xl p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-foreground">{t("filter_options")}</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary-light flex items-center gap-1"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
                {t("clear_all")}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("category")}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">{t("all_categories")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("batch_year")}
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="input w-full"
                >
                  {batchOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Active Filters */}
      {(selectedCategory !== "all" || selectedBatch !== "all" || searchTerm) && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-muted-foreground">{t("active_filters")}:</span>
          {selectedCategory !== "all" && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
              <button onClick={() => setSelectedCategory("all")}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedBatch !== "all" && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              {t("batch_year")} {selectedBatch}
              <button onClick={() => setSelectedBatch("all")}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchTerm && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              {t("search")}: {searchTerm}
              <button onClick={() => setSearchTerm("")}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <FolderIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("no_resources_found")}</p>
            {isAdmin && (
              <Link to="/dashboard/resources/upload" className="btn-primary inline-flex items-center gap-2 mt-4">
                <PlusCircleIcon className="h-4 w-4" />
                {t("upload_first_resource")}
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesList;