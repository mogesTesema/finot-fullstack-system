// src/types/resource.ts

export type ResourceCategory = 
  | "BIBLE_STUDY"
  | "SERMON"
  | "DOCUMENT"
  | "VIDEO"
  | "AUDIO"
  | "LINK"
  | "OTHER";

export interface Resource {
  id: number;
  title: string;
  description: string | null;
  category: ResourceCategory;
  file: string | null;      // URL to file
  link: string | null;       // External link
  uploaded_by: {
    id: number;
    full_name: string;
  };
  batch_year: number | null;  // 1-5 or null for all batches
  service_group: number | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceFormData {
  title: string;
  description: string;
  category: ResourceCategory;
  file?: File;
  link?: string;
  batch_year: number | null;
  service_group: number | null;
}