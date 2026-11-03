export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: 'Remote' | 'Hybrid' | 'Onsite';
  url: string;
  description: string;
  requirements: string[];
  tech_stack: string[];
  match_score: number;
}

export interface SkillGapItem {
  skill: string;
  candidate_level: number; // 0 - 100
  required_level: number;  // 0 - 100
  status: 'matched' | 'moderate' | 'critical_gap';
}

export interface MiniProjectPlan {
  id: string;
  title: string;
  objective: string;
  estimated_hours: number;
  steps: { hour: number; description: string; deliverable: string }[];
}

export interface StarScores {
  situation: number;
  task: number;
  action: number;
  result: number;
  composite: number;
  strengths: string[];
  improvements: string[];
}

export interface AgentEvent {
  step: string;
  message: string;
  timestamp: string;
}
