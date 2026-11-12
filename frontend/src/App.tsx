import React, { useState, useEffect } from 'react';
import { DashboardPage } from '@/pages/DashboardPage';
import { ResumeEditorPage } from '@/pages/ResumeEditorPage';
import { MockInterviewPage } from '@/pages/MockInterviewPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { ApiKeyModal } from '@/components/common/ApiKeyModal';
import { getCurrentUser, getApiKeyStatus } from '@/services/api';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { ApiKeyStatus, Job, User } from '@/types';

const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'editor' | 'interview'>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus | null>(null);
  const { language, setLanguage, t } = useLanguage();

  const fetchUser = () => {
    getCurrentUser()
      .then((u) => setCurrentUser(u))
      .catch(() => setCurrentUser(null));
  };

  const fetchApiStatus = () => {
    getApiKeyStatus()
      .then((s) => setApiKeyStatus(s))
      .catch(() => null);
  };

  useEffect(() => {
    fetchUser();
    fetchApiStatus();
  }, []);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setCurrentPage('editor'); // Direct 1-Click transition to ATS Studio!
  };

  const handleStepNavigation = (stepIndex: number) => {
    if (stepIndex === 0) {
      setCurrentPage('dashboard');
    } else if (stepIndex === 1 || stepIndex === 2) {
      setCurrentPage('editor');
    } else if (stepIndex === 3) {
      setCurrentPage('interview');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            CF
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              CareerForge
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-2 border border-slate-800 rounded px-1.5 py-0.5">
              AI Co-Pilot
            </span>
          </div>
        </div>

        {/* Tab Navigation & User Controls */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPage === 'dashboard'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {t('nav.jobs')}
            </button>

            <button
              onClick={() => setCurrentPage('editor')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPage === 'editor'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {t('nav.resume')}
            </button>

            <button
              onClick={() => setCurrentPage('interview')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'interview'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <span>{t('nav.interview')}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-normal">
                {t('nav.optional')}
              </span>
            </button>
          </nav>

          {/* Language Switcher (VI / EN Toggle) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setLanguage('vi')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'vi'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chuyển sang Tiếng Việt"
            >
              🇻🇳 VI
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to English"
            >
              🇬🇧 EN
            </button>
          </div>

          {/* Free API Key Settings */}
          <button
            onClick={() => setIsApiKeyOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95"
            title={language === 'vi' ? 'Thiết lập API AI Miễn phí' : 'Setup Free AI API'}
          >
            <span className="text-amber-400">⚙️</span>
            <span className="hidden sm:inline">
              {language === 'vi' ? 'Cài đặt API' : 'API Settings'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                apiKeyStatus?.is_configured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
          </button>

          {/* User Account Button */}
          <div className="pl-1 border-l border-slate-800">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : '👤'}
              </div>
              <span className="hidden md:inline-block max-w-[120px] truncate">
                {currentUser?.full_name || t('nav.sign_in')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 pb-12">
        {currentPage === 'dashboard' && (
          <DashboardPage onSelectJob={handleSelectJob} onStepClick={handleStepNavigation} />
        )}
        {currentPage === 'editor' && (
          <ResumeEditorPage
            job={selectedJob}
            onBack={() => setCurrentPage('dashboard')}
            onNextToInterview={() => setCurrentPage('interview')}
          />
        )}
        {currentPage === 'interview' && (
          <MockInterviewPage
            onBack={() => setCurrentPage('editor')}
            onBackToRadar={() => setCurrentPage('dashboard')}
          />
        )}
      </main>

      {/* Auth & Session Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChanged={fetchUser}
      />

      {/* API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onKeySaved={fetchApiStatus}
      />

      <footer className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-500 bg-slate-950/40">
        CareerForge © 2026 • Multi-Agent Autonomous Career Acceleration Platform • All 5 Specialist Agents Active
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
};

export default App;
