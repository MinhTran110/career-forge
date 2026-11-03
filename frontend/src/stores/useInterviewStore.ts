import { create } from 'zustand';
import { StarScores } from '@/types';

interface InterviewState {
  sessionId: string | null;
  currentQuestion: string;
  isRecording: boolean;
  scores: StarScores | null;
  setSessionId: (id: string) => void;
  setCurrentQuestion: (q: string) => void;
  setIsRecording: (recording: boolean) => void;
  setScores: (scores: StarScores) => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionId: null,
  currentQuestion: 'Describe a situation where you had to debug a low-level race condition in production.',
  isRecording: false,
  scores: null,
  setSessionId: (id) => set({ sessionId: id }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setScores: (scores) => set({ scores }),
}));
