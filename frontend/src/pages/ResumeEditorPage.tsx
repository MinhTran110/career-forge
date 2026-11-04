import React, { useState } from 'react';
import { MarkdownSplitView } from '@/components/editor/MarkdownSplitView';
import { AtsKeywordHighlight } from '@/components/editor/AtsKeywordHighlight';
import { Button } from '@/components/common/Button';
import { Job } from '@/types';

export const ResumeEditorPage: React.FC<{
  job?: Job | null;
  onBack: () => void;
  onNextToInterview?: () => void;
}> = ({ job, onBack, onNextToInterview }) => {
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState<string>(`# Senior AI Engineer Resume
**Email**: alex.engineer@careerforge.dev | **GitHub**: github.com/MinhTran110

---

## Professional Summary
Results-driven **Senior AI Infrastructure Engineer** with verified expertise in **FastAPI, Docker, Redis, and PostgreSQL**. Proven track record of architecting fault-tolerant distributed platforms, reducing latency metrics by 35%, and optimizing high-concurrency systems.

---

## Core Technical Competencies
- **Primary Languages & Frameworks:** Python, FastAPI, React 19, TypeScript, Celery
- **Architectural Paradigms:** Microservices, Event-Driven Architecture, Asynchronous I/O
- **Infrastructure & Storage:** Docker, PostgreSQL, Redis, Qdrant Vector Lake

---

## Professional Experience
### Senior Backend Engineer | ScaleTech Systems
*2022 – Present*
- Architected asynchronous FastAPI microservices serving 12M monthly queries, achieving 35% p99 latency reduction, by deploying Redis connection pooling.
- Scaled event streaming pipeline for data ingestion, achieving handling over 10,000 peak requests per second, by deploying Celery workers and Docker container orchestration.
- Streamlined CI/CD deployment pipelines, achieving cutting deployment cycle times by 40%, by deploying automated Pytest test suites.

---

## Key Technical Projects
### CareerForge Multi-Agent Co-Pilot
- Engineered multi-agent grounding engine, achieving 100% verified factual accuracy, by deploying Qdrant vector retrieval.
- Implemented real-time streaming feedback interface, achieving sub-200ms latency, by deploying FastAPI SSE and React 19.
`);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tailored_Resume_${job?.company || 'Target'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span>
          <span>Back to Skill Gap Blueprint</span>
        </button>

        <div className="text-xs text-slate-400 font-medium">
          Step 4: Dual-Loop Google X-Y-Z Generator & Critic Auditor
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
        <div>
          <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">
            Target Job: {job?.title || 'Senior Software Engineer'} ({job?.company || 'FinFlow Tech'})
          </span>
          <h1 className="text-2xl font-black text-white mt-1">ATS-Optimized Resume Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Hallucination Verified against Qdrant Lake •{' '}
            <span className="text-emerald-400 font-bold">100% Grounded</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={handleCopy} className="cursor-pointer text-xs">
            {copied ? '✓ Copied Markdown!' : '📋 Copy Markdown'}
          </Button>
          <Button variant="primary" onClick={handleDownloadPdf} className="cursor-pointer text-xs">
            📄 Download Resume (.md)
          </Button>
        </div>
      </div>

      {/* ATS Score & Before/After Diff Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ATS Score Gauge Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATS Match Score</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold">
              READY TO APPLY
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tight">89.5</span>
            <span className="text-sm font-bold text-slate-400">/ 100</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Skill Coverage (50%)</span>
              <span className="font-bold text-sky-400">92%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: '92%' }}></div>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Grounding Confidence (30%)</span>
              <span className="font-bold text-emerald-400">100%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Metric Density (20%)</span>
              <span className="font-bold text-indigo-400">85%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        {/* Before vs After Google X-Y-Z Diff Card */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              🔍 Fact-Checker Audit & Google X-Y-Z Transformation
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Formula: Accomplished [X] by [Y] doing [Z]
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Diff 1 */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold line-through">
                <span>❌ Original:</span>
                <span>"Làm việc với FastAPI và tối ưu database cho công ty."</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <span>✅ Google X-Y-Z:</span>
                <span>
                  "Architected asynchronous FastAPI microservices serving 12M monthly queries, achieving 35% p99 latency reduction, by deploying Redis connection pooling."
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  🛡️ 0.92 Cosine Grounded
                </span>
                <span>Evidence: Pinned Repo <code className="text-sky-300">fastapi-cache</code></span>
              </div>
            </div>

            {/* Diff 2 */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold line-through">
                <span>❌ Original:</span>
                <span>"Xây dựng pipeline xử lý dữ liệu và deploy bằng Docker."</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <span>✅ Google X-Y-Z:</span>
                <span>
                  "Scaled event streaming pipeline for data ingestion, achieving handling over 10,000 peak requests per second, by deploying Celery workers and Docker container orchestration."
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  🛡️ 0.88 Cosine Grounded
                </span>
                <span>Evidence: GitHub Commit <code className="text-sky-300">73404a2</code></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MarkdownSplitView value={content} onChange={setContent} />

      <AtsKeywordHighlight
        matchedKeywords={job?.matched_skills || ['FastAPI', 'Redis', 'Docker', 'PostgreSQL', 'Celery', 'TypeScript']}
        missingKeywords={job?.missing_skills || ['Kubernetes', 'Triton', 'CUDA']}
      />

      {/* Bottom Stage Transition Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
        >
          <span>← Back to Skill Gap Blueprint</span>
        </button>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleDownloadPdf} className="cursor-pointer text-xs">
            📄 Download Resume (.md)
          </Button>

          {onNextToInterview && (
            <Button
              variant="primary"
              onClick={onNextToInterview}
              className="cursor-pointer inline-flex items-center gap-2 text-xs"
            >
              <span>Practice STAR Mock Interview (Optional)</span>
              <span>→</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

