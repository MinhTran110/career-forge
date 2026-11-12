import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export interface AgentStepperProps {
  currentStepIndex: number;
  onNavigateToStep?: (stepIndex: number) => void;
  className?: string;
}

export const AgentStepper: React.FC<AgentStepperProps> = ({
  currentStepIndex,
  onNavigateToStep,
  className = '',
}) => {
  const { t, language } = useLanguage();

  // Persistent completed steps stored in localStorage
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('cf_completed_steps');
      return saved ? JSON.parse(saved) : [0]; // Step 0 (Job radar) done by default
    } catch {
      return [0];
    }
  });

  const [selectedStepModal, setSelectedStepModal] = useState<number | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cf_completed_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Auto-mark previous steps when user progresses
  useEffect(() => {
    if (!completedSteps.includes(currentStepIndex) && currentStepIndex > 0) {
      setCompletedSteps((prev) => Array.from(new Set([...prev, currentStepIndex - 1])));
    }
  }, [currentStepIndex]);

  const toggleStepCompleted = (stepIdx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedSteps((prev) => {
      if (prev.includes(stepIdx)) {
        return prev.filter((idx) => idx !== stepIdx);
      } else {
        return [...prev, stepIdx];
      }
    });
  };

  const stepsData = [
    {
      id: 'radar',
      title: t('step.1.title'),
      desc: t('step.1.desc'),
      agent: 'Specialist #1: Candidate Profiler & Market Hunter',
      detailsVi: 'Trích xuất văn bản từ CV/Ảnh (OCR) và GitHub GraphQL, nạp bằng chứng vào Qdrant Vector Lake và quét đối chiếu việc làm theo 3 mức độ (Vừa sức, Mục tiêu, Thử thách).',
      detailsEn: 'Extracts CV claims & audits GitHub repositories into Qdrant Vector Lake, scanning real-time jobs into 3 match tiers.',
      targetPage: 0, // Dashboard
    },
    {
      id: 'swarm',
      title: t('step.2.title'),
      desc: t('step.2.desc'),
      agent: 'Specialist #2: Actor-Critic Swarm',
      detailsVi: 'Resume Strategist (Actor) và Fact Checker (Critic) tranh luận trực tiếp: phát hiện và loại bỏ ảo giác, kiểm toán từng số liệu với Vector Lake.',
      detailsEn: 'Live debate between Resume Strategist and Fact Checker (Critic Auditor) eliminating hallucinations against verified evidence.',
      targetPage: 1, // Resume Studio (Editor)
    },
    {
      id: 'studio',
      title: t('step.3.title'),
      desc: t('step.3.desc'),
      agent: 'Specialist #3: ATS Resume Studio',
      detailsVi: 'Biên soạn các gạch đầu dòng kinh nghiệm theo công thức Google X-Y-Z chuẩn ATS, đối chiếu bảng Before vs After Diff và xuất Markdown.',
      detailsEn: 'Synthesizes bullet points using Google X-Y-Z formula, displays Before vs After Diff, and exports ATS Markdown.',
      targetPage: 1, // Resume Studio (Editor)
    },
    {
      id: 'interview',
      title: t('step.4.title'),
      desc: t('step.4.desc'),
      agent: 'Specialist #4: STAR Interview Coach',
      detailsVi: 'Phòng luyện phỏng vấn kỹ thuật sát theo JD, đánh giá câu trả lời theo rubric 4 trụ cột STAR (Situation, Task, Action, Result).',
      detailsEn: 'Technical mock interview simulator with real-time scoring across the 4 STAR pillars (Situation, Task, Action, Result).',
      targetPage: 2, // Mock Interview
    },
  ];

  return (
    <>
      <div className={`w-full bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl shadow-lg backdrop-blur overflow-x-auto ${className}`}>
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {stepsData.map((step, idx) => {
            const isCompleted = completedSteps.includes(idx);
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                onClick={() => setSelectedStepModal(idx)}
                className="flex items-center gap-2 transition-all select-none cursor-pointer group"
                title={`${step.title} - ${isCompleted ? t('step.completed') : isCurrent ? t('step.in_progress') : t('step.pending')}`}
              >
                {/* Circle Badge */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black border transition-all shadow-md shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 group-hover:scale-105'
                      : isCurrent
                      ? 'bg-sky-500 border-sky-300 text-slate-950 font-black shadow-sky-500/30 shadow-lg scale-110 animate-pulse'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-400 group-hover:border-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                {/* Step Text */}
                <div className="flex flex-col text-left">
                  <span
                    className={`text-xs font-bold whitespace-nowrap transition-colors ${
                      isCurrent
                        ? 'text-sky-300 font-extrabold'
                        : isCompleted
                        ? 'text-emerald-400/90 group-hover:text-emerald-300'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {step.desc}
                  </span>
                </div>

                {/* Connecting Divider */}
                {idx < stepsData.length - 1 && (
                  <div
                    className={`w-3 sm:w-6 h-0.5 mx-1 transition-colors ${
                      isCompleted ? 'bg-emerald-500/50' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Step Inspector Modal */}
      {selectedStepModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
                  {stepsData[selectedStepModal].agent}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">
                  {stepsData[selectedStepModal].title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStepModal(null)}
                className="text-slate-400 hover:text-white text-lg p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {language === 'vi'
                ? stepsData[selectedStepModal].detailsVi
                : stepsData[selectedStepModal].detailsEn}
            </p>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400">
                {language === 'vi' ? 'Trạng thái giai đoạn:' : 'Stage Status:'}{' '}
                <strong className={completedSteps.includes(selectedStepModal) ? 'text-emerald-400' : 'text-amber-400'}>
                  {completedSteps.includes(selectedStepModal) ? t('step.completed') : t('step.in_progress')}
                </strong>
              </span>

              <button
                onClick={(e) => toggleStepCompleted(selectedStepModal, e)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  completedSteps.includes(selectedStepModal)
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                {completedSteps.includes(selectedStepModal)
                  ? `✕ ${t('step.mark_undone')}`
                  : `✓ ${t('step.mark_done')}`}
              </button>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedStepModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
              <button
                onClick={() => {
                  const target = stepsData[selectedStepModal].targetPage;
                  setSelectedStepModal(null);
                  if (onNavigateToStep) onNavigateToStep(selectedStepModal);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>{t('step.go_to')}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
