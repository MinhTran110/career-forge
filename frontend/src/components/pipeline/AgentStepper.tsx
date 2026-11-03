import React from 'react';

const AGENTS = [
  'Market Hunter',
  'Candidate Profiler',
  'Skill Strategist',
  'Resume Strategist',
  'Fact Checker',
  'STAR Interviewer',
];

export const AgentStepper: React.FC<{ currentStepIndex: number }> = ({ currentStepIndex }) => {
  return (
    <div className="flex items-center justify-between w-full bg-slate-900 border border-slate-800 p-4 rounded-xl">
      {AGENTS.map((name, idx) => {
        const isDone = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        return (
          <div key={name} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                isDone
                  ? 'bg-emerald-500 border-emerald-400 text-black'
                  : isCurrent
                  ? 'bg-sky-500 border-sky-400 text-black animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {isDone ? '✓' : idx + 1}
            </div>
            <span className={`text-xs font-medium hidden md:inline ${isCurrent ? 'text-sky-300 font-bold' : 'text-slate-400'}`}>
              {name}
            </span>
            {idx < AGENTS.length - 1 && <div className="w-4 h-0.5 bg-slate-800 mx-1 hidden lg:block" />}
          </div>
        );
      })}
    </div>
  );
};
