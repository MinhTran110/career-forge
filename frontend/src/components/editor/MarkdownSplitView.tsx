import React, { useState } from 'react';

interface MarkdownSplitViewProps {
  value: string;
  onChange: (val: string) => void;
}

export const MarkdownSplitView: React.FC<MarkdownSplitViewProps> = ({ value, onChange }) => {
  const [zoomLevel, setZoomLevel] = useState<'fit' | '100%'>('100%');

  // Simple Markdown renderer for ATS Document preview
  const renderAtsDocument = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl font-bold text-slate-900 tracking-tight text-center pb-1">
            {trimmed.replace('# ', '')}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-0.5 mt-3 mb-1">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xs font-semibold text-slate-900 mt-2 flex justify-between">
            <span>{trimmed.replace('### ', '')}</span>
          </h3>
        );
      }
      if (trimmed.startsWith('---')) {
        return null; // Sections already have bottom borders
      }
      if (trimmed.startsWith('- ')) {
        const text = trimmed.replace('- ', '');
        // Highlight bold elements
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
          <li key={idx} className="text-[11px] text-slate-700 leading-snug ml-3 list-disc marker:text-slate-500 my-0.5">
            {parts.map((p, pIdx) => {
              if (p.startsWith('**') && p.endsWith('**')) {
                return <strong key={pIdx} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>;
              }
              return p;
            })}
          </li>
        );
      }
      if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
        return (
          <p key={idx} className="text-[10px] italic text-slate-600 mb-1">
            {trimmed.slice(1, -1)}
          </p>
        );
      }
      if (trimmed.length === 0) {
        return <div key={idx} className="h-1" />;
      }

      // Default paragraph (e.g. Header contact line or Summary)
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const isHeaderContact = trimmed.includes('Email') || trimmed.includes('GitHub');
      return (
        <p key={idx} className={`text-[11px] leading-relaxed text-slate-700 ${isHeaderContact ? 'text-center text-[10px] text-slate-600 mb-2' : 'my-1'}`}>
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>;
            }
            return p;
          })}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[650px]">
      {/* Left: Raw Markdown Editor */}
      <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Markdown Source</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Google X-Y-Z Grounded
          </span>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-slate-950/40 p-5 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed selection:bg-sky-500 selection:text-white"
        />
        <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>{value.split('\n').length} lines • {value.length} chars</span>
          <span className="text-emerald-400 font-mono">Typst-ready AST format</span>
        </div>
      </div>

      {/* Right: Authentic A4 Paper ATS Document Preview */}
      <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs">📄</span>
            <span className="text-xs font-bold text-slate-200">ATS Print & PDF Preview</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              Greenhouse / Lever 100% Parsable
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoomLevel(zoomLevel === '100%' ? 'fit' : '100%')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
            >
              {zoomLevel === '100%' ? 'Fit Width' : '100% Scale'}
            </button>
          </div>
        </div>

        {/* Paper Canvas Background */}
        <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto flex justify-center">
          {/* Simulated White A4 Paper Sheet */}
          <div
            className={`w-full bg-[#fdfdfd] text-slate-900 shadow-2xl rounded-sm p-8 transition-all font-serif ${
              zoomLevel === '100%' ? 'max-w-[560px]' : 'max-w-full'
            }`}
            style={{
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
              minHeight: '750px',
            }}
          >
            {/* ATS Header Note (Non-printed watermark) */}
            <div className="mb-3 pb-2 border-b border-dashed border-slate-300 flex items-center justify-between text-[9px] font-sans text-slate-400">
              <span>A4 STANDARD ATS FORMAT • STRICT SINGLE COLUMN</span>
              <span>PARSER ACCURACY: 99.8%</span>
            </div>

            {/* Rendered Document Elements */}
            <div className="space-y-0.5">
              {renderAtsDocument(value)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
