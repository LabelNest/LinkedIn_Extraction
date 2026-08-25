import React from 'react';
import { Layers, ShieldCheck, Database, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="text-center pt-8 pb-6 px-4 max-w-4xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-5 backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
          Mindcase + Sarvam AI Engine
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
        Turn LinkedIn URLs into{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          Structured Intelligence
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
        Enrich professional profiles and companies with AI-powered intelligence in seconds.
      </p>

      {/* Pipeline Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
          <Zap className="w-3 h-3 text-blue-400" />
          <span>Real-time Extraction</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
          <Layers className="w-3 h-3 text-indigo-400" />
          <span>Entity Normalization</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
          <Database className="w-3 h-3 text-blue-400" />
          <span>PostgreSQL / Neon Sync</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Direct JSON Export</span>
        </div>
      </div>
    </section>
  );
};

