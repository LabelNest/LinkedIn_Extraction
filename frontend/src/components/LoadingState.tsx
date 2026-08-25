import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, Circle, Square } from 'lucide-react';

interface LoadingStateProps {
  onStop?: () => void;
}

const VISUAL_PIPELINE_STEPS = [
  {
    title: 'Validating URL',
    subtitle: 'Checking LinkedIn syntax and format'
  },
  {
    title: 'Enriching Profile',
    subtitle: 'Extracting intelligence via Mindcase pipeline'
  },
  {
    title: 'Structuring Information',
    subtitle: 'Cleaning and standardizing professional records'
  },
  {
    title: 'Preparing Result',
    subtitle: 'Formatting output and response payload'
  }
];

export const LoadingState: React.FC<LoadingStateProps> = ({ onStop }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Step progression animation purely as visual indicators
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < VISUAL_PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 4500);

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden border border-white/10 shadow-2xl">
        {/* Subtle radial aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Main animated spinner */}
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-500 border-r-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight mb-1">
            Enriching LinkedIn Profile
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md">
            Processing may take a few moments...
          </p>

          {/* Timer pill */}
          <div className="mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-blue-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>Processing elapsed: {elapsedSeconds}s</span>
          </div>

          {/* Visual Step Progress List */}
          <div className="w-full mt-6 space-y-2.5 text-left max-w-md">
            {VISUAL_PIPELINE_STEPS.map((step, idx) => {
              const isCompleted = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-blue-500/10 border-blue-500/30 shadow-sm'
                      : isCompleted
                      ? 'bg-white/5 border-white/5 opacity-90'
                      : 'bg-white/[0.02] border-white/5 opacity-40'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold ${isCurrent ? 'text-blue-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight truncate">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stop Enrichment Button inside loading card */}
          {onStop && (
            <div className="mt-6 pt-4 border-t border-white/5 w-full flex flex-col items-center">
              <button
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] ring-2 ring-rose-400/40 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Enrichment (Cancel Process)</span>
              </button>
            </div>
          )}

          <p className="text-[11px] text-slate-500 mt-4">
            Live pipeline execution via <code className="font-mono text-slate-400">POST /api/enrich</code>
          </p>
        </div>
      </div>
    </div>
  );
};
