import React from 'react';
import { Job } from '@/types';
import { MatchScoreGauge } from './MatchScoreGauge';
import { Badge } from '../common/Badge';
import { useLanguage } from '@/context/LanguageContext';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  onQuickView?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect, onQuickView }) => {
  const { t, language } = useLanguage();

  const tierColor =
    job.tier === 'safe'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
      : job.tier === 'reach'
      ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
      : 'border-amber-500/40 bg-amber-500/10 text-amber-400';

  const tierLabel =
    job.tier === 'safe'
      ? (language === 'vi' ? 'Vừa sức' : 'Safe Tier')
      : job.tier === 'reach'
      ? (language === 'vi' ? 'Thử thách' : 'Reach Tier')
      : (language === 'vi' ? 'Mục tiêu' : 'Target Tier');

  const getSourceMeta = () => {
    if (!job.url || job.url.includes('custom-jd.careerforge.dev')) {
      const isCustom = job.url?.includes('custom-jd.careerforge.dev');
      return {
        label: isCustom ? (language === 'vi' ? 'Tin tự nhập (Custom JD)' : 'Custom JD') : `${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        href: isCustom ? undefined : `https://www.google.com/search?q=${encodeURIComponent(`${job.company} ${job.title} job posting`)}`,
        isCustom,
      };
    }
    try {
      const parsed = new URL(job.url);
      const domain = parsed.hostname.replace('www.', '');
      return {
        label: domain,
        href: job.url,
        isCustom: false,
      };
    } catch {
      return {
        label: 'careers-portal',
        href: job.url,
        isCustom: false,
      };
    }
  };

  const sourceMeta = getSourceMeta();

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-sky-500/50 p-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:shadow-sky-950/50 flex flex-col sm:flex-row justify-between items-start gap-4 group">
      <div className="space-y-2.5 max-w-xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge label={job.job_type} variant="info" />
          {job.tier && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tierColor}`}>
              {tierLabel}
            </span>
          )}
          {job.location && job.location.toLowerCase() !== job.job_type.toLowerCase() && (
            <span className="text-xs text-slate-400">• {job.location}</span>
          )}

          {/* Transparent Source Link */}
          {sourceMeta.href ? (
            <a
              href={sourceMeta.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-200 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded-full transition-all cursor-pointer shadow-sm group/link"
              title={`Mở bài tuyển dụng gốc: ${sourceMeta.href}`}
            >
              <span>🌐</span>
              <span>{sourceMeta.label}</span>
              <span className="text-[10px] group-hover/link:translate-x-0.5 transition-transform">↗</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 rounded-full">
              <span>📋</span>
              <span>{sourceMeta.label}</span>
            </span>
          )}
        </div>
        <h3
          className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors cursor-pointer"
          onClick={() => onSelect(job)}
        >
          {job.title}
        </h3>
        <p className="text-sm font-medium text-slate-300 flex flex-wrap items-center gap-2">
          <span className="text-sky-400 font-semibold">{job.company}</span>
          <span>•</span>
          <span>{job.salary_range}</span>
          {sourceMeta.href && (
            <>
              <span className="text-slate-500">•</span>
              <a
                href={sourceMeta.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-sky-400 hover:text-sky-200 underline underline-offset-2 flex items-center gap-0.5 cursor-pointer font-semibold"
                title="Mở bài tuyển dụng gốc"
              >
                <span>Xem tin gốc</span>
                <span className="text-[11px]">↗</span>
              </a>
            </>
          )}
        </p>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {job.tech_stack.map((tech) => (
            <span
              key={tech}
              className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/50"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0">
        <MatchScoreGauge score={job.match_score} />
        <div className="flex items-center gap-2">
          {onQuickView && (
            <button
              onClick={() => onQuickView(job)}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              title={t('dash.quick_view')}
            >
              👁️
            </button>
          )}
          <button
            onClick={() => onSelect(job)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-md shadow-sky-500/20 hover:shadow-sky-500/40 cursor-pointer active:scale-95"
          >
            <span>⚡ {t('dash.tailor_now')}</span>
            <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
