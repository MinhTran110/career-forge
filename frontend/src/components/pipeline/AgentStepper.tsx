import React from 'react';

const STEPS = [
  { id: 'radar', title: '1. Quét việc làm', desc: 'Tìm vị trí phù hợp' },
  { id: 'profiler', title: '2. Phân tích hồ sơ', desc: 'Xác thực năng lực thật' },
  { id: 'skills', title: '3. So sánh kỹ năng', desc: 'Lộ trình bổ sung' },
  { id: 'resume', title: '4. Tối ưu hóa CV', desc: 'Viết lại chuẩn nộp đơn' },
  { id: 'audit', title: '5. Kiểm chứng sự thật', desc: 'Loại bỏ bịa đặt' },
  { id: 'interview', title: '6. Luyện phỏng vấn', desc: 'Mô phỏng trả lời' },
];

export const AgentStepper: React.FC<{
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
}> = ({ currentStepIndex, onStepClick }) => {
  return (
    <div className="flex items-center justify-between w-full bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl shadow-lg backdrop-blur overflow-x-auto">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        return (
          <div
            key={step.id}
            onClick={() => onStepClick && onStepClick(idx)}
            className={`flex items-center gap-2.5 transition-all select-none ${
              onStepClick ? 'cursor-pointer hover:opacity-100 group' : ''
            }`}
            title={`${step.title}: ${step.desc}`}
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
            <div className="hidden sm:flex flex-col text-left">
              <span
                className={`text-xs font-bold whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-sky-300 font-extrabold'
                    : isDone
                    ? 'text-emerald-400/90 group-hover:text-emerald-300'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {step.title}
              </span>
              <span className="text-[10px] text-slate-400 hidden lg:inline">
                {step.desc}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-3 lg:w-6 h-0.5 mx-1 transition-colors hidden md:block ${
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
