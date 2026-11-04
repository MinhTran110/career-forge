import React, { useRef, useEffect } from 'react';
import { AgentEvent } from '@/types';

interface AgentDebateStreamProps {
  events: AgentEvent[];
  isConnected: boolean;
  onRerun: () => void;
}

export const AgentDebateStream: React.FC<AgentDebateStreamProps> = ({ events, isConnected, onRerun }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getAgentBadge = (agent?: string, step?: string) => {
    const role = (agent || step || '').toLowerCase();
    if (role.includes('critic') || role.includes('fact')) {
      return {
        icon: '🛡️',
        label: 'Critic Auditor',
        color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
      };
    }
    if (role.includes('writer') || role.includes('resume')) {
      return {
        icon: '✍️',
        label: 'Resume Strategist',
        color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      };
    }
    if (role.includes('skill') || role.includes('strategist')) {
      return {
        icon: '🎯',
        label: 'Skill Strategist',
        color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
      };
    }
    if (role.includes('hunter') || role.includes('market')) {
      return {
        icon: '📡',
        label: 'Market Hunter',
        color: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
      };
    }
    return {
      icon: '🧠',
      label: 'Candidate Profiler',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    };
  };

  const getStatusHighlight = (status?: string) => {
    if (status === 'critic_alert') {
      return 'border-rose-500/60 bg-rose-950/40 shadow-rose-950/50';
    }
    if (status === 'critic_revision') {
      return 'border-amber-500/50 bg-amber-950/30 shadow-amber-950/40';
    }
    if (status === 'approved') {
      return 'border-emerald-500/60 bg-emerald-950/40 shadow-emerald-950/50';
    }
    return 'border-slate-800 bg-slate-950/70';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            ></span>
          </span>
          <h3 className="text-sm font-bold text-white tracking-wide">Multi-Agent Swarm Telemetry</h3>
        </div>

        <button
          onClick={onRerun}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
        >
          <span>↻</span>
          <span>Re-run Swarm</span>
        </button>
      </div>

      {/* Stream Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[340px] scrollbar-thin scrollbar-thumb-slate-700"
      >
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            Connecting to Multi-Agent SSE Event Stream...
          </div>
        ) : (
          events.map((ev, index) => {
            const badge = getAgentBadge(ev.agent, ev.step);
            const statusClass = getStatusHighlight(ev.status);

            return (
              <div
                key={index}
                className={`p-3 rounded-xl border ${statusClass} transition-all space-y-1.5 shadow-sm`}
              >
                {/* Agent Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                  >
                    <span>{badge.icon}</span>
                    <span>{ev.step || badge.label}</span>
                  </span>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>

                {/* Agent Internal Thought (if available) */}
                {ev.thought && (
                  <div className="text-[11px] text-slate-400 italic bg-slate-900/60 rounded-lg px-2.5 py-1 border border-slate-800/80">
                    <span className="text-slate-500 font-bold mr-1">💭 Thought:</span>
                    {ev.thought}
                  </div>
                )}

                {/* Visible Message / Output */}
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {ev.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[11px] text-slate-500 text-right pt-2 border-t border-slate-800/60 font-mono">
        Active Orchestrator: Dual-Loop Engine v2.0
      </div>
    </div>
  );
};
