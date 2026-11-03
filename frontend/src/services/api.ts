import axios from 'axios';
import { Job } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getRecommendedJobs = async (): Promise<Job[]> => {
  const response = await apiClient.get<Job[]>('/radar/jobs');
  return response.data;
};

export const startApplicationTailor = async (jobId: string) => {
  const response = await apiClient.post('/applications/tailor', { job_id: jobId });
  return response.data;
};

export const compilePdf = async (markdownContent: string): Promise<Blob> => {
  const response = await apiClient.post('/documents/compile-pdf', { markdown_content: markdownContent }, {
    responseType: 'blob'
  });
  return response.data;
};
