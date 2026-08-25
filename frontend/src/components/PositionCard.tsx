import React from 'react';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { PositionData } from '../types';

interface PositionCardProps {
  position: PositionData;
  isCurrent?: boolean;
}

export const PositionCard: React.FC<PositionCardProps> = ({ position, isCurrent = false }) => {
  const roleTitle = position.position || position.title || 'Role / Position';
  const companyName = position.company_name || position.company || 'Organization';
  const locationText = typeof position.location === 'object' && position.location !== null
    ? [position.location.city, position.location.state, position.location.country].filter(Boolean).join(', ')
    : typeof position.location === 'string'
    ? position.location
    : null;

  const dateRange = [
    position.start_date,
    isCurrent ? (position.end_date || 'Present') : position.end_date
  ].filter(Boolean).join(' — ');

  return (
    <div className="relative pl-7 group">
      {/* Node / Timeline indicator */}
      <div 
        className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-[#020617] flex items-center justify-center z-10 transition-all ${
          isCurrent 
            ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] ring-2 ring-blue-500/30' 
            : 'bg-slate-700 group-hover:bg-slate-600'
        }`}
      />

      <div className="p-3.5 bg-white/5 hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <h4 className={`text-sm font-bold tracking-tight ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
            {roleTitle}
          </h4>
          {isCurrent && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Current
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-blue-400 font-medium">
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-blue-400 flex-shrink-0" />
            {companyName}
          </span>
          {dateRange && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                {dateRange}
              </span>
            </>
          )}
          {locationText && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400/80 flex-shrink-0" />
                {locationText}
              </span>
            </>
          )}
        </div>

        {position.description && (
          <p className="text-xs text-slate-300/90 pt-1.5 leading-relaxed whitespace-pre-line border-t border-white/5 mt-1.5">
            {position.description}
          </p>
        )}
      </div>
    </div>
  );
};
