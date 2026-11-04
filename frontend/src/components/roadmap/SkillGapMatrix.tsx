import React from 'react';
import { SkillGapItem } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface SkillGapMatrixProps {
  items: SkillGapItem[];
  selectedSkill?: string;
  onSelectSkill?: (skill: string) => void;
  onUnbridgeSkill?: (skill: string) => void;
}

export const SkillGapMatrix: React.FC<SkillGapMatrixProps> = ({
  items,
  selectedSkill,
  onSelectSkill,
  onUnbridgeSkill,
}) => {
  const { t, language } = useLanguage();

  const totalSkills = items.length;
  const verifiedCount = items.filter((i) => i.status === 'matched').length;
  const bridgedCount = items.filter((i) => i.status === 'bridged').length;
  const gapCount = items.filter((i) => i.status === 'critical_gap' || i.status === 'moderate').length;

  const qualifiedCount = verifiedCount + bridgedCount;
  const coveragePercent = totalSkills > 0 ? Math.round((qualifiedCount / totalSkills) * 100) : 0;
  const averageCandidateLevel = totalSkills > 0 ? Math.round(items.reduce((acc, curr) => acc + curr.candidate_level, 0) / totalSkills) : 0;
  const averageRequiredLevel = totalSkills > 0 ? Math.round(items.reduce((acc, curr) => acc + curr.required_level, 0) / totalSkills) : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header & Meta Summary */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-extrabold uppercase tracking-wider">
                📊 {t('roadmap.matrix_title')}
              </span>
              <span className="text-[11px] text-slate-400">
                {language === 'vi' ? 'Đối chiếu năng lực thực tế' : 'Competency Benchmark'}
              </span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              {language === 'vi' ? 'Chỉ Số Khoảng Trống Năng Lực' : 'Skill Readiness Overview'}
            </h3>
          </div>

          <div className="text-right flex items-center gap-2 sm:flex-col sm:items-end">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              {t('roadmap.coverage')}:
            </div>
            <div className="text-base font-black text-emerald-400 flex items-center gap-1.5">
              <span>{qualifiedCount}/{totalSkills}</span>
              <span className="text-xs font-normal text-slate-400">({coveragePercent}%)</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar (Coverage) */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <span>🎯 Điểm năng lực trung bình:</span>
              <strong className="text-white font-mono">{averageCandidateLevel}%</strong>
              <span className="text-slate-500">/ Mục tiêu {averageRequiredLevel}%</span>
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
              coveragePercent >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {coveragePercent >= 80
                ? (language === 'vi' ? '✓ Đạt chuẩn ứng tuyển' : '✓ Ready for Interview')
                : (language === 'vi' ? '⚠️ Cần bổ sung 48h Sprint' : '⚠️ Gaps Need 48h Sprint')}
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>{verifiedCount} Đã xác thực</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
              <span>{bridgedCount} Bổ sung qua GitHub</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
              <span>{gapCount} Cần bổ sung</span>
            </span>
          </div>
        </div>

        {/* Interactive Skill Items List */}
        <div className="space-y-3 pt-1">
          {items.map((item) => {
            const isSelected = selectedSkill?.toLowerCase() === item.skill.toLowerCase();
            const isBridged = item.status === 'bridged';
            const isMatched = item.status === 'matched';
            const isGap = !isMatched && !isBridged;

            return (
              <div
                key={item.skill}
                onClick={() => onSelectSkill && onSelectSkill(item.skill)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/30 border-sky-500 ring-1 ring-sky-500/50 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Skill Name & Status Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-xs sm:text-sm">{item.skill}</span>
                    {isSelected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">
                        🎯 {language === 'vi' ? 'Đang chọn' : 'Selected'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isMatched && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold flex items-center gap-1">
                        <span>✓</span>
                        <span>{t('roadmap.status_matched')}</span>
                      </span>
                    )}
                    {isBridged && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-extrabold flex items-center gap-1 animate-pulse">
                          <span>🛡️</span>
                          <span>{t('roadmap.status_bridged')}</span>
                        </span>
                        {onUnbridgeSkill && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnbridgeSkill(item.skill);
                            }}
                            title="Hủy liên kết và làm lại"
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                          >
                            ↺
                          </button>
                        )}
                      </div>
                    )}
                    {isGap && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{t('roadmap.status_gap')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>
                      {language === 'vi' ? 'Năng lực:' : 'Level:'}{' '}
                      <strong className={isBridged ? 'text-emerald-300 font-bold' : isMatched ? 'text-sky-300 font-bold' : 'text-amber-400 font-bold'}>
                        {item.candidate_level}%
                      </strong>
                    </span>
                    {isBridged && (
                      <span className="text-[10px] text-emerald-400 font-sans font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        +62% GitHub Boost
                      </span>
                    )}
                  </div>
                  <span>
                    {language === 'vi' ? 'Mục tiêu:' : 'Required:'} <strong>{item.required_level}%</strong>
                  </span>
                </div>

                {/* Multi-tier Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 relative overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full absolute top-0 left-0 transition-all duration-700 ease-out ${
                      isBridged
                        ? 'bg-gradient-to-r from-sky-400 to-emerald-400 shadow-sm'
                        : isMatched
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.candidate_level}%` }}
                  />
                  {/* Target Threshold Indicator line */}
                  <div
                    className="border-r-2 border-white/80 h-2.5 absolute top-0 z-10"
                    style={{ left: `${item.required_level}%` }}
                    title={`Mục tiêu yêu cầu: ${item.required_level}%`}
                  />
                </div>

                {/* Footer action prompt */}
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  {isGap && (
                    <span className="text-amber-400/90 font-medium flex items-center gap-1 hover:text-amber-300">
                      <span>⚡</span>
                      <span>{language === 'vi' ? 'Bấm để tạo kế hoạch 48h bù đắp kỹ năng này' : 'Click to scaffold 48h Sprint for this skill'}</span>
                      <span>→</span>
                    </span>
                  )}
                  {isBridged && (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span>✓</span>
                      <span>{language === 'vi' ? 'Đã có repo GitHub chứng minh năng lực thực tế' : 'GitHub repo verified and indexed'}</span>
                    </span>
                  )}
                  {isMatched && (
                    <span className="text-slate-500 font-medium">
                      {language === 'vi' ? '✓ Đã có sẵn trong hồ sơ năng lực' : '✓ Verified in profile baseline'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>💡 {language === 'vi' ? 'Mẹo: Bấm vào bất kỳ kỹ năng nào bên trên để chuyển trọng tâm cho kế hoạch 48h bên phải.' : 'Tip: Click any skill above to switch the target of the 48h Sprint Studio.'}</span>
      </div>
    </div>
  );
};

