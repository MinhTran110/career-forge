import React, { useState, useEffect } from 'react';
import { Job, MiniProjectPlan, SkillGapItem } from '@/types';
import { Button } from '@/components/common/Button';
import { SkillGapMatrix } from '@/components/roadmap/SkillGapMatrix';
import { MiniProjectCard } from '@/components/roadmap/MiniProjectCard';
import { useLanguage } from '@/context/LanguageContext';

interface JobDetailPageProps {
  job: Job;
  onBack: () => void;
  onOptimize: () => void;
  onStartInterview: () => void;
}

interface BridgedSkillData {
  repoUrl: string;
  verifiedAt: string;
  delta: number;
  commitHash: string;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({ job, onBack, onOptimize, onStartInterview }) => {
  const { t, language } = useLanguage();

  const missingSkillsList = job.missing_skills || ['Kubernetes', 'vLLM'];
  const matchedSkillsList = job.matched_skills || ['FastAPI', 'Python', 'Docker', 'Redis'];

  // State for selected skill for 48h Sprint
  const [selectedSkill, setSelectedSkill] = useState<string>(missingSkillsList[0] || 'Kubernetes');

  // State for bridged skills persisted in localStorage
  const [bridgedSkills, setBridgedSkills] = useState<Record<string, BridgedSkillData>>(() => {
    try {
      const stored = localStorage.getItem(`cf_bridged_skills_${job.id}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // State for customized plans per skill
  const [customPlans, setCustomPlans] = useState<Record<string, MiniProjectPlan>>(() => {
    try {
      const stored = localStorage.getItem(`cf_custom_plans_${job.id}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Dynamic match score calculation
  const baseMatchScore = job.match_score || 85.0;
  const bridgedCount = Object.keys(bridgedSkills).length;
  const scoreBoost = Math.round(bridgedCount * 6.5 * 10) / 10;
  const dynamicMatchScore = Math.min(99.0, Math.round((baseMatchScore + scoreBoost) * 10) / 10);

  // Build reactive items for SkillGapMatrix
  const matrixItems: SkillGapItem[] = [
    ...matchedSkillsList.map((s) => ({
      skill: s,
      candidate_level: 90,
      required_level: 85,
      status: 'matched' as const,
    })),
    ...missingSkillsList.map((s) => {
      const isBridged = Boolean(bridgedSkills[s]);
      return {
        skill: s,
        candidate_level: isBridged ? 92 : 30,
        required_level: 80,
        status: isBridged ? ('bridged' as const) : ('critical_gap' as const),
      };
    }),
  ];

  // Callback when a skill is verified via GitHub
  const handleSkillBridged = (skill: string, repoUrl: string) => {
    const updated = {
      ...bridgedSkills,
      [skill]: {
        repoUrl,
        verifiedAt: new Date().toISOString(),
        delta: 6.5,
        commitHash: '8f' + Math.random().toString(16).substring(2, 7),
      },
    };
    setBridgedSkills(updated);
    try {
      localStorage.setItem(`cf_bridged_skills_${job.id}`, JSON.stringify(updated));
      // Mark step 3 completed in AgentStepper
      const savedSteps = localStorage.getItem('cf_completed_steps');
      const parsed = savedSteps ? JSON.parse(savedSteps) : [1, 2];
      if (!parsed.includes(3)) {
        parsed.push(3);
        localStorage.setItem('cf_completed_steps', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Failed to persist bridged skill', e);
    }
  };

  // Callback to unbridge / reset a skill
  const handleUnbridgeSkill = (skill: string) => {
    const updated = { ...bridgedSkills };
    delete updated[skill];
    setBridgedSkills(updated);
    try {
      localStorage.setItem(`cf_bridged_skills_${job.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to unbridge skill', e);
    }
  };

  // Callback to save customized plan
  const handleSavePlan = (updatedPlan: MiniProjectPlan) => {
    const updated = {
      ...customPlans,
      [selectedSkill]: updatedPlan,
    };
    setCustomPlans(updated);
    try {
      localStorage.setItem(`cf_custom_plans_${job.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist custom plan', e);
    }
  };

  // Active plan for selected skill
  const activePlan: MiniProjectPlan = customPlans[selectedSkill] || {
    id: `proj_${selectedSkill.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    title: `48h Sprint: ${selectedSkill} Production Capstone Project`,
    objective: `Bổ sung kỹ năng thực chiến "${selectedSkill}" bằng việc hoàn thiện microservice containerized có automated test và benchmark đẩy lên GitHub.`,
    estimated_hours: 48,
    steps: [
      { hour: 12, description: `Milestone 1: Scaffold architecture and ${selectedSkill} skeleton with Docker`, deliverable: 'Local repo & docker-compose.yml' },
      { hour: 24, description: `Milestone 2: Implement core async logic resolving ${selectedSkill} gap`, deliverable: 'End-to-end working pipeline' },
      { hour: 36, description: 'Milestone 3: Benchmark latency metrics (p95/p99) with Locust', deliverable: 'Documented test metrics & report' },
      { hour: 48, description: 'Milestone 4: Tag GitHub v1.0.0 release & index evidence lake', deliverable: 'Ground-truth commit proof' },
    ],
  };

  const isCurrentSkillBridged = Boolean(bridgedSkills[selectedSkill]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span>
          <span>{t('detail.back_radar')}</span>
        </button>

        <div className="text-xs text-slate-400 font-medium">
          {t('detail.step_badge')}
        </div>
      </div>

      {/* Target Job Header Card */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-sky-400 font-extrabold uppercase tracking-wider">{job.company}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              job.tier === 'safe'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : job.tier === 'target'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
            }`}>
              {job.tier === 'safe'
                ? (language === 'vi' ? 'Vừa sức (Safe)' : 'Safe Tier')
                : job.tier === 'target'
                ? (language === 'vi' ? 'Mục tiêu (Target)' : 'Target Tier')
                : (language === 'vi' ? 'Thử thách (Reach)' : 'Reach Tier')}
              {' '}• {language === 'vi' ? 'Phù hợp' : 'Match'} {dynamicMatchScore}%
            </span>

            {/* Score boost tag */}
            {scoreBoost > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-extrabold animate-pulse">
                +{scoreBoost}% {language === 'vi' ? 'vừa tăng từ GitHub' : 'boosted via GitHub'}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">{job.title}</h1>
          <p className="text-xs text-slate-400">
            {job.location} • <span className="text-slate-300 font-semibold">{job.salary_range}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={onStartInterview} className="cursor-pointer text-xs">
            🎙️ {t('detail.practice_mock')}
          </Button>
          <Button variant="primary" onClick={onOptimize} className="cursor-pointer flex items-center gap-2 text-xs shadow-md">
            <span>{t('detail.next_resume')}</span>
            <span>→</span>
          </Button>
        </div>
      </div>

      {/* Missing Skills Quick Focus Bar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-bold text-sky-400">🎯 Chọn kỹ năng cần bổ sung:</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            (Bấm vào kỹ năng để thiết lập và kiểm chứng dự án 48h)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {missingSkillsList.map((skill) => {
            const isSelected = selectedSkill.toLowerCase() === skill.toLowerCase();
            const isBridged = Boolean(bridgedSkills[skill]);

            return (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md ring-2 ring-sky-400/30'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{isBridged ? '🛡️' : '⚠️'}</span>
                <span>{skill}</span>
                {isBridged && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    ✓ Đã bổ sung
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Skill Gap and 48h Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkillGapMatrix
          items={matrixItems}
          selectedSkill={selectedSkill}
          onSelectSkill={(s) => setSelectedSkill(s)}
          onUnbridgeSkill={handleUnbridgeSkill}
        />

        <MiniProjectCard
          key={`${job.id}_${selectedSkill}`}
          plan={activePlan}
          targetSkill={selectedSkill}
          onSkillBridged={handleSkillBridged}
          onSavePlan={handleSavePlan}
          isBridged={isCurrentSkillBridged}
          bridgedData={bridgedSkills[selectedSkill]}
        />
      </div>

      {/* Bottom Stage Transition Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
        >
          <span>← {t('detail.back_radar')}</span>
        </button>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onStartInterview} className="cursor-pointer text-xs">
            🎙️ {t('detail.practice_mock')}
          </Button>
          <Button variant="primary" onClick={onOptimize} className="cursor-pointer inline-flex items-center gap-2 text-xs shadow-md">
            <span>{t('detail.next_resume')}</span>
            <span>→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};


