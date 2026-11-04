import React, { useState } from 'react';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useInterviewStore } from '@/stores/useInterviewStore';
import { AudioWaveform } from '@/components/interview/AudioWaveform';
import { LiveStarScoreboard } from '@/components/interview/LiveStarScoreboard';
import { Button } from '@/components/common/Button';

export const MockInterviewPage: React.FC<{
  onBack: () => void;
  onBackToRadar?: () => void;
}> = ({ onBack, onBackToRadar }) => {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { currentQuestion, scores, setScores } = useInterviewStore();

  const handleSimulateScore = () => {
    setScores({
      situation: 92,
      task: 88,
      action: 94,
      result: 90,
      composite: 91.0,
      strengths: [
        'Clearly articulated high-concurrency microservice architecture with FastAPI and Redis',
        'Demonstrated strong personal leadership and quantifiable metrics (42% p99 latency reduction)',
      ],
      improvements: [
        'State initial business constraints and SLA requirements slightly earlier in the Situation stage',
      ],
    });
  };

  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [textAnswer, setTextAnswer] = useState<string>(
    'Situation: Our core distributed API was experiencing 120ms p99 latency spikes under 10k RPS.\nTask: Re-architect the data access layer to meet our strict SLA of <20ms p99 latency.\nAction: Deployed Redis connection pooling with FastAPI asynchronous workers and implemented pipeline caching.\nResult: Reduced p99 latency by 42% and successfully passed the stress benchmark with zero dropped requests.'
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>←</span>
          <span>Back to ATS Studio</span>
        </button>

        <div className="text-xs text-slate-400 font-medium">
          Step 5: STAR Technical & Behavioral Simulator (Optional Practice)
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-full">
              Specialist Agent #5: STAR Interviewer
            </span>
            <span className="text-xs text-slate-400">Question 1 of 3</span>
          </div>

          {/* Mode Switcher: Text vs Voice */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setInputMode('text')}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ✍️ Text Response (Standard)
            </button>
            <button
              onClick={() => setInputMode('voice')}
              className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                inputMode === 'voice'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎙️ Voice Practice (Optional)
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white leading-relaxed">{currentQuestion}</h2>

        {/* Text Mode (Default) */}
        {inputMode === 'text' && (
          <div className="space-y-3 pt-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Formulate your response using the STAR Framework (Situation, Task, Action, Result):
            </label>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              rows={5}
              placeholder="Structure your answer with quantifiable metrics..."
              className="w-full bg-slate-950 border border-slate-750 rounded-xl p-4 text-xs font-sans text-slate-200 outline-none focus:border-purple-500 leading-relaxed"
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-400">
                Tip: STAR Interviewer checks for quantifiable metrics & root cause resolution.
              </span>
              <Button variant="primary" onClick={handleSimulateScore} className="cursor-pointer text-xs bg-purple-600 hover:bg-purple-500">
                ✨ Submit & Evaluate Answer via STAR Rubric
              </Button>
            </div>
          </div>
        )}

        {/* Voice Mode (Optional) */}
        {inputMode === 'voice' && (
          <div className="space-y-4 pt-1 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Voice practice uses browser speech recognition or microphone capture.</span>
              <span className="text-[10px] text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">
                Optional Feature
              </span>
            </div>

            <AudioWaveform isRecording={isRecording} />

            <div className="flex flex-wrap gap-3 pt-2">
              {!isRecording ? (
                <Button variant="primary" onClick={startRecording} className="cursor-pointer text-xs">
                  🎙 Start Voice Recording
                </Button>
              ) : (
                <Button variant="danger" onClick={() => { stopRecording(); handleSimulateScore(); }} className="cursor-pointer text-xs">
                  ⏹ Stop & Evaluate
                </Button>
              )}
              <Button variant="secondary" onClick={handleSimulateScore} className="cursor-pointer text-xs">
                ✨ Evaluate Current Audio
              </Button>
            </div>
          </div>
        )}
      </div>

      {scores && <LiveStarScoreboard scores={scores} />}

      {/* Bottom Stage Transition Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
        >
          <span>← Back to ATS Studio</span>
        </button>

        {onBackToRadar && (
          <Button
            variant="primary"
            onClick={onBackToRadar}
            className="cursor-pointer inline-flex items-center gap-2"
          >
            <span>Return to Opportunity Radar</span>
            <span>✓</span>
          </Button>
        )}
      </div>
    </div>
  );
};
