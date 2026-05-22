import api from './api';
import { ResumeUploadResponse } from '../types';

export const resumeService = {
  upload: async (
    fileUri: string,
    fileName: string,
    mimeType: string,
    userId: string = 'anonymous'
  ): Promise<ResumeUploadResponse> => {
    const formData = new FormData();

    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    formData.append('user_id', userId);

    const res = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data;
  },
};

