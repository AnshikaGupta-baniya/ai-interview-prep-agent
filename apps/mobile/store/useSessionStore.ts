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
  usedChunkIds: string[];        // tracks which chunks already used
  questionTypes: string[];       // rotates question types
  lastScore: number | null;      // tracks last score for follow-up logic

  setSession: (id: string, role: string, seniority: string, resumeId: string) => void;
  setTargetRole: (role: string) => void;
  setSeniority: (level: string) => void;
  setQuestion: (q: QuestionResponse) => void;
  setEvaluation: (e: EvaluationResponse) => void;
  setTranscript: (t: string) => void;
  setRecording: (val: boolean) => void;
  setLastScore: (score: number) => void;
  addUsedChunk: (chunkId: string) => void;
  nextQuestion: () => void;
  resetSession: () => void;
  getCurrentQuestionType: () => string;
}

const QUESTION_TYPE_ROTATION = [
  'behavioural',
  'technical',
  'situational',
  'behavioural',
  'technical',
  'situational',
  'behavioural',
  'technical',
  'situational',
  'behavioural',
];

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessionId: null,
  targetRole: '',
  seniority: 'Senior',
  questionType: 'mixed',
  resumeId: null,
  currentQuestion: null,
  currentEvaluation: null,
  questionNumber: 1,
  totalQuestions: 10,
  transcript: '',
  isRecording: false,
  usedChunkIds: [],
  questionTypes: QUESTION_TYPE_ROTATION,
  lastScore: null,

  setSession: (id, role, seniority, resumeId) =>
    set({
      sessionId: id,
      targetRole: role,
      seniority,
      resumeId,
      usedChunkIds: [],
      questionNumber: 1,
      lastScore: null,
    }),

  setTargetRole: (role) => set({ targetRole: role }),
  setSeniority: (level) => set({ seniority: level }),
  setQuestion: (q) => set({ currentQuestion: q }),
  setEvaluation: (e) => set({ currentEvaluation: e }),
  setTranscript: (t) => set({ transcript: t }),
  setRecording: (val) => set({ isRecording: val }),
  setLastScore: (score) => set({ lastScore: score }),

  addUsedChunk: (chunkId) =>
    set((s) => ({
      usedChunkIds: [...s.usedChunkIds, chunkId],
    })),

  getCurrentQuestionType: () => {
    const { questionNumber, questionTypes } = get();
    return questionTypes[(questionNumber - 1) % questionTypes.length];
  },

  nextQuestion: () =>
    set((s) => ({
      questionNumber: s.questionNumber + 1,
      currentQuestion: null,
      currentEvaluation: null,
      transcript: '',
      lastScore: null,
    })),

  resetSession: () =>
    set({
      sessionId: null,
      currentQuestion: null,
      currentEvaluation: null,
      questionNumber: 1,
      transcript: '',
      isRecording: false,
      usedChunkIds: [],
      lastScore: null,
    }),
}));