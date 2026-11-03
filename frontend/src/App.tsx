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

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-black text-sky-400">
            CF
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            CareerForge
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <button onClick={() => setCurrentPage('dashboard')} className="hover:text-white">Radar</button>
          <button onClick={() => setCurrentPage('editor')} className="hover:text-white">ATS Editor</button>
          <button onClick={() => setCurrentPage('interview')} className="hover:text-white">Mock Room</button>
        </div>
      </header>

      <main className="flex-1">
        {currentPage === 'dashboard' && <DashboardPage onSelectJob={handleSelectJob} />}
        {currentPage === 'detail' && selectedJob && (
          <JobDetailPage
            job={selectedJob}
            onBack={() => setCurrentPage('dashboard')}
            onOptimize={() => setCurrentPage('editor')}
            onStartInterview={() => setCurrentPage('interview')}
          />
        )}
        {currentPage === 'editor' && <ResumeEditorPage onBack={() => setCurrentPage('dashboard')} />}
        {currentPage === 'interview' && <MockInterviewPage onBack={() => setCurrentPage('dashboard')} />}
      </main>

      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        CareerForge © 2026 • Multi-Agent Autonomous Career Acceleration Platform
      </footer>
    </div>
  );
};

export default App;
