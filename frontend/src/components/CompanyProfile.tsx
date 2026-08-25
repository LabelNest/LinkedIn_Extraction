import React from 'react';
import { Building2, MapPin, Globe, ExternalLink, Users, Calendar, Layers, Briefcase, FileText } from 'lucide-react';
import { CompanyData } from '../types';
import { EmployeesTable } from './EmployeesTable';

interface CompanyProfileProps {
  company: CompanyData | null | undefined;
  employees: any;
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ company, employees }) => {
  if (!company) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-white/5">
        No company details available.
      </div>
    );
  }

  const companyName = company.name || company.company_name || 'Organization';
  const tagline = company.tagline || company.headline || company.short_description || null;
  const description = company.description || company.about || company.summary || null;
  const website = company.website || company.website_url || null;
  const linkedinUrl = company.linkedin_url || null;

  // HQ normalization
  const hqCity = typeof company.headquarters === 'object' && company.headquarters !== null ? company.headquarters.city : null;
  const hqState = typeof company.headquarters === 'object' && company.headquarters !== null ? company.headquarters.state : null;
  const hqCountry = typeof company.headquarters === 'object' && company.headquarters !== null ? company.headquarters.country : null;
  const hqText = typeof company.headquarters === 'string'
    ? company.headquarters
    : [hqCity, hqState, hqCountry].filter(Boolean).join(', ') || company.location || null;

  // Specialties normalization
  const specialtiesList: string[] = Array.isArray(company.specialties)
    ? company.specialties
    : typeof company.specialties === 'string'
    ? (company.specialties as string).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Initials
  const initials = companyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || 'CO';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (5 cols): Company Overview Card */}
        <div className="col-span-12 lg:col-span-5 bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-5 self-start shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{companyName}</h2>
              {tagline && <p className="text-blue-400 text-sm font-medium leading-tight mt-0.5">{tagline}</p>}
              {hqText && (
                <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                  <MapPin className="w-3 h-3 text-rose-400/80 flex-shrink-0" />
                  <span className="truncate">{hqText}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-2">
            {website && (
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all group"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Website</span>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all group"
              >
                <span>LinkedIn Org</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>

          {/* Company Quick Metrics */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2.5">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
              Company Details
            </h3>
            {company.industry && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>Industry</span>
                </span>
                <span className="text-slate-200 font-semibold">{company.industry}</span>
              </div>
            )}
            {(company.company_size || company.staff_count) && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Company Size</span>
                </span>
                <span className="text-slate-200 font-semibold">
                  {company.company_size || `${company.staff_count} employees`}
                </span>
              </div>
            )}
            {company.founded && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Founded</span>
                </span>
                <span className="text-slate-200 font-semibold">{String(company.founded)}</span>
              </div>
            )}
            {company.type && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Type</span>
                </span>
                <span className="text-slate-200 font-semibold">{company.type}</span>
              </div>
            )}
          </div>

          {/* Specialties */}
          {specialtiesList.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2.5">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                Specialties & Domains
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {specialtiesList.map((spec, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-semibold text-blue-300"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Overview & Personnel */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Description / Overview */}
          {description && (
            <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Overview & Mission</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Employees / Personnel Table Component */}
          <EmployeesTable employees={employees} />
        </div>
      </div>
    </div>
  );
};
