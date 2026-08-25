import React from 'react';
import { Cpu } from 'lucide-react';

interface SkillsProps {
  skills: any[];
}

export const Skills: React.FC<SkillsProps> = ({ skills }) => {
  // Normalize skills (handles string[], { name: string }[], or { skill: string }[])
  const skillsList: string[] = (skills || [])
    .map(s => {
      if (typeof s === 'string') return s;
      if (typeof s === 'object' && s !== null) return s.name || s.skill || s.title || '';
      return '';
    })
    .filter(Boolean);

  if (skillsList.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>Skills & Competencies</span>
        </h3>
        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
          {skillsList.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {skillsList.map((skill, idx) => (
          <span 
            key={idx} 
            className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs font-semibold text-blue-300 transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};
