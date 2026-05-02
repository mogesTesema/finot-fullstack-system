// src/services/api.real.js
import axiosInstance from './axios';
import { AuthUser, AttendanceRecord, Donation, Event, Question, PaginatedResponse, ServiceGroup, ServiceSelection, Answer } from '../types';
//import { privateQaMockApi, MockPrivateQuestion, MockPrivateAnswer } from './privateQaMockApi';
import { Resource } from '@/types/resource';
//import {Course, CourseSession, CourseAttendance, CourseWithDetails} from '@types/course'
export const BACKEND_PAGE_SIZE = 20;

/**
 * Safely extract the results array from a DRF paginated response.
 * If the response is already a plain array (e.g. from a custom @action),
 * it returns the data as-is. This makes the helper safe for both shapes.
 */
function unwrapResults<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if ('detail' in data && typeof data.detail === 'string') {
      throw new Error(data.detail);
    }
    if ('results' in data) return data.results;
  }
  return [];
}

// Helper to combine user and profile
const combineUserWithProfile = (userData: Record<string, any>, profileData: Record<string, any>, membershipData: Record<string, any> | null): AuthUser => {
  const full_name = `${userData.first_name || ''} ${userData.middle_name || ''} ${userData.last_name || ''}`.trim();

  const status: 'graduated' | 'active' = profileData?.status === 'GRADUATED' ? 'graduated' : 'active';

  // Derive role from backend roles array (e.g. ["Student"], ["ServiceAdmin"])
  // Note: SuperAdmin is handled entirely via Django admin panel — not mapped in frontend.
  const backendRoles: string[] = userData.roles || [];
  let role = 'student'; // default
  if (backendRoles.includes('ServiceAdmin')) {
    role = 'service_admin';
  } else if (backendRoles.includes('FamilyAdmin')) {
    role = 'family_admin';
  } else if (backendRoles.includes('QACounselor')){
    role = 'QA_counselor';
  } else if (backendRoles.includes('Teacher')){
    role = 'teacher'
  }


  return {
    id: userData.id,
    full_name,
    email: userData.email,
    gender: userData.gender === 'M' ? 'Male' : (userData.gender === 'F' ? 'Female' : ''),
    role,
    profile: {
      baptismal_name: profileData?.baptismal_name || '',
      profile_image: profileData?.profile_image || null,
      batch: profileData?.batch_year ? `${profileData.batch_year} Year` : '',
      department: profileData?.department || '',
      telegram: profileData?.telegram_username || '',
      personal_phone: profileData?.personal_phone || '',
      emergency_name: profileData?.emergency_name || '',
      emergency_phone: profileData?.emergency_phone || '',
      emergency_relation: profileData?.emergency_relation || '',
      home_address: profileData?.home_address || '',
      previous_church: profileData?.previous_church || '',
      activity_serving: profileData?.activity_serving || '',
      dorm_block_room: profileData?.dorm_block && profileData?.dorm_room ? `Block ${profileData.dorm_block} - Room ${profileData.dorm_room}` : '',
      confession_father: profileData?.confession_father || '',
      status: status,
      assignedGroup: membershipData?.service_group_name || null, // populated from membership endpoint
    },
  };
};

export const api = {
  getUser: async (): Promise<AuthUser> => {
    try {
      // Standard simplified call - rely entirely on the Axios Interceptor
      const userResponse = await axiosInstance.get('/auth/users/me/');
      const userData = userResponse.data;

      // Fetch student profile
      let profileData = {};
      try {
        const profileResponse = await axiosInstance.get('/api/student/profiles/me/');
        profileData = profileResponse.data;
      } catch (error) {
        console.warn('Student profile not found. User may need onboarding.');
      }

      // Fetch service group membership
      let membershipData = null;
      try {
        const membershipResponse = await axiosInstance.get('/api/service/groups/my-membership/');
        membershipData = membershipResponse.data;
      } catch (error) {
        // User is not assigned to any service group — that's fine
      }

      return combineUserWithProfile(userData, profileData, membershipData);
    } catch (error) {
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<{ success: boolean; user: AuthUser }> => {
    // 1. Clear old state to ensure the interceptor doesn't send a stale token
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // 2. Authenticate
    let response;
    try {
      response = await axiosInstance.post('/auth/jwt/create/', { username: email, password });
      console.log("LOGIN RAW RESPONSE:", response);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        throw new Error("Incorrect Email or Password. If you don't have an account, please register.");
      }
      throw error;
    }

    const { access, refresh } = response.data;

    // 3. Persist tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // 4. Fetch the full user object
    // Because getUser() uses axiosInstance, it will trigger the interceptor, 
    // which will find the NEW token in localStorage.
    try {
      const combinedUser = await api.getUser();
      return { success: true, user: combinedUser };
    } catch (error) {
      console.error("Critical: Auth succeeded but profile fetch failed.", error);
      throw new Error("Login successful, but failed to load user profile. Please try refreshing.");
    }
  },

  register: async (userData: Record<string, any>): Promise<{ success: boolean; user: AuthUser }> => {
    const payload = {
      username: userData.email,
      first_name: userData.first_name,
      middle_name: userData.middle_name,
      last_name: userData.last_name,
      email: userData.email,
      gender: userData.gender, // M or F
      password: userData.password,
      re_password: userData.password, // Required by Djoser default config
    };

    console.log('🚀 Sending registration payload:', payload);

    try {
      const response = await axiosInstance.post('/auth/users/', payload);
      console.log('✅ Registration response:', response.data);
      return await api.login(userData.email, userData.password);
    } catch (error: any) {
      console.error(' Registration error response:', error.response?.data);
      throw error;
    }
  },
  requestPasswordReset: async (email: string) => {
    await axiosInstance.post('/auth/users/reset_password/', { email });
    return { success: true };
  },

  requestPasswordResetConfirm: async (
    uid: string,
    token: string,
    new_password: string,
    re_new_password: string
  ) => {
    await axiosInstance.post('/auth/users/reset_password_confirm/', {
      uid,
      token,
      new_password,
      re_new_password,
    });
    return { success: true };
  },

  // ========== USERS ==========
  getAllUsers: async () => {
    const response = await axiosInstance.get('/auth/users/');
    return unwrapResults(response.data);
  },

  // ========== SERVICE GROUPS ==========
  getServiceGroups: async (): Promise<ServiceGroup[]> => {
    const response = await axiosInstance.get('/api/service/groups/');
    return unwrapResults<ServiceGroup>(response.data);
  },

  getServiceGroupById: async (groupId: string | number) => {
    const response = await axiosInstance.get(`/api/service/groups/${groupId}/`);
    return response.data;
  },

  // ========== SELECTIONS ==========
  getSelectionWindow: async (): Promise<{ selection_open: boolean }> => {
    try {
      const response = await axiosInstance.get('/api/service/configuration/');
      return { selection_open: response.data?.selection_open !== false };
    } catch (error: any) {
      // If endpoint not yet available, allow selection by default
      if (error?.response?.status === 404) {
        return { selection_open: true };
      }
      console.warn('Selection window check failed; defaulting to open.', error);
      return { selection_open: true };
    }
  },

  getUserSelection: async (): Promise<ServiceSelection[]> => {
    // Backend returns current user's selections when called without params
    const response = await axiosInstance.get('/api/service/selections/');
    return unwrapResults<ServiceSelection>(response.data);
  },

  updateProfile: async (profileData: Record<string, any>) => {
    // Sending PATCH to /me/ endpoint since that's what we mapped in the backend
    const response = await axiosInstance.patch('/api/student/profiles/me/', profileData);
    return response.data;
  },

  getUserNotifications: async () => {
    const response = await axiosInstance.get('/api/notifications/');
    return unwrapResults(response.data);
  },

  markNotificationRead: async (notificationId: string | number) => {
    const response = await axiosInstance.post(`/api/notifications/${notificationId}/mark-read/`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await axiosInstance.post('/api/notifications/mark-all-read/');
    return response.data;
  },

  registerDeviceToken: async (token: string) => {
    const response = await axiosInstance.post('/api/notifications/device-token/', { device_token: token });
    return response.data;
  },

  submitSelection: async (selections: ServiceSelection[]) => {
    const payload = { selections };
    const response = await axiosInstance.post('/api/service/selections/', payload);
    return response.data;
  },

  deleteSelection: async (selectionId: string | number) => {
    await axiosInstance.delete(`/api/service/selections/${selectionId}/`);
    return { success: true };
  },

  // ========== FAMILIES ==========
  getFamilies: async () => {
    const response = await axiosInstance.get('/api/service/families/');
    return unwrapResults(response.data);
  },

  getMyFamily: async () => {
    const response = await axiosInstance.get('/api/service/families/my-family/');
    return response.data;
  },

  getFamilyMembers: async (familyId: string | number) => {
    const response = await axiosInstance.get(`/api/service/families/${familyId}/members/`);
    return response.data;
  },

  // ========== EVENTS ==========
  getEvents: async (): Promise<Event[]> => {
    const response = await axiosInstance.get('/api/service/events/');
    return unwrapResults<Event>(response.data);
  },

  // ========== ATTENDANCE ==========
  getAttendance: async (): Promise<AttendanceRecord[]> => {
    const response = await axiosInstance.get('/api/service/attendance/');
    return unwrapResults<AttendanceRecord>(response.data);
  },

  // ========== DONATIONS ==========
  getDonations: async (userId: string | number | null = null): Promise<Donation[]> => {
    // If we wanted to filter by user on admin, we'd do it.
    // However the MyDonationHistoryViewSet handles its own filtering via the logged in token.
    const response = await axiosInstance.get('/api/donations/my-history/');
    return unwrapResults(response.data);
  },

  createDonation: async (donationData: Record<string, any>) => {
    const response = await axiosInstance.post('/api/donations/initiate/', donationData);
    return response.data;
  },

  verifyDonation: async (txRef: string) => {
    const response = await axiosInstance.get(`/api/donations/verify/${txRef}/`);
    return response.data;
  },

  // ========== QUESTIONS & ANSWERS ==========
  // Returns a flat array (first page) — used by components that don't need pagination controls
  getQuestions: async () => {
    const response = await axiosInstance.get('/api/qa/questions/');
    return unwrapResults(response.data);
  },

  // Returns the full paginated envelope — used by QuestionList for server-side pagination
  getQuestionsPaginated: async (page: number = 1, search?: string, category?: string): Promise<PaginatedResponse<Question>> => {
    const params: Record<string, string | number> = { page };
    if (search) params.search = search;
    if (category && category !== 'all') params.category = category;
    const response = await axiosInstance.get<PaginatedResponse<Question>>('/api/qa/questions/', { params });
    // Ensure we always return a valid envelope shape
    const data = response.data;
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },

  getQuestionById: async (questionId: string | number) => {
    const response = await axiosInstance.get(`/api/qa/questions/${questionId}/`);
    return response.data;
  },

  postQuestion: async (question: Partial<Question>) => {
    const response = await axiosInstance.post('/api/qa/questions/', question);
    return response.data;
  },

  postAnswer: async (answer: Record<string, any>) => {
    const response = await axiosInstance.post('/api/qa/answers/', answer);
    return response.data;
  },

  updateQuestion: async (questionId: string | number, updatedData: Partial<Question>) => {
    const response = await axiosInstance.patch(`/api/qa/questions/${questionId}/`, updatedData);
    return response.data;
  },

  deleteQuestion: async (questionId: string | number) => {
    await axiosInstance.delete(`/api/qa/questions/${questionId}/`);
    return { success: true };
  },

  updateAnswer: async (answerId: string | number, updatedData: Record<string, any>) => {
    const response = await axiosInstance.patch(`/api/qa/answers/${answerId}/`, updatedData);
    return response.data;
  },

  deleteAnswer: async (answerId: string | number) => {
    await axiosInstance.delete(`/api/qa/answers/${answerId}/`);
    return { success: true };
  },



  // ========== ADMIN SPECIFIC ==========
  getGroupByAdminId: async (adminId: string | number) => {
    const response = await axiosInstance.get(`/api/service/groups/?admin=${adminId}`);
    const groups = unwrapResults(response.data);
    return groups[0] || null;
  },

  getMyManagedGroup: async () => {
    const response = await axiosInstance.get('/api/service/groups/my-group/');
    return response.data;
  },

  getMyMembership: async () => {
    const response = await axiosInstance.get('/api/service/groups/my-membership/');
    return response.data;
  },

  getAllSelections: async (): Promise<ServiceSelection[]> => {
    const response = await axiosInstance.get('/api/service/selections/');
    return unwrapResults<ServiceSelection>(response.data);
  },

  getUsersByGroup: async (groupId: string | number) => {
    const response = await axiosInstance.get(`/api/service/groups/${groupId}/members/`);
    return response.data;
  },

  assignGroupAdmin: async (groupId: string | number, adminId: string | number) => {
    const response = await axiosInstance.post(`/api/service/groups/${groupId}/assign-admin/`, { admin_id: adminId });
    return response.data;
  },

  deleteUser: async (userId: string | number) => {
    await axiosInstance.delete(`/auth/users/${userId}/`);
    return { success: true };
  },

  // ========== UPDATED Q&A API METHODS ==========

// Get user's private questions (for student inbox)
getPrivateInbox: async (): Promise<Question[]> => {
  const response = await axiosInstance.get('/api/qa/questions/private-inbox/');
  return response.data;
},

// Get user's contributions (questions + answers)
getMyContributions: async (): Promise<{ questions: Question[]; answers: Answer[] }> => {
  const response = await axiosInstance.get('/api/qa/questions/my-contributions/');
  return response.data;
},

// Counselor: Get queue of private questions
getCounselorQueue: async (): Promise<Question[]> => {
  const response = await axiosInstance.get('/api/qa/questions/counselor-queue/');
  return response.data;
},

// Moderator: Get moderation queue
getModerationQueue: async (): Promise<Question[]> => {
  const response = await axiosInstance.get('/api/qa/questions/moderation-queue/');
  return response.data;
},

// Approve public question (moderator only)
approveQuestion: async (questionId: string): Promise<void> => {
  await axiosInstance.post(`/api/qa/questions/${questionId}/approve/`);
},

// Approve public answer (moderator only)
approveAnswer: async (answerId: number): Promise<void> => {
  await axiosInstance.post(`/api/qa/answers/${answerId}/approve/`);
},


// ========== RESOURCES API ==========

// Get all resources with filters
getResources: async (params?: {
  category?: string;
  batch?: number;
  group?: number;
  search?: string;
}): Promise<Resource[]> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.batch) queryParams.append('batch', params.batch.toString());
  if (params?.group) queryParams.append('group', params.group.toString());
  if (params?.search) queryParams.append('search', params.search);
  
  const url = `/api/resources/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await axiosInstance.get(url);
  return unwrapResults(response.data);
},

// Get single resource
getResourceById: async (id: number): Promise<Resource> => {
  const response = await axiosInstance.get(`/api/resources/${id}/`);
  return response.data;
},

// Upload new resource (admin only)
uploadResource: async (formData: FormData): Promise<Resource> => {
  const response = await axiosInstance.post('/api/resources/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
},

// Update resource (admin only)
updateResource: async (id: number, formData: FormData): Promise<Resource> => {
  const response = await axiosInstance.patch(`/api/resources/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
},

// Delete resource (admin only)
deleteResource: async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/resources/${id}/`);
},

// Get resource categories
getResourceCategories: async (): Promise<{ id: string; name: string; icon: string }[]> => {
  // For now, return static categories
  return Promise.resolve([
    { id: "BIBLE_STUDY", name: "Bible Study", icon: "BookOpenIcon" },
    { id: "SERMON", name: "Sermon", icon: "MusicalNoteIcon" },
    { id: "DOCUMENT", name: "Document", icon: "DocumentIcon" },
    { id: "VIDEO", name: "Video", icon: "VideoCameraIcon" },
    { id: "AUDIO", name: "Audio", icon: "SpeakerWaveIcon" },
    { id: "LINK", name: "Link", icon: "LinkIcon" },
    { id: "OTHER", name: "Other", icon: "FolderIcon" },
  ]);
},

// ========== COURSE ATTENDANCE API (NEW BACKEND) ==========

// Get semester courses (auto-filtered by role: STUDENT sees enrolled, TEACHER sees assigned)
getSemesterCourses: async (): Promise<any[]> => {
  const response = await axiosInstance.get('/api/course/semester-courses/');
  return response.data;
},

// Get enrollments for a specific semester course (teacher only)
getCourseEnrollments: async (semesterCourseId: string): Promise<any[]> => {
  const response = await axiosInstance.get(`/api/course/enrollments/?semester_course=${semesterCourseId}`);
  return response.data;
},

// Get sessions for a semester course
getCourseSessions: async (semesterCourseId: string): Promise<any[]> => {
  const response = await axiosInstance.get(`/api/course/sessions/?semester_course=${semesterCourseId}`);
  return response.data;
},

// Create a new session (teacher only)
createCourseSession: async (data: {
  semester_course: string;
  session_date: string;
  topic?: string;
}): Promise<any> => {
  const response = await axiosInstance.post('/api/course/sessions/', data);
  return response.data;
},

// Get my attendance records (student only)
getMyCourseAttendance: async (): Promise<any[]> => {
  const response = await axiosInstance.get('/api/course/attendance/');
  return response.data;
},

// Bulk mark attendance (teacher only)
bulkMarkAttendance: async (sessionId: string, records: { student_id: string; status: string; remarks?: string }[]): Promise<any> => {
  const response = await axiosInstance.post(`/api/course/attendance/bulk-mark/${sessionId}/`, { records });
  return response.data;
},

// Get course materials
getCourseMaterials: async (semesterCourseId: string): Promise<any[]> => {
  const response = await axiosInstance.get(`/api/course/materials/?semester_course=${semesterCourseId}`);
  return response.data;
},

// Upload course material (teacher only)
uploadCourseMaterial: async (data: FormData): Promise<any> => {
  const response = await axiosInstance.post('/api/course/materials/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
},
  
};