import React from 'react';

export const AudioWaveform: React.FC<{ isRecording: boolean }> = ({ isRecording }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-14 bg-slate-950/70 border border-slate-800 rounded-xl px-4">
      {[40, 70, 30, 90, 60, 20, 80, 50, 100, 45, 65, 30].map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-200 ${
            isRecording ? 'bg-sky-400 animate-pulse' : 'bg-slate-700'
          }`}
          style={{ height: isRecording ? `${h}%` : '20%' }}
        />
      ))}
    </div>
  );
};
