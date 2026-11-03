import React from 'react';
import { Job } from '@/types';
import { MatchScoreGauge } from './MatchScoreGauge';
import { Badge } from '../common/Badge';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 p-5 rounded-xl transition-all shadow-lg flex justify-between items-start">
      <div className="space-y-2 max-w-xl">
        <div className="flex items-center gap-2">
          <Badge label={job.job_type} variant="info" />
          <span className="text-xs text-slate-400">{job.location}</span>
        </div>
        <h3 className="text-lg font-bold text-white hover:text-sky-400 transition-colors cursor-pointer" onClick={() => onSelect(job)}>
          {job.title}
        </h3>
        <p className="text-sm font-medium text-slate-300">{job.company} • {job.salary_range}</p>
        <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {job.tech_stack.map((tech) => (
            <span key={tech} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {tech}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <MatchScoreGauge score={job.match_score} />
        <button
          onClick={() => onSelect(job)}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};
