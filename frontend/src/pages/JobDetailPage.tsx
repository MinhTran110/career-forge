import React from 'react';
import { Job } from '@/types';
import { Button } from '@/components/common/Button';
import { SkillGapMatrix } from '@/components/roadmap/SkillGapMatrix';
import { MiniProjectCard } from '@/components/roadmap/MiniProjectCard';

interface JobDetailPageProps {
  job: Job;
  onBack: () => void;
  onOptimize: () => void;
  onStartInterview: () => void;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({ job, onBack, onOptimize, onStartInterview }) => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span>
          <span>Back to Opportunity Radar</span>
        </button>

        <div className="text-xs text-slate-400 font-medium">
          Step 3: Skill Gap Analysis & 48h Sprint Blueprint
        </div>
      </div>

      {/* Target Job Header Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-sky-400 font-extrabold uppercase tracking-wider">{job.company}</span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 font-bold">
              {job.match_score}% Match
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{job.title}</h1>
          <p className="text-xs text-slate-400">
            {job.location} • <span className="text-slate-300 font-semibold">{job.salary_range}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={onStartInterview} className="cursor-pointer">
            🎙 Mock Interview
          </Button>
          <Button variant="primary" onClick={onOptimize} className="cursor-pointer flex items-center gap-2">
            <span>Next: Tailor Resume (Google X-Y-Z)</span>
            <span>→</span>
          </Button>
        </div>
      </div>

      {/* Two Column Skill Gap and 48h Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkillGapMatrix
          items={[
            { skill: 'FastAPI / Asyncio Microservices', candidate_level: 95, required_level: 90, status: 'matched' },
            { skill: 'Docker Containerization & CI/CD', candidate_level: 90, required_level: 85, status: 'matched' },
            { skill: 'Redis Cache & Connection Pooling', candidate_level: 85, required_level: 85, status: 'matched' },
            { skill: 'Kubernetes Orchestration', candidate_level: 65, required_level: 85, status: 'moderate' },
            { skill: 'vLLM / Triton High-Throughput Serving', candidate_level: 30, required_level: 80, status: 'critical_gap' },
          ]}
        />
        <MiniProjectCard
          plan={{
            id: 'proj_1',
            title: `48h Sprint: High-Throughput ${job.title.split('/')[0].trim()} Capstone`,
            objective: 'Build and verify an open-source prototype implementing missing skills to generate verifiable commit proof.',
            estimated_hours: 48,
            steps: [
              { hour: 12, description: 'Milestone 1: Scaffold architecture and data contract in Docker', deliverable: 'Local repo & Compose' },
              { hour: 24, description: 'Milestone 2: Implement async pipeline & connection pool logic', deliverable: 'End-to-end API' },
              { hour: 36, description: 'Milestone 3: Benchmark latency metrics (p95/p99) with Locust', deliverable: 'Documented test metrics' },
              { hour: 48, description: 'Milestone 4: Tag GitHub v1.0.0 release & index evidence lake', deliverable: 'Ground-truth commit proof' },
            ],
          }}
        />
      </div>

      {/* Bottom Stage Transition Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
        >
          <span>← Back to Radar</span>
        </button>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onStartInterview} className="cursor-pointer">
            Mock Room
          </Button>
          <Button variant="primary" onClick={onOptimize} className="cursor-pointer inline-flex items-center gap-2">
            <span>Next: Tailor ATS Resume</span>
            <span>→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
