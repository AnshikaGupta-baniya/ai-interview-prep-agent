import api from './api';
import {
  SessionStartResponse,
  QuestionResponse,
  EvaluationResponse,
  SessionSummary
} from '../types';

export const sessionService = {

  start: async (
    resumeId: string,
    targetRole: string,
    seniority: string,
    questionType: string = 'mixed'
  ): Promise<SessionStartResponse> => {
    const res = await api.post('/session/start', {
      resume_id: resumeId,
      target_role: targetRole,
      seniority: seniority.toLowerCase(),
      question_type: questionType,
    });
    return res.data;
  },

  generateQuestion: async (
    sessionId: string,
    isFollowup: boolean = false,
    weakDimension?: string
  ): Promise<QuestionResponse> => {
    const res = await api.post('/question/generate', {
      session_id: sessionId,
      is_followup: isFollowup,
      weak_dimension: weakDimension,
    });
    return res.data;
  },

  transcribe: async (
    audioUri: string,
    questionId: string
  ): Promise<{ transcript: string; confidence: number }> => {
    const formData = new FormData();
    formData.append('audio_file', {
      uri: audioUri,
      name: 'answer.m4a',
      type: 'audio/m4a',
    } as any);
    formData.append('question_id', questionId);

    const res = await api.post('/answer/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  evaluate: async (
    questionId: string,
    sessionId: string,
    transcript: string
  ): Promise<EvaluationResponse> => {
    const res = await api.post('/answer/evaluate', {
      question_id: questionId,
      session_id: sessionId,
      transcript,
    });
    return res.data;
  },

  getHistory: async (userId: string = 'anonymous'): Promise<SessionSummary[]> => {
    const res = await api.get(`/session/history?user_id=${userId}`);
    return res.data;
  },

};