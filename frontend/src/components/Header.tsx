import React from 'react';
import { Sparkles, History, Settings, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { BackendConnectionStatus } from '../types';

interface HeaderProps {
  backendStatus: BackendConnectionStatus;
  backendMessage?: string;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onCheckHealth: () => void;
  onLoadSample: (type: 'person' | 'company') => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  backendStatus,
  backendMessage,
  onOpenHistory,
  onOpenSettings,
  onCheckHealth,
  onLoadSample,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] text-sm tracking-tighter">
            LN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                LABELNEST
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                LinkedIn
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              LinkedIn Intelligence & Enrichment
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Indicator */}
          <button
            onClick={onCheckHealth}
            title={backendMessage || 'Click to test backend connection (GET http://127.0.0.1:8000/)'}
            className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 transition-all text-xs font-medium group"
          >
            {backendStatus === 'checking' ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold hidden sm:inline">Checking</span>
              </>
            ) : backendStatus === 'connected' ? (
              <>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 hidden sm:inline">Backend Connected</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400 hidden sm:inline">Backend Offline</span>
              </>
            )}
          </button>

          {/* Quick Demo Preview Dropdown */}
          <div className="relative group">
            <button
              id="demo-samples-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white text-xs font-medium transition-all"
            >
              <span className="text-blue-400">⚡</span>
              <span className="hidden md:inline">Test</span> Samples
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-48 py-1.5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Load Preview Data
              </div>
              <button
                onClick={() => onLoadSample('person')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-between"
              >
                <span>Satya Nadella</span>
                <span className="text-[10px] text-blue-400 font-mono">Person</span>
              </button>
              <button
                onClick={() => onLoadSample('company')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-between"
              >
                <span>Microsoft Corp</span>
                <span className="text-[10px] text-indigo-400 font-mono">Company</span>
              </button>
            </div>
          </div>

          {/* History Button */}
          <button
            id="view-history-header-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings / API Endpoint Configuration */}
          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            title="Configure Backend API endpoint"
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
