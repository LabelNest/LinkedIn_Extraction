import React, { useState } from 'react';
import { Settings, X, Server, CheckCircle2, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { apiService } from '../services/api';

interface BackendSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const BackendSettingsModal: React.FC<BackendSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiUrl, setApiUrl] = useState(apiService.getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiService.checkBackendHealth(apiUrl.trim());
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ connected: false, message: e.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    apiService.setApiBaseUrl(apiUrl.trim());
    onSaved();
    onClose();
  };

  const handleReset = () => {
    const defaultUrl = apiService.resetApiBaseUrl();
    setApiUrl(defaultUrl);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Backend API Settings
              </h3>
              <p className="text-xs text-slate-400">
                FastAPI LinkedIn enrichment endpoint configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              FastAPI Server Base URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => {
                  setApiUrl(e.target.value);
                  setTestResult(null);
                }}
                placeholder="http://127.0.0.1:8000"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Default: <code className="font-mono text-slate-300">http://127.0.0.1:8000</code>. Used for <code className="font-mono text-slate-300">POST /api/enrich</code> and health checks.
            </p>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
              testResult.connected 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              {testResult.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-bold">
                  {testResult.connected ? 'Connection Succeeded' : 'Connection Failed'}
                </p>
                <p className="opacity-90">{testResult.message || (testResult.connected ? 'Server is online and responding.' : 'Unable to connect.')}</p>
              </div>
            </div>
          )}

          {/* Tips card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Backend Specifications:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li>Enrichment: <code className="font-mono text-slate-300">POST /api/enrich</code></li>
              <li>Payload: <code className="font-mono text-slate-300">&#123; "urls": ["..."] &#125;</code></li>
              <li>Root Health: <code className="font-mono text-slate-300">GET /</code></li>
              <li>History: <code className="font-mono text-slate-300">GET /api/history</code></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing || !apiUrl.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleReset}
              title="Reset to http://127.0.0.1:8000"
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all glow-blue-btn"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
