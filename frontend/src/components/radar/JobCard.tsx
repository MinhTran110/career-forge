import React from 'react';
import { Job } from '@/types';
import { MatchScoreGauge } from './MatchScoreGauge';
import { Badge } from '../common/Badge';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect }) => {
  const tierColor =
    job.tier === 'safe'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
      : job.tier === 'reach'
      ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
      : 'border-amber-500/40 bg-amber-500/10 text-amber-400';

  const tierLabel =
    job.tier === 'safe' ? 'Safe Tier' : job.tier === 'reach' ? 'Reach Tier' : 'Target Tier';

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-sky-500/50 p-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:shadow-sky-950/50 flex flex-col sm:flex-row justify-between items-start gap-4 group">
      <div className="space-y-2.5 max-w-xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge label={job.job_type} variant="info" />
          {job.tier && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tierColor}`}>
              {tierLabel}
            </span>
          )}
          {job.location && job.location.toLowerCase() !== job.job_type.toLowerCase() && (
            <span className="text-xs text-slate-400">• {job.location}</span>
          )}
        </div>
        <h3
          className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors cursor-pointer"
          onClick={() => onSelect(job)}
        >
          {job.title}
        </h3>
        <p className="text-sm font-medium text-slate-300">
          <span className="text-sky-400 font-semibold">{job.company}</span> • {job.salary_range}
        </p>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {job.tech_stack.map((tech) => (
            <span
              key={tech}
              className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/50"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0">
        <MatchScoreGauge score={job.match_score} />
        <button
          onClick={() => onSelect(job)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500/15 to-indigo-500/15 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 hover:text-white border border-sky-500/40 hover:border-sky-400/80 text-xs font-bold transition-all shadow-md shadow-sky-950/40 cursor-pointer active:scale-95"
        >
          <span>View Details</span>
          <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
};
