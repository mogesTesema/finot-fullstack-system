// lib/privateQaMockApi.ts
import axios from 'axios';

// JSON Server base URL - runs on port 5000 alongside your real backend (port 8000)
const MOCK_API_BASE_URL = 'http://localhost:5000';

const mockApiClient = axios.create({
  baseURL: MOCK_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Private Question interfaces
export interface MockPrivateQuestion {
  id: string;
  student_id: number;
  question_body: string;
  created_at: string;
  is_answered: boolean;
}

export interface MockPrivateAnswer {
  id: string;
  question_id: string;
  teacher_id: number;
  teacher_name: string;
  answer_body: string;
  is_primary: boolean;
  parent_answer_id: string | null;
  created_at: string;
}

// Mock API methods for Private Q&A only
export const privateQaMockApi = {
  // Get all private questions
  getMyPrivateQuestions: async (studentId: number): Promise<MockPrivateQuestion[]> => {
    try {
      const response = await mockApiClient.get('/private_questions');
      const allQuestions = response.data || [];
      return allQuestions.filter((q: MockPrivateQuestion) => q.student_id === studentId);
    } catch (error) {
      console.warn('Mock API not running, returning empty array');
      return [];
    }
  },

  // Post a new private question
  postPrivateQuestion: async (studentId: number, questionBody: string, category: string): Promise<MockPrivateQuestion> => {
    const newQuestion = {
      id: Date.now().toString(),
      student_id: studentId,
      question_body: questionBody,
      created_at: new Date().toISOString(),
      is_answered: false,
      category: category,
    };
    const response = await mockApiClient.post('/private_questions', newQuestion);
    return response.data;
  },

  // Get answers for a specific private question
  getPrivateAnswers: async (questionId: string): Promise<MockPrivateAnswer[]> => {
    try {
      const response = await mockApiClient.get(`/private_answers?question_id=${questionId}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  },
};

export default mockApiClient;