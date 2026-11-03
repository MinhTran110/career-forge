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
      <button onClick={onBack} className="text-xs text-slate-400 hover:text-white">← Back to Radar</button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex justify-between items-center">
        <div>
          <span className="text-xs text-sky-400 font-bold uppercase">{job.company}</span>
          <h1 className="text-2xl font-bold text-white mt-1">{job.title}</h1>
          <p className="text-sm text-slate-400 mt-1">{job.location} • {job.salary_range}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onStartInterview}>Mock Interview</Button>
          <Button variant="primary" onClick={onOptimize}>Tailor Resume</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkillGapMatrix
          items={[
            { skill: 'FastAPI / Asyncio', candidate_level: 95, required_level: 90, status: 'matched' },
            { skill: 'Kubernetes / Microservices', candidate_level: 70, required_level: 85, status: 'moderate' },
            { skill: 'vLLM / Triton Serving', candidate_level: 30, required_level: 80, status: 'critical_gap' },
          ]}
        />
        <MiniProjectCard
          plan={{
            id: 'proj_1',
            title: 'Build a Distributed vLLM Cache Gateway',
            objective: 'Implement high-throughput KV cache router with FastAPI and Redis to solve target job requirement.',
            estimated_hours: 12,
            steps: [
              { hour: 4, description: 'Set up vLLM engine instance', deliverable: 'Local endpoint' },
              { hour: 8, description: 'Connect Redis cluster caching layer', deliverable: 'Benchmark report' },
              { hour: 12, description: 'Add GitHub Actions CI pipeline', deliverable: 'Verifiable repo link' },
            ],
          }}
        />
      </div>
    </div>
  );
};
