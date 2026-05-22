import { create } from 'zustand';
import { QuestionResponse, EvaluationResponse } from '../types';

interface SessionStore {
  sessionId: string | null;
  targetRole: string;
  seniority: string;
  questionType: string;
  resumeId: string | null;
  currentQuestion: QuestionResponse | null;
  currentEvaluation: EvaluationResponse | null;
  questionNumber: number;
  totalQuestions: number;
  transcript: string;
  isRecording: boolean;

  setSession: (id: string, role: string, seniority: string, resumeId: string) => void;
  setTargetRole: (role: string) => void;
  setSeniority: (level: string) => void;
  setQuestion: (q: QuestionResponse) => void;
  setEvaluation: (e: EvaluationResponse) => void;
  setTranscript: (t: string) => void;
  setRecording: (val: boolean) => void;
  nextQuestion: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  targetRole: '',
  seniority: 'Senior',
  questionType: 'mixed',
  resumeId: null,
  currentQuestion: null,
  currentEvaluation: null,
  questionNumber: 1,
  totalQuestions: 5,
  transcript: '',
  isRecording: false,

  setSession: (id, role, seniority, resumeId) =>
    set({ sessionId: id, targetRole: role, seniority, resumeId }),

  setTargetRole: (role) => set({ targetRole: role }),
  setSeniority: (level) => set({ seniority: level }),
  setQuestion: (q) => set({ currentQuestion: q }),
  setEvaluation: (e) => set({ currentEvaluation: e }),
  setTranscript: (t) => set({ transcript: t }),
  setRecording: (val) => set({ isRecording: val }),

  nextQuestion: () =>
    set((s) => ({
      questionNumber: s.questionNumber + 1,
      currentQuestion: null,
      currentEvaluation: null,
      transcript: '',
    })),

  resetSession: () =>
    set({
      sessionId: null,
      currentQuestion: null,
      currentEvaluation: null,
      questionNumber: 1,
      transcript: '',
      isRecording: false,
    }),
}));