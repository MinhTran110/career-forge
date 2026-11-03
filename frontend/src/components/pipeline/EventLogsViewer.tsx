import React, { useRef, useEffect } from 'react';
import { AgentEvent } from '@/types';

export const EventLogsViewer: React.FC<{
  events: AgentEvent[];
  isConnected?: boolean;
  onTriggerSwarm?: () => void;
}> = ({ events, isConnected, onTriggerSwarm }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getAgentColor = (step: string) => {
    if (step.includes('Profiler')) return 'text-purple-400 border-purple-500/40 bg-purple-500/10';
    if (step.includes('Hunter')) return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
    if (step.includes('Skill')) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    if (step.includes('Resume')) return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    if (step.includes('Fact')) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (step.includes('STAR')) return 'text-pink-400 border-pink-500/40 bg-pink-500/10';
    return 'text-slate-300 border-slate-700 bg-slate-800';
  };

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-2xl flex flex-col h-72">
      {/* Terminal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-2 font-sans">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-[11px] font-bold text-slate-300 tracking-wider ml-1">
            MULTI-AGENT TELEMETRY STREAM
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              LIVE
            </span>
          )}
          {onTriggerSwarm && (
            <button
              onClick={onTriggerSwarm}
              className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-all cursor-pointer active:scale-95"
            >
              ▶ Re-run Swarm
            </button>
          )}
        </div>
      </div>

      {/* Log Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1 scroll-smooth">
        {events.length === 0 ? (
          <div className="text-slate-600 italic py-6 text-center">
            Initializing Multi-Agent Handshake...
          </div>
        ) : (
          events.map((e, idx) => (
            <div key={idx} className="flex items-start gap-2.5 leading-relaxed animate-fadeIn">
              <span className="text-slate-500 text-[10px] whitespace-nowrap pt-0.5">
                {e.timestamp ? e.timestamp.slice(11, 19) : '00:00:00'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${getAgentColor(
                  e.step
                )}`}
              >
                {e.step}
              </span>
              <span className="text-slate-300 text-xs flex-1">{e.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
