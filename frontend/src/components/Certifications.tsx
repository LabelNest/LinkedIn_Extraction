import React from 'react';
import { Award, Building2, Calendar } from 'lucide-react';
import { CertificationData } from '../types';

interface CertificationsProps {
  certifications: CertificationData[];
}

export const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Certifications</span>
        </h3>
        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
          {certifications.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {certifications.map((cert, idx) => {
          const title = cert.title || cert.name || 'Certification';
          const issuer = cert.issued_by || cert.issuer || cert.organization;
          const issuedAt = cert.issued_at || cert.date;

          return (
            <div key={idx} className="p-3 bg-slate-900/60 rounded-lg border border-white/5 space-y-0.5">
              <h4 className="text-xs font-bold text-white tracking-tight">{title}</h4>
              {issuer && (
                <p className="text-xs text-amber-300/90 font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span>{issuer}</span>
                </p>
              )}
              {issuedAt && (
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  <span>Issued: {issuedAt}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
