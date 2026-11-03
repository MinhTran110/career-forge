import React from 'react';
import { AgentEvent } from '@/types';

export const EventLogsViewer: React.FC<{ events: AgentEvent[] }> = ({ events }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs h-48 overflow-y-auto space-y-2">
      <div className="text-slate-500 pb-1 border-b border-slate-800 font-sans font-bold">AGENT EVENT LOG STREAM</div>
      {events.length === 0 ? (
        <div className="text-slate-600 italic">Awaiting autonomous agent dispatch...</div>
      ) : (
        events.map((e, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="text-slate-500">[{e.timestamp.slice(11, 19)}]</span>
            <span className="text-sky-400 font-semibold">{e.step}:</span>
            <span className="text-slate-300">{e.message}</span>
          </div>
        ))
      )}
    </div>
  );
};
