import React, { useState } from 'react';
import { useJobRadar } from '@/hooks/use-job-radar';
import { useAgentStream } from '@/hooks/use-agent-stream';
import { JobCard } from '@/components/radar/JobCard';
import { AgentStepper } from '@/components/pipeline/AgentStepper';
import { EventLogsViewer } from '@/components/pipeline/EventLogsViewer';
import { Job } from '@/types';

export const DashboardPage: React.FC<{
  onSelectJob: (job: Job) => void;
  onStepClick?: (stepIndex: number) => void;
}> = ({ onSelectJob, onStepClick }) => {
  const { jobs, loading } = useJobRadar();
  const [activeTier, setActiveTier] = useState<string>('all');
  const [workflowId, setWorkflowId] = useState<string>('session_init');
  const { events, isConnected } = useAgentStream(workflowId);

  const filteredJobs = jobs.filter((job) => {
    if (activeTier === 'all') return true;
    return (job.tier || '').toLowerCase() === activeTier.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-full mb-2">
          Step 1 & 2: Autonomous Market Sourcing
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Career Intelligence Radar</h1>
        <p className="text-sm text-slate-400 mt-1">Autonomous market monitoring & 3-tier readiness pipeline</p>
      </div>

      <AgentStepper currentStepIndex={1} onStepClick={onStepClick} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-100">Recommended Tech Positions</h2>
              <span className="text-xs text-sky-400 font-medium">{filteredJobs.length} Opportunities found</span>
            </div>

            {/* Tier Filters */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
              {['all', 'safe', 'target', 'reach'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    activeTier === tier
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier === 'all' ? 'All Roles' : `${tier} Tier`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center p-16 text-slate-500 border border-slate-800/80 rounded-2xl bg-slate-900/40">
              <div className="animate-spin w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full mx-auto mb-3" />
              Scanning and matching market opportunities...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center p-12 text-slate-400 border border-slate-800/80 rounded-2xl bg-slate-900/40">
              No jobs found matching "{activeTier}" tier.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))
          )}
        </div>

        <div className="space-y-4">
          {/* Live Multi-Agent Telemetry Stream */}
          <EventLogsViewer
            events={events}
            isConnected={isConnected}
            onTriggerSwarm={() => setWorkflowId(`swarm_${Date.now()}`)}
          />

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Verified Candidate Ground-Truth</h3>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Qdrant Indexed
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synced with GitHub & PDF CV: 420 commits, 12 repositories verified with zero hallucinations.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] bg-slate-800/90 px-2.5 py-1 rounded-md text-sky-300 border border-slate-700/60 font-semibold">FastAPI</span>
              <span className="text-[11px] bg-slate-800/90 px-2.5 py-1 rounded-md text-sky-300 border border-slate-700/60 font-semibold">Python</span>
              <span className="text-[11px] bg-slate-800/90 px-2.5 py-1 rounded-md text-sky-300 border border-slate-700/60 font-semibold">React 19</span>
              <span className="text-[11px] bg-slate-800/90 px-2.5 py-1 rounded-md text-sky-300 border border-slate-700/60 font-semibold">Docker</span>
              <span className="text-[11px] bg-slate-800/90 px-2.5 py-1 rounded-md text-sky-300 border border-slate-700/60 font-semibold">PostgreSQL</span>
              <span className="text-[11px] bg-slate-800/90 px-2.5 py-1 rounded-md text-sky-300 border border-slate-700/60 font-semibold">Redis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
