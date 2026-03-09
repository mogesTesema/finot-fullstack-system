// src/types/index.ts

// User & Auth
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender?: "M" | "F";
  role?: string;
}

// Student Profile
export interface StudentProfile {
  id: string; // UUID
  user: number; // User ID
  user_email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender?: "M" | "F";
  profile_image?: string | null;
  batch_year?: number;
  department?: string;
  telegram_username?: string;
  personal_phone?: string;
  emergency_name?: string;
  emergency_phone?: string;
  emergency_relation?: string;
  home_address?: string;
  previous_church?: string;
  activity_serving?: string;
  dorm_block?: number;
  dorm_room?: number;
  confession_father?: string;
  status: "IN_CAMPUS" | "GRADUATED";
  created_at: string;
  updated_at: string;
}

// Service (Ministry)
export interface ServiceGroup {
  id: number;
  name: string;
  description?: string;
  admin_name?: string; // from serializer
}

export interface ServiceSelection {
  id?: number;
  service_group: number;
  service_group_name?: string; // read-only
  priority: 1 | 2 | 3;
  skills?: string;
  reason?: string;
}

export interface UserProfileSubset {
  batch?: number;
  department?: string;
  personal_phone?: string;
  telegram?: string;
}

export interface FamilyContact {
  id: number;
  name: string;
  email?: string;
  profile?: UserProfileSubset;
}

// Family
export interface Family {
  id: number;
  name: string;
  father?: FamilyContact;
  mother?: FamilyContact;
  religious_father?: string;
  member_count?: number;
  siblings?: FamilyMember[];
}

export interface FamilyMember {
  id: number;
  name: string;
  email?: string;
  profile?: UserProfileSubset;
}


// Contributions (Donation & QA)
export type FundCategory =
  | "Weekly Donation"
  | "Building Fund"
  | "Charity (Poor)"
  | "Special Events"
  | "Other";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface DonationPayment {
  id: number;
  amount: string;
  currency: string;
  transaction_reference: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Donation {
  id: number;
  fund_category: FundCategory;
  donated_at: string;
  payment: DonationPayment;
}

export interface Answer {
  id: number;
  question: string; // UUID
  responder: number | null; // User ID
  display_name: string;
  answer_body: string;
  is_approved: boolean; // For "Verified" check
  is_verified?: boolean; // Frontend flag
  created_at: string;
}

export interface Question {
  id: string; // UUID
  user: number | null; // User ID
  display_name: string;
  category: "Spiritual" | "Academic" | "Family" | "Personal" | "Other";
  question_body: string;
  is_approved: boolean;
  is_verified?: boolean; // Frontend flag
  answer_count: number;
  created_at: string;
  answers?: Answer[];
}

export interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    photo?: string;
    status: "UPCOMING" | "ONGOING" | "COMPLETED";
}

// Attendance
export interface AttendanceRecord {
  id: number;
  event: number;
  event_title?: string;
  event_date?: string;
  status: string;
  remark?: string;
}

// Auth User (Frontend Transformation)
export interface AuthUserProfile {
  baptismal_name: string;
  profile_image: string | null;
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
  dorm_block_room: string;
  confession_father: string;
  status: 'graduated' | 'active';
  assignedGroup: any | null;
}

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  gender: string;
  role: string;
  profile: AuthUserProfile;
}
