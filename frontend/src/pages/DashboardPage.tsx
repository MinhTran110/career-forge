import React from 'react';
import { useJobRadar } from '@/hooks/use-job-radar';
import { JobCard } from '@/components/radar/JobCard';
import { AgentStepper } from '@/components/pipeline/AgentStepper';
import { Job } from '@/types';

export const DashboardPage: React.FC<{ onSelectJob: (job: Job) => void }> = ({ onSelectJob }) => {
  const { jobs, loading } = useJobRadar();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Career Intelligence Radar</h1>
        <p className="text-sm text-slate-400">Autonomous market monitoring & real-time readiness pipeline</p>
      </div>

      <AgentStepper currentStepIndex={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-200">Recommended Tech Positions</h2>
            <span className="text-xs text-sky-400 font-medium">{jobs.length} Opportunities found</span>
          </div>

          {loading ? (
            <div className="text-center p-12 text-slate-500">Scanning market jobs...</div>
          ) : (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Verified Candidate Core</h3>
            <p className="text-xs text-slate-400">Synced with GitHub: 420 commits, 12 public repos verified with 0 hallucinations.</p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-sky-300">FastAPI</span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-sky-300">React 19</span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-sky-300">Docker</span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-sky-300">Celery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
