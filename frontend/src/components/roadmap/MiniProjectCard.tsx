import React from 'react';
import { MiniProjectPlan } from '@/types';
import { Button } from '../common/Button';

export const MiniProjectCard: React.FC<{ plan: MiniProjectPlan }> = ({ plan }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-bold text-white">{plan.title}</h4>
        <span className="text-xs px-2 py-1 bg-amber-950/60 text-amber-400 border border-amber-800 rounded-md font-semibold">
          ⏱ 48-Hour Sprint ({plan.estimated_hours}h)
        </span>
      </div>
      <p className="text-xs text-slate-400">{plan.objective}</p>
      <div className="space-y-2 border-t border-slate-800 pt-3">
        {plan.steps.map((s, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <span className="text-sky-400 font-bold">+{s.hour}h</span>
            <span className="text-slate-300">{s.description} ({s.deliverable})</span>
          </div>
        ))}
      </div>
      <Button variant="secondary" className="w-full text-xs">Fork Starter Repo Template</Button>
    </div>
  );
};
