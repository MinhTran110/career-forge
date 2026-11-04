import React, { useState, useEffect } from 'react';
import { useJobRadar } from '@/hooks/use-job-radar';
import { useAgentStream } from '@/hooks/use-agent-stream';
import { JobCard } from '@/components/radar/JobCard';
import { AgentStepper } from '@/components/pipeline/AgentStepper';
import { AgentDebateStream } from '@/components/pipeline/AgentDebateStream';
import { CandidateProfileCard } from '@/components/profile/CandidateProfileCard';
import { CustomJdModal } from '@/components/radar/CustomJdModal';
import { getMyProfile, triggerRadarScan } from '@/services/api';
import { CandidateProfile, Job } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export const DashboardPage: React.FC<{
  onSelectJob: (job: Job) => void;
  onStepClick?: (stepIndex: number) => void;
}> = ({ onSelectJob, onStepClick }) => {
  const { t } = useLanguage();
  const { jobs, loading, setJobs } = useJobRadar();
  const [activeTier, setActiveTier] = useState<string>('all');
  const [workflowId, setWorkflowId] = useState<string>('session_init');
  const { events, isConnected } = useAgentStream(workflowId);
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
      setWorkflowId(`profile_sync_${Date.now()}`);
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
      setWorkflowId(`rescan_${Date.now()}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

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

      {/* Stepper Navigation */}
      <AgentStepper currentStepIndex={1} onNavigateToStep={onStepClick} />

      {/* Candidate Profiler & Ground-Truth Card */}
      <CandidateProfileCard profile={profile} onProfileUpdated={handleProfileUpdated} />

      {/* Main Grid: Jobs List vs Multi-Agent Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
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
              Scanning and matching market opportunities against Qdrant Ground-Truth...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center p-12 text-slate-400 border border-slate-800/80 rounded-2xl bg-slate-900/40">
              No jobs found matching "{activeTier}" tier.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))
          )}
        </div>

        {/* Right Column: Multi-Agent Debate & Thought Stream */}
        <div>
          <AgentDebateStream
            events={events}
            isConnected={isConnected}
            onRerun={() => setWorkflowId(`swarm_${Date.now()}`)}
          />
        </div>
      </div>

      {/* External Custom JD Modal */}
      <CustomJdModal
        isOpen={isCustomJdOpen}
        onClose={() => setIsCustomJdOpen(false)}
        onJobCreated={handleCustomJobCreated}
      />
    </div>
  );
};

