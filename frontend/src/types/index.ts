export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: 'Remote' | 'Hybrid' | 'Onsite' | string;
  url: string;
  description: string;
  requirements: string[];
  tech_stack: string[];
  match_score: number;
  tier?: 'safe' | 'target' | 'reach' | string;
  matched_skills?: string[];
  missing_skills?: string[];
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
  agent?: string;
  status?: 'info' | 'draft' | 'critic_alert' | 'critic_revision' | 'approved' | string;
  thought?: string;
  message: string;
  timestamp: string;
}

export interface CandidateProfile {
  user_id: string;
  email: string;
  full_name: string;
  headline: string;
  github_username: string;
  verified_skills: string[];
  github_metrics: {
    total_commits?: number;
    repositories_analyzed?: number;
    top_languages?: string[];
  };
  verified_repos: string[];
  qdrant_indexed: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

