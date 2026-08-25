import React from 'react';
import { Users, ExternalLink, MapPin, Briefcase } from 'lucide-react';
import { EmployeeData } from '../types';

interface EmployeesTableProps {
  employees: any;
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({ employees }) => {
  const employeeList: EmployeeData[] = Array.isArray(employees)
    ? employees
    : typeof employees === 'object' && employees !== null
    ? Object.values(employees).filter(item => typeof item === 'object' && item !== null)
    : [];

  if (employeeList.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span>Associated Personnel & Key Members</span>
        </h3>
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          {employeeList.length} Members
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {employeeList.map((emp, idx) => {
          const empName = emp.full_name || emp.name || 'Team Member';
          const empTitle = emp.title || emp.headline || emp.position || 'Professional';
          const empLoc = typeof emp.location === 'object' && emp.location !== null
            ? [emp.location.city, emp.location.state, emp.location.country].filter(Boolean).join(', ')
            : typeof emp.location === 'string'
            ? emp.location
            : null;

          return (
            <div 
              key={idx} 
              className="p-4 bg-white/5 hover:bg-white/[0.08] border border-white/5 rounded-xl flex items-start justify-between gap-3 transition-all"
            >
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight truncate">
                  {empName}
                </h4>
                <p className="text-xs text-blue-400 font-medium line-clamp-2 leading-tight">
                  {empTitle}
                </p>
                {emp.department && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span>Dept: {emp.department}</span>
                  </p>
                )}
                {empLoc && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-rose-400/70 flex-shrink-0" />
                    <span className="truncate">{empLoc}</span>
                  </p>
                )}
              </div>

              {emp.linkedin_url && (
                <a
                  href={emp.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                  title="Open LinkedIn Profile"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
