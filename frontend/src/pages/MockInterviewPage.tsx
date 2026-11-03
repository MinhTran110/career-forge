import React from 'react';
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
          Step 6: STAR Technical & Behavioral Simulator
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <span className="text-xs text-sky-400 font-bold uppercase tracking-wider bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-full">
            Specialist Agent #6: STAR Interviewer
          </span>
          <span className="text-xs text-slate-400">Question 1 of 3</span>
        </div>

        <h2 className="text-lg font-bold text-white leading-relaxed">{currentQuestion}</h2>

        <AudioWaveform isRecording={isRecording} />

        <div className="flex flex-wrap gap-3 pt-2">
          {!isRecording ? (
            <Button variant="primary" onClick={startRecording} className="cursor-pointer">
              🎙 Start Voice Answer
            </Button>
          ) : (
            <Button variant="danger" onClick={() => { stopRecording(); handleSimulateScore(); }} className="cursor-pointer">
              ⏹ Stop & Evaluate
            </Button>
          )}
          <Button variant="secondary" onClick={handleSimulateScore} className="cursor-pointer">
            ✨ Evaluate Answer via STAR Rubric
          </Button>
        </div>
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
