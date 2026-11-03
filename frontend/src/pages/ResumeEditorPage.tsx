import React, { useState } from 'react';
import { MarkdownSplitView } from '@/components/editor/MarkdownSplitView';
import { AtsKeywordHighlight } from '@/components/editor/AtsKeywordHighlight';
import { Button } from '@/components/common/Button';

export const ResumeEditorPage: React.FC<{
  onBack: () => void;
  onNextToInterview?: () => void;
}> = ({ onBack, onNextToInterview }) => {
  const [content, setContent] = useState<string>(`# Senior AI Engineer Resume
**Email**: candidate@careerforge.dev | **GitHub**: github.com/candidate

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
          Step 4 & 5: Google X-Y-Z Dual-Loop Generator & Critic
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
        <div>
          <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">Module 4: Dual-Loop ATS Engine</span>
          <h1 className="text-2xl font-black text-white mt-1">ATS-Optimized Resume Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audited with Qdrant Evidence Lake • <span className="text-emerald-400 font-bold">100% Grounded</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" className="cursor-pointer">
            🔍 Audit Grounding Log
          </Button>
          <Button variant="primary" className="cursor-pointer">
            📄 Export ATS PDF
          </Button>
        </div>
      </div>

      <MarkdownSplitView value={content} onChange={setContent} />

      <AtsKeywordHighlight
        matchedKeywords={['FastAPI', 'Redis', 'Docker', 'PostgreSQL', 'Celery', 'TypeScript']}
        missingKeywords={['Kubernetes', 'Triton', 'CUDA']}
      />

      {/* Bottom Stage Transition Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
        >
          <span>← Back to Skill Gap</span>
        </button>

        {onNextToInterview && (
          <Button
            variant="primary"
            onClick={onNextToInterview}
            className="cursor-pointer inline-flex items-center gap-2"
          >
            <span>Next: Launch STAR Mock Interview</span>
            <span>→</span>
          </Button>
        )}
      </div>
    </div>
  );
};
