import React, { useState, useEffect } from 'react';
import { useJobRadar } from '@/hooks/use-job-radar';
import { JobCard } from '@/components/radar/JobCard';
import { CandidateProfileCard } from '@/components/profile/CandidateProfileCard';
import { CustomJdModal } from '@/components/radar/CustomJdModal';
import { getMyProfile, triggerRadarScan } from '@/services/api';
import { CandidateProfile, Job } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export const DashboardPage: React.FC<{
  onSelectJob: (job: Job) => void;
  onStepClick?: (stepIndex: number) => void;
}> = ({ onSelectJob }) => {
  const { t } = useLanguage();
  const { jobs, loading, setJobs } = useJobRadar();
  const [activeTier, setActiveTier] = useState<string>('all');
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isCustomJdOpen, setIsCustomJdOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const fetchProfile = () => {
    getMyProfile()
      .then((data) => setProfile(data))
      .catch((err) => console.error('Failed fetching profile:', err));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdated = async () => {
    fetchProfile();
    try {
      setIsScanning(true);
      const updatedJobs = await triggerRadarScan();
      if (setJobs) setJobs(updatedJobs);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCustomJobCreated = (newJob: Job) => {
    if (setJobs) {
      setJobs((prev) => [newJob, ...prev]);
    }
    onSelectJob(newJob);
  };

  const handleRescanMarket = async () => {
    try {
      setIsScanning(true);
      const freshJobs = await triggerRadarScan();
      if (setJobs) setJobs(freshJobs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const [quickViewJob, setQuickViewJob] = useState<Job | null>(null);

  const filteredJobs = jobs.filter((job) => {
    if (activeTier === 'all') return true;
    return (job.tier || '').toLowerCase() === activeTier.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="inline-block text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-full mb-2">
            {t('dash.step_badge')}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('dash.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('dash.desc')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCustomJdOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500/60 text-sky-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>📋</span>
            <span>{t('dash.add_jd')}</span>
          </button>

          <button
            onClick={handleRescanMarket}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{isScanning ? '↻' : '🔄'}</span>
            <span>{isScanning ? t('dash.scanning') : t('dash.rescan')}</span>
          </button>
        </div>
      </div>

      {/* Candidate Profiler & Ground-Truth Card */}
      <CandidateProfileCard profile={profile} onProfileUpdated={handleProfileUpdated} />

      {/* Main Jobs Radar List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{t('dash.recommended')}</span>
              <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700 font-normal">
                {t('dash.live_updates')}
              </span>
            </h2>
            <span className="text-xs text-sky-400 font-medium">
              {filteredJobs.length} {t('dash.positions_found')}
            </span>
          </div>

          {/* Tier Filters */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: t('dash.tier_all') },
              { id: 'safe', label: t('dash.tier_safe') },
              { id: 'target', label: t('dash.tier_target') },
              { id: 'reach', label: t('dash.tier_reach') },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTier(id)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTier === id
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading || isScanning ? (
          <div className="text-center p-16 text-slate-500 border border-slate-800/80 rounded-2xl bg-slate-900/40">
            <div className="animate-spin w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full mx-auto mb-3" />
            {t('dash.scanning_message')}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center p-12 text-slate-400 border border-slate-800/80 rounded-2xl bg-slate-900/40">
            {t('dash.empty_tier')}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={onSelectJob}
                onQuickView={(j) => setQuickViewJob(j)}
              />
            ))}
          </div>
        )}
      </div>

      {/* External Custom JD Modal */}
      <CustomJdModal
        isOpen={isCustomJdOpen}
        onClose={() => setIsCustomJdOpen(false)}
        onJobCreated={handleCustomJobCreated}
      />

      {/* Quick View Job Modal */}
      {quickViewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-sky-400 font-extrabold uppercase tracking-wider">{quickViewJob.company}</span>
                  {quickViewJob.url && !quickViewJob.url.includes('custom-jd.careerforge.dev') ? (
                    <a
                      href={quickViewJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded-full transition-all"
                      title={quickViewJob.url}
                    >
                      <span>🌐</span>
                      <span>
                        {(() => {
                          try {
                            return new URL(quickViewJob.url).hostname.replace('www.', '');
                          } catch {
                            return 'careers-portal';
                          }
                        })()}
                      </span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 font-medium">
                      📋 {t('dash.custom_jd_badge')}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{quickViewJob.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {quickViewJob.location} • <span className="text-slate-300 font-semibold">{quickViewJob.salary_range}</span>
                </p>
              </div>
              <button
                onClick={() => setQuickViewJob(null)}
                className="text-slate-400 hover:text-white p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-1.5">{t('dash.job_desc')}</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                {quickViewJob.description}
              </p>
            </div>

            {quickViewJob.requirements && quickViewJob.requirements.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1.5">{t('dash.job_reqs')}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {quickViewJob.requirements.map((req, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 font-medium">
                      ✓ {req}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-1.5">Tech Stack:</h4>
              <div className="flex flex-wrap gap-1.5">
                {quickViewJob.tech_stack.map((tech) => (
                  <span key={tech} className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              {quickViewJob.url && !quickViewJob.url.includes('custom-jd.careerforge.dev') ? (
                <a
                  href={quickViewJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-sky-400 hover:text-sky-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>🌐 {t('dash.open_original')}</span>
                  <span>↗</span>
                </a>
              ) : (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${quickViewJob.company} ${quickViewJob.title} careers jobs`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>🔍 {t('dash.search_google')}</span>
                  <span>↗</span>
                </a>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuickViewJob(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {t('dash.close')}
                </button>
                <button
                  onClick={() => {
                    const j = quickViewJob;
                    setQuickViewJob(null);
                    onSelectJob(j);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-sky-500/30 cursor-pointer flex items-center gap-2"
                >
                  <span>⚡ {t('dash.tailor_now')}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

