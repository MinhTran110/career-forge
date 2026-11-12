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
  status: 'matched' | 'moderate' | 'critical_gap' | 'bridged';
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
  profile_id?: string;
  email: string;
  full_name: string;
  headline: string;
  github_username: string;
  verified_skills: string[];
  github_metrics: {
    username?: string;
    total_commits?: number;
    total_repos?: number;
    repositories_analyzed?: number;
    top_languages?: string[];
  };
  verified_repos: any[];
  qdrant_indexed: boolean;
  cv_metadata?: {
    filename?: string;
    file_size?: number;
    mime_type?: string;
    uploaded_at?: string;
    indexed_chunks_count?: number;
  };
  storage_info?: {
    rdbms_table?: string;
    rdbms_record_id?: string;
    vector_collection?: string;
    vector_count?: number;
    vector_dimension?: number;
    distance_metric?: string;
  };
  evidence_chunks?: {
    point_id?: string;
    text: string;
    source: string;
    category: string;
    score?: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface InterviewQuestionItem {
  id: string;
  category: string;
  question: string;
  skill_evaluated: string;
  cv_evidence_context: string;
  sample_star_answer: string;
  tips_for_candidate: string;
  user_answer?: string;
  star_evaluation?: {
    situation_score: number;
    task_score: number;
    action_score: number;
    result_score: number;
    overall_score: number;
    strengths: string[];
    improvements: string[];
    recommended_answer: string;
  };
}

export interface GenerateQuestionsResponse {
  job_title: string;
  matched_skills: string[];
  missing_skills: string[];
  questions: InterviewQuestionItem[];
}

export interface ApiKeyStatus {
  is_configured: boolean;
  provider: string;
  model: string;
  masked_key: string;
}



