import React, { useState, useEffect } from 'react';
import { 
  History, 
  X, 
  ExternalLink, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Server
} from 'lucide-react';
import { HistoryRecord } from '../types';
import { apiService } from '../services/api';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (record: HistoryRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectRecord,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryRecord[]>([]);
  const [source, setSource] = useState<'backend' | 'local'>('local');
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const res = await apiService.getHistory();
      setSource(res.source);
      
      if (res.source === 'backend' && res.items.length > 0) {
        setHistoryItems(res.items);
      } else {
        // Local history
        const local = apiService.getLocalHistory();
        setHistoryItems(local);
        if (res.source === 'local') {
          setErrorNotice('Backend history endpoint (GET /api/history) is not active yet. Showing local session cache.');
        }
      }
    } catch {
      const local = apiService.getLocalHistory();
      setHistoryItems(local);
      setSource('local');
      setErrorNotice('History service is not available yet on backend. Showing local browser history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    apiService.clearLocalHistory();
    setHistoryItems([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Enrichment History
              </h3>
              <p className="text-xs text-slate-400">
                Past LinkedIn profiles and company intelligence queries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              disabled={loading}
              title="Refresh history"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational banner about backend history */}
        {errorNotice && (
          <div className="px-6 py-2.5 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-2.5 text-xs text-blue-300">
            <Server className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="truncate">{errorNotice}</span>
          </div>
        )}

        {/* Body list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              <span>Loading intelligence history...</span>
            </div>
          ) : historyItems.length > 0 ? (
            historyItems.map((item, idx) => {
              const isCompany = item.type === 'company';
              const dateStr = item.timestamp 
                ? new Date(item.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recent';

              return (
                <div
                  key={item.id || idx}
                  onClick={() => {
                    onSelectRecord(item);
                    onClose();
                  }}
                  className="group p-4 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isCompany 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {isCompany ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {item.targetName || item.url}
                        </h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.2 rounded ${
                          isCompany 
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' 
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                        }`}>
                          {item.type || 'Profile'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate font-mono">
                        {item.url}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{dateStr}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-600 text-blue-400 group-hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No History Records Found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Profiles and company URLs enriched during this session will be preserved here for instant review.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {historyItems.length} record{historyItems.length === 1 ? '' : 's'} recorded
          </div>

          <div className="flex items-center gap-3">
            {historyItems.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Local History</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
