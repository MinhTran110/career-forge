import React from 'react';

export const MatchScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const colorClass = score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-slate-800 bg-slate-900/60">
      <div className="text-center">
        <span className={`text-xl font-extrabold ${colorClass}`}>{score}%</span>
        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Match</span>
      </div>
    </div>
  );
};
