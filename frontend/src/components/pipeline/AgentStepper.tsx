import React from 'react';

const AGENTS = [
  'Market Hunter',
  'Candidate Profiler',
  'Skill Strategist',
  'Resume Strategist',
  'Fact Checker',
  'STAR Interviewer',
];

export const AgentStepper: React.FC<{
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
}> = ({ currentStepIndex, onStepClick }) => {
  return (
    <div className="flex items-center justify-between w-full bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl shadow-lg backdrop-blur overflow-x-auto">
      {AGENTS.map((name, idx) => {
        const isDone = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        return (
          <div
            key={name}
            onClick={() => onStepClick && onStepClick(idx)}
            className={`flex items-center gap-2.5 transition-all select-none ${
              onStepClick ? 'cursor-pointer hover:opacity-100 group' : ''
            }`}
            title={`Step ${idx + 1}: ${name}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border transition-all shadow-md ${
                isDone
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 group-hover:scale-105'
                  : isCurrent
                  ? 'bg-sky-500 border-sky-300 text-slate-950 font-black shadow-sky-500/30 shadow-lg scale-110 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 group-hover:border-slate-500'
              }`}
            >
              {isDone ? '✓' : idx + 1}
            </div>
            <span
              className={`text-xs font-bold whitespace-nowrap transition-colors hidden sm:inline ${
                isCurrent
                  ? 'text-sky-300 font-extrabold'
                  : isDone
                  ? 'text-emerald-400/90 group-hover:text-emerald-300'
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              {name}
            </span>
            {idx < AGENTS.length - 1 && (
              <div
                className={`w-4 lg:w-8 h-0.5 mx-1 transition-colors hidden md:block ${
                  isDone ? 'bg-emerald-500/50' : 'bg-slate-800'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
