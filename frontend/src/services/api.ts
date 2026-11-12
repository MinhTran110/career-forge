import axios from 'axios';
import { ApiKeyStatus, CandidateProfile, GenerateQuestionsResponse, Job, User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token Management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('cf_access_token');
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('cf_access_token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('cf_access_token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Initialize Token on startup
const storedToken = getAuthToken();
if (storedToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// Request interceptor to ensure header is set
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auto ensure demo user login if no token exists
export const ensureAuthenticated = async (): Promise<string> => {
  let token = getAuthToken();
  if (token) {
    try {
      await apiClient.get('/auth/me');
      return token;
    } catch {
      setAuthToken(null);
    }
  }

  // Register or login a default engineer session
  const defaultEmail = 'alex.engineer@careerforge.dev';
  const defaultPassword = 'SecurePassword123!';
  try {
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: defaultEmail,
      password: defaultPassword,
    });
    token = loginRes.data.access_token;
    setAuthToken(token);
    return token!;
  } catch {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email: defaultEmail,
        password: defaultPassword,
        full_name: 'Alex Senior AI Engineer',
      });
      const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: defaultEmail,
        password: defaultPassword,
      });
      token = loginRes.data.access_token;
      setAuthToken(token);
      return token!;
    } catch (err) {
      console.error('Failed to auto-authenticate demo user:', err);
      return '';
    }
  }
};

// Auth APIs
export const loginUser = async (email: string, password: string): Promise<string> => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
  const token = response.data.access_token;
  setAuthToken(token);
  return token;
};

export const registerUser = async (email: string, password: string, fullName: string): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    email,
    password,
    full_name: fullName,
  });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

// Profile & Evidence Lake APIs
export const getMyProfile = async (): Promise<CandidateProfile> => {
  await ensureAuthenticated();
  const response = await apiClient.get<CandidateProfile>('/profile/me');
  return response.data;
};

export const uploadCvProfile = async (formData: FormData): Promise<any> => {
  await ensureAuthenticated();
  const response = await apiClient.post('/profile/setup', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Job Radar APIs
export const getRecommendedJobs = async (): Promise<Job[]> => {
  await ensureAuthenticated();
  const response = await apiClient.get<Job[]>('/radar/jobs');
  return response.data;
};

export const triggerRadarScan = async (): Promise<Job[]> => {
  await ensureAuthenticated();
  const response = await apiClient.post<Job[]>('/radar/scan');
  return response.data;
};

export const analyzeCustomJd = async (payload: {
  title: string;
  company: string;
  description: string;
  salary_range?: string;
  location?: string;
  url?: string;
}): Promise<Job> => {
  await ensureAuthenticated();
  const response = await apiClient.post<Job>('/radar/analyze-custom-jd', payload);
  return response.data;
};

// Application & ATS APIs
export const startApplicationTailor = async (jobId: string) => {
  await ensureAuthenticated();
  const response = await apiClient.post('/applications/tailor', { job_id: jobId });
  return response.data;
};

export const compilePdf = async (markdownContent: string): Promise<Blob> => {
  const response = await apiClient.post(
    '/documents/compile-pdf',
    { markdown_content: markdownContent },
    { responseType: 'blob' }
  );
  return response.data;
};

// API Key Configuration APIs
export const getApiKeyStatus = async (): Promise<ApiKeyStatus> => {
  const response = await apiClient.get<ApiKeyStatus>('/profile/api-key-status');
  return response.data;
};

export const setApiKey = async (apiKey: string, provider: string = 'gemini', model: string = 'gemini-1.5-flash') => {
  const response = await apiClient.post('/profile/set-api-key', {
    api_key: apiKey,
    provider,
    model,
  });
  return response.data;
};

// Interview & Question Generation APIs
export const generateInterviewQuestionsFromCv = async (payload: {
  job_id?: string;
  job_title?: string;
  job_description?: string;
  cv_skills?: string[];
  target_requirements?: string[];
  num_questions?: number;
}): Promise<GenerateQuestionsResponse> => {
  await ensureAuthenticated();
  const response = await apiClient.post<GenerateQuestionsResponse>(
    '/interviews/generate-questions-from-cv',
    payload
  );
  return response.data;
};

export const createInterviewSession = async (jobId?: string, title?: string) => {
  await ensureAuthenticated();
  const response = await apiClient.post('/interviews/session', {
    job_id: jobId,
    title,
  });
  return response.data;
};

export const submitInterviewAnswer = async (sessionId: string, questionIndex: number, answerText: string) => {
  await ensureAuthenticated();
  const response = await apiClient.post(`/interviews/${sessionId}/answer`, {
    question_index: questionIndex,
    answer_text: answerText,
  });
  return response.data;
};

export interface PromptTailorResponse {
  updated_markdown: string;
  feedback: string;
  new_transformations: Array<{
    id: string;
    original: string;
    improved: string;
    grounded_source: string;
    skill_tag: string;
    impact: string;
    applied: boolean;
  }>;
  score_delta: string | null;
}

export const promptTailorResume = async (payload: {
  prompt: string;
  current_resume_markdown: string;
  job_id?: string;
  target_job_title?: string;
  target_skills?: string[];
  company?: string;
}): Promise<PromptTailorResponse> => {
  await ensureAuthenticated();
  const response = await apiClient.post<PromptTailorResponse>(
    '/applications/prompt-tailor',
    payload
  );
  return response.data;
};



