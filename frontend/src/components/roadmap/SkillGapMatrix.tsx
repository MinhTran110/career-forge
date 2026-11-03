import React from 'react';
import { SkillGapItem } from '@/types';

export const SkillGapMatrix: React.FC<{ items: SkillGapItem[] }> = ({ items }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Competency Gap Matrix</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.skill} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-200">{item.skill}</span>
              <span className="text-slate-400">Target: {item.required_level}% | Current: {item.candidate_level}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 relative overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full absolute top-0 left-0"
                style={{ width: `${item.candidate_level}%` }}
              />
              <div
                className="border-r-2 border-amber-400 h-2 absolute top-0"
                style={{ left: `${item.required_level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
