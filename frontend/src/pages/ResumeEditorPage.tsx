import React, { useState } from 'react';
import { MarkdownSplitView } from '@/components/editor/MarkdownSplitView';
import { AtsKeywordHighlight } from '@/components/editor/AtsKeywordHighlight';
import { Button } from '@/components/common/Button';

export const ResumeEditorPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [content, setContent] = useState<string>(`# Senior AI Engineer Resume
**Email**: candidate@example.com | **GitHub**: github.com/candidate

## Professional Experience
### Lead Backend Engineer - ScaleTech (2023 - Present)
- Architected asynchronous FastAPI microservices serving 12M monthly queries with sub-30ms p99 latency.
- Deployed Celery distributed task queues backed by Redis, handling 50k background sync operations per day.
- Integrated Typst document generation engine into core pipeline, improving export speeds by 80%.

## Technical Skills
- **Languages**: Python, TypeScript, SQL, Go
- **Frameworks**: FastAPI, React 19, Celery, SQLAlchemy
- **Infrastructure**: Docker, Kubernetes, Redis, Qdrant, MinIO
`);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-white mb-2">← Back to Job</button>
          <h1 className="text-2xl font-bold text-white">ATS-Optimized Resume Editor</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Check Fact-Audit Log</Button>
          <Button variant="primary">Download PDF (Typst)</Button>
        </div>
      </div>

      <MarkdownSplitView value={content} onChange={setContent} />

      <AtsKeywordHighlight
        matchedKeywords={['FastAPI', 'Redis', 'Docker', 'Celery', 'TypeScript']}
        missingKeywords={['Triton', 'CUDA', 'Prometheus']}
      />
    </div>
  );
};
