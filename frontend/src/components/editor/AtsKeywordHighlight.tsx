import React from 'react';

interface AtsKeywordHighlightProps {
  matchedKeywords: string[];
  missingKeywords: string[];
}

export const AtsKeywordHighlight: React.FC<AtsKeywordHighlightProps> = ({ matchedKeywords, missingKeywords }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATS Keyword Match Density</h4>
      <div className="space-y-2">
        <div>
          <span className="text-xs text-emerald-400 font-semibold">Matched ({matchedKeywords.length}):</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {matchedKeywords.map((kw) => (
              <span key={kw} className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800">
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs text-rose-400 font-semibold">Missing from Resume ({missingKeywords.length}):</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {missingKeywords.map((kw) => (
              <span key={kw} className="text-[11px] px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800">
                ✕ {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
