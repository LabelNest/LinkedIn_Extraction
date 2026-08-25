import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  id,
  hoverEffect = false 
}) => {
  return (
    <div 
      id={id}
      className={`bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-5 md:p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:border-white/20 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-blue-500/5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface SectionTitleProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  count?: number;
  action?: ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  icon,
  title,
  subtitle,
  count,
  action
}) => {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">{title}</h3>
            {typeof count === 'number' && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {count}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface TagProps {
  text: string;
  variant?: 'blue' | 'slate' | 'emerald' | 'purple';
  icon?: ReactNode;
}

export const Tag: React.FC<TagProps> = ({ text, variant = 'blue', icon }) => {
  const styles = {
    slate: 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40',
    purple: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors whitespace-nowrap ${styles[variant]}`}>
      {icon}
      {text}
    </span>
  );
};

interface InfoPillProps {
  label: string;
  value?: string | number | null;
  icon?: ReactNode;
}

export const InfoPill: React.FC<InfoPillProps> = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs">
      {icon && <span className="text-slate-400">{icon}</span>}
      <span className="text-slate-500 font-medium">{label}:</span>
      <span className="text-slate-200 font-semibold">{value}</span>
    </div>
  );
};
