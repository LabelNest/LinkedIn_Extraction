import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Eye, 
  FileJson,
  CheckCircle
} from 'lucide-react';
import { EnrichmentResultItem } from '../types';
import { PersonProfile } from './PersonProfile';
import { CompanyProfile } from './CompanyProfile';
import { Card } from './SharedComponents';

interface ResultSectionProps {
  result: EnrichmentResultItem;
  rawResponse?: any;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ result, rawResponse }) => {
  const [viewMode, setViewMode] = useState<'structured' | 'json'>('structured');
  const [copied, setCopied] = useState(false);

  const payloadToDownload = rawResponse || result;

  const handleDownloadJson = () => {
    try {
      const jsonString = JSON.stringify(payloadToDownload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', 'labelnest-enrichment-result.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download JSON error:', e);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payloadToDownload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy JSON error:', e);
    }
  };

  const resultType = result.type || (result.data?.company ? 'company' : 'person');
  const isPerson = resultType === 'person';
  const personData = result.data?.person || (result as any).person || null;
  const companyData = result.data?.company || (result as any).company || null;
  const employeesData = result.data?.employees || (result as any).employees || null;

  const targetDisplayName = 
    personData?.full_name || 
    personData?.name || 
    companyData?.name || 
    companyData?.company_name || 
    'Intelligence Report';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Top Banner: Enrichment Completed */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl">
        {/* Left Status info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Enrichment Completed
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {resultType}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {targetDisplayName}
            </h3>
            {result.canonical_url && (
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                {result.canonical_url}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Mode Switch: Structured vs Raw JSON */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/60 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('structured')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'structured'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Structured</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'json'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </button>
          </div>

          {/* Copy Raw JSON Button */}
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all active:scale-[0.98]"
            title="Copy response payload"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download JSON Button */}
          <button
            id="download-json-btn"
            onClick={handleDownloadJson}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === 'structured' ? (
        isPerson ? (
          <PersonProfile person={personData} />
        ) : (
          <CompanyProfile company={companyData} employees={employeesData} />
        )
      ) : (
        /* Raw JSON Viewer */
        <Card className="font-mono text-xs overflow-hidden p-0 border border-white/10 bg-slate-900/60">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-[11px] text-slate-400 ml-2">labelnest-enrichment-result.json</span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans uppercase">application/json</span>
          </div>
          <pre className="p-5 text-slate-300 bg-slate-950/60 overflow-x-auto max-h-[600px] leading-relaxed select-all">
            {JSON.stringify(payloadToDownload, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};
