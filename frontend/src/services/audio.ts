import { apiClient } from './api';

export const uploadInterviewAudio = async (sessionId: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'answer.wav');

  const response = await apiClient.post(`/interviews/sessions/${sessionId}/evaluate-audio`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
