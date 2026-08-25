import React from 'react';
import { AlertTriangle, RefreshCw, ExternalLink, Settings, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  onOpenSettings?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  onOpenSettings,
}) => {
  const isConnectionError = 
    message.toLowerCase().includes('failed to fetch') || 
    message.toLowerCase().includes('unable to reach') ||
    message.toLowerCase().includes('connection');

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="rounded-2xl p-5 bg-rose-950/40 border border-rose-800/60 backdrop-blur-xl relative overflow-hidden shadow-xl shadow-rose-950/20">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-rose-200 tracking-tight">
              Enrichment Request Error
            </h4>
            <p className="text-xs sm:text-sm text-rose-300/90 mt-1 leading-relaxed break-words">
              {message}
            </p>

            {isConnectionError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-900/30 border border-rose-800/40 text-xs text-rose-300/80 space-y-1.5">
                <p className="font-semibold text-rose-200">Troubleshooting Checklist:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Verify that your FastAPI backend is running on <code className="font-mono text-rose-100">http://127.0.0.1:8000</code></li>
                  <li>Ensure FastAPI CORS middleware is enabled: <code className="font-mono text-rose-100">CORSMiddleware(allow_origins=["*"])</code></li>
                  <li>If testing on a different port or remote host, click backend settings below to update the endpoint URL.</li>
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              )}

              {onOpenSettings && isConnectionError && (
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure API URL</span>
                </button>
              )}
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-rose-400/70 hover:text-rose-200 p-1 rounded-lg transition-colors"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
