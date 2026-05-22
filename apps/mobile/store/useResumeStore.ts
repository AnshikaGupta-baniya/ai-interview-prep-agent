import { create } from 'zustand';
import { ResumeUploadResponse } from '../types';

interface ResumeStore {
  resume: ResumeUploadResponse | null;
  isUploading: bool;
  uploadProgress: number;
  setResume: (resume: ResumeUploadResponse) => void;
  setUploading: (val: bool) => void;
  setProgress: (val: number) => void;
  clearResume: () => void;
}

export const useResumeStore = create((set) => ({
  resume: null,
  isUploading: false,
  uploadProgress: 0,
  setResume: (resume) => set({ resume }),
  setUploading: (val) => set({ isUploading: val }),
  setProgress: (val) => set({ uploadProgress: val }),
  clearResume: () => set({ resume: null, uploadProgress: 0 }),
}));
