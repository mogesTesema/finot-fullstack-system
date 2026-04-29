// lib/api.private.mock.ts
// JSON Server mock for Private Q&A only
// Switch to real backend by changing the baseURL constant below

import axios from 'axios';

// ============================================
// CONFIGURATION - CHANGE THIS ONE LINE ONLY
// ============================================
// For JSON Server (development):
const PRIVATE_API_BASE_URL = "http://localhost:5000";

// For real backend (when ready):
// const PRIVATE_API_BASE_URL = "http://localhost:8000/api";
// ============================================

const privateApiClient = axios.create({
  baseURL: PRIVATE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add the same auth token as your main api
privateApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `JWT ${token}`;
  }
  return config;
});

// ============================================
// PRIVATE Q&A API METHODS (Mock with JSON Server)
// ============================================

export const privateQaApi = {
  // Post a private question
  postPrivateQuestion: async (data: { question_body: string }): Promise<any> => {
    const studentId = JSON.parse(localStorage.getItem('user') || '{}').id || 1;
    const response = await privateApiClient.post('/private_questions', {
      ...data,
      id: Date.now().toString(),
      student_id: studentId,
      created_at: new Date().toISOString(),
      is_answered: false,
    });
    return response;
  },

  // Get all private questions (then filter by student)
  getMyPrivateQuestions: async (): Promise<any> => {
    const response = await privateApiClient.get('/private_questions');
    return response;
  },

  // Get answers for a specific private question
  getPrivateAnswers: async (questionId: string): Promise<any> => {
    const response = await privateApiClient.get(`/private_answers?question_id=${questionId}`);
    return response;
  },

  // Teacher: Get unanswered questions by specialization
  getUnansweredPrivateQuestions: async (specialization: string): Promise<any> => {
    const response = await privateApiClient.get('/private_questions?is_answered=false');
    return response;
  },

  // Teacher: Post an answer
  postPrivateAnswer: async (data: {
    question_id: string;
    answer_body: string;
    is_primary: boolean;
    parent_answer_id?: string | null;
  }): Promise<any> => {
    const teacherId = JSON.parse(localStorage.getItem('user') || '{}').id || 5;
    const response = await privateApiClient.post('/private_answers', {
      ...data,
      id: Date.now().toString(),
      teacher_id: teacherId,
      created_at: new Date().toISOString(),
    });
    return response;
  },
};

export default privateQaApi;