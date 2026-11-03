import React, { useState } from 'react';
import { DashboardPage } from '@/pages/DashboardPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { ResumeEditorPage } from '@/pages/ResumeEditorPage';
import { MockInterviewPage } from '@/pages/MockInterviewPage';
import { Job } from '@/types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'detail' | 'editor' | 'interview'>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setCurrentPage('detail');
  };

  const handleStepNavigation = (stepIndex: number) => {
    if (stepIndex <= 1) {
      setCurrentPage('dashboard');
    } else if (stepIndex === 2) {
      setCurrentPage('detail');
    } else if (stepIndex === 3 || stepIndex === 4) {
      setCurrentPage('editor');
    } else if (stepIndex === 5) {
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

        {/* Tab Navigation with Active Indicators */}
        <nav className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPage === 'dashboard'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            1. Radar
          </button>

          <button
            onClick={() => setCurrentPage('detail')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPage === 'detail'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            2. Skill & Sprint
          </button>

          <button
            onClick={() => setCurrentPage('editor')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPage === 'editor'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            3. ATS Studio
          </button>

          <button
            onClick={() => setCurrentPage('interview')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentPage === 'interview'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            4. Mock Room
          </button>
        </nav>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 pb-12">
        {currentPage === 'dashboard' && (
          <DashboardPage onSelectJob={handleSelectJob} onStepClick={handleStepNavigation} />
        )}
        {currentPage === 'detail' && (
          <JobDetailPage
            job={selectedJob || {
              id: 'job_sample',
              title: 'Senior AI Infrastructure Engineer',
              company: 'DeepScale AI',
              location: 'Remote',
              salary_range: '$140,000 - $180,000',
              job_type: 'Remote',
              url: 'https://example.com',
              description: 'Architect high-throughput LLM serving platforms with FastAPI, Docker, and Redis.',
              requirements: ['FastAPI', 'Python', 'Docker', 'Kubernetes', 'Redis'],
              tech_stack: ['Python', 'FastAPI', 'Redis', 'Docker'],
              matched_skills: ['Python', 'FastAPI', 'Redis', 'Docker'],
              missing_skills: ['Kubernetes', 'vLLM'],
              match_score: 86.5,
              tier: 'safe',
            }}
            onBack={() => setCurrentPage('dashboard')}
            onOptimize={() => setCurrentPage('editor')}
            onStartInterview={() => setCurrentPage('interview')}
          />
        )}
        {currentPage === 'editor' && (
          <ResumeEditorPage
            onBack={() => setCurrentPage('detail')}
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

      <footer className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-500 bg-slate-950/40">
        CareerForge © 2026 • Multi-Agent Autonomous Career Acceleration Platform • All 5 Specialist Agents Active
      </footer>
    </div>
  );
};

export default App;
