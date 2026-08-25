import React from 'react';
import { GraduationCap, Calendar, BookOpen } from 'lucide-react';
import { EducationData } from '../types';

interface EducationCardProps {
  education: EducationData;
}

export const EducationCard: React.FC<EducationCardProps> = ({ education }) => {
  const schoolName = education.school_name || education.school || 'University / Institution';
  const degree = education.degree;
  const fieldOfStudy = education.field_of_study || education.field;
  const degreeField = [degree, fieldOfStudy].filter(Boolean).join(' in ');

  const dateRange = [education.start_date, education.end_date].filter(Boolean).join(' — ');

  return (
    <div className="p-3.5 bg-white/5 hover:bg-white/[0.08] border border-white/5 rounded-xl transition-all space-y-1">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
          {schoolName}
        </h4>
      </div>

      {degreeField && (
        <p className="text-xs text-blue-400 font-medium flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span>{degreeField}</span>
        </p>
      )}

      {dateRange && (
        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
          <Calendar className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <span>{dateRange}</span>
        </p>
      )}
    </div>
  );
};
