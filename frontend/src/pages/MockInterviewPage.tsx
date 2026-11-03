import React from 'react';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useInterviewStore } from '@/stores/useInterviewStore';
import { AudioWaveform } from '@/components/interview/AudioWaveform';
import { LiveStarScoreboard } from '@/components/interview/LiveStarScoreboard';
import { Button } from '@/components/common/Button';

export const MockInterviewPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { currentQuestion, scores, setScores } = useInterviewStore();

  const handleSimulateScore = () => {
    setScores({
      situation: 90,
      task: 85,
      action: 92,
      result: 88,
      composite: 88.75,
      strengths: ['Specific technical architecture described', 'Clear metrics on latency and revenue'],
      improvements: ['State personal role vs team role earlier in the Task stage'],
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button onClick={onBack} className="text-xs text-slate-400 hover:text-white">← Exit Session</button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">STAR Simulation Agent #6</span>
        <h2 className="text-lg font-bold text-white leading-relaxed">{currentQuestion}</h2>

        <AudioWaveform isRecording={isRecording} />

        <div className="flex gap-3">
          {!isRecording ? (
            <Button variant="primary" onClick={startRecording}>🎙 Start Voice Answer</Button>
          ) : (
            <Button variant="danger" onClick={() => { stopRecording(); handleSimulateScore(); }}>
              ⏹ Stop & Evaluate
            </Button>
          )}
          <Button variant="secondary" onClick={handleSimulateScore}>Simulate STAR Feedback</Button>
        </div>
      </div>

      {scores && <LiveStarScoreboard scores={scores} />}
    </div>
  );
};
