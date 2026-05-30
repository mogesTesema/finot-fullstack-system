// src/types/qa.ts

export interface PendingQuestion {
  id: string;
  user: number | null;
  display_name: string;
  category: string;
  question_body: string;
  is_approved: boolean;
  visibility: "PUBLIC" | "PRIVATE";
  created_at: string;
}

export interface PendingAnswer {
  id: number;
  question: string | PendingQuestion;
  responder: number | null;
  display_name: string;
  answer_body: string;
  is_approved: boolean;
  created_at: string;
}

export interface ModerationQueue {
  questions: PendingQuestion[];
  answers: PendingAnswer[];
}