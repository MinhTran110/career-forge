import React from 'react';
import { StarScores } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export const LiveStarScoreboard: React.FC<{ scores: StarScores }> = ({ scores }) => {
  const { language } = useLanguage();
  const items = [
    { label: 'Situation (S)', score: scores.situation },
    { label: 'Task (T)', score: scores.task },
    { label: 'Action (A)', score: scores.action },
    { label: 'Result (R)', score: scores.result },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-white">
          {language === 'vi' ? 'Bảng điểm STAR thời gian thực' : 'Live STAR Scoreboard'}
        </h4>
        <span className="text-sm font-extrabold text-sky-400">
          {scores.composite}% {language === 'vi' ? 'Tổng thể' : 'Overall'}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div key={item.label} className="bg-slate-800/80 p-3 rounded-lg text-center">
            <span className="block text-[11px] text-slate-400 font-medium">{item.label}</span>
            <span className="text-base font-bold text-slate-100">{item.score}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
        <p className="font-semibold text-emerald-400">
          {language === 'vi' ? 'Điểm mạnh:' : 'Strengths:'} {scores.strengths.join(', ')}
        </p>
        <p className="font-semibold text-amber-400">
          {language === 'vi' ? 'Gợi ý cải thiện:' : 'Suggestions:'} {scores.improvements.join(', ')}
        </p>
      </div>
    </div>
  );
};
