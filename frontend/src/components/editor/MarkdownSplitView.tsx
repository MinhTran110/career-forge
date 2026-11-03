import React from 'react';

interface MarkdownSplitViewProps {
  value: string;
  onChange: (val: string) => void;
}

export const MarkdownSplitView: React.FC<MarkdownSplitViewProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4 h-[550px]">
      <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300">Markdown Editor</div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent p-4 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed"
        />
      </div>
      <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300">Real-time Typst / ATS Preview</div>
        <div className="flex-1 p-6 text-xs text-slate-300 overflow-y-auto whitespace-pre-line leading-relaxed font-sans bg-slate-950/40">
          {value}
        </div>
      </div>
    </div>
  );
};
