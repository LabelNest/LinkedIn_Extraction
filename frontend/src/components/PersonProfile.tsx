import React from 'react';
import { 
  User, 
  MapPin, 
  ExternalLink, 
  Briefcase, 
  Clock, 
  GraduationCap, 
  Award, 
  Globe, 
  Languages as LanguagesIcon
} from 'lucide-react';
import { PersonData, PositionData } from '../types';
import { PositionCard } from './PositionCard';
import { EducationCard } from './EducationCard';
import { Skills } from './Skills';
import { Certifications } from './Certifications';

interface PersonProfileProps {
  person: PersonData | null | undefined;
}

export const PersonProfile: React.FC<PersonProfileProps> = ({ person }) => {
  if (!person) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-white/5">
        No profile details available.
      </div>
    );
  }

  const fullName = person.full_name || person.name || 'Anonymous Professional';
  const headline = person.headline || person.title || 'Professional';
  
  // Location normalization
  const city = typeof person.location === 'object' && person.location !== null ? person.location.city : null;
  const state = typeof person.location === 'object' && person.location !== null ? person.location.state : null;
  const country = typeof person.location === 'object' && person.location !== null ? person.location.country : null;
  const locationText = typeof person.location === 'string' 
    ? person.location 
    : [city, state, country].filter(Boolean).join(', ') || null;

  // Positions normalization
  const currentPositions: PositionData[] = person.current_positions || [];
  const historicalPositions: PositionData[] = person.historical_positions || person.past_positions || [];
  const allPositions: PositionData[] = person.positions || [];
  const combinedPositions = [...currentPositions, ...(historicalPositions.length > 0 ? historicalPositions : allPositions)];

  const aboutText = person.about || person.summary || null;
  const linkedinUrl = person.linkedin_url || null;

  // Initials
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || 'LN';

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column (5 Cols on large, 12 on mobile): Profile Summary, Location & Skills */}
      <div className="col-span-12 lg:col-span-5 bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-5 self-start shadow-xl">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{fullName}</h2>
            <p className="text-blue-400 text-sm font-medium leading-tight mt-0.5">{headline}</p>
            {locationText && (
              <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                <MapPin className="w-3 h-3 text-rose-400/80 flex-shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
            )}
          </div>
        </div>

        {/* View on LinkedIn Button */}
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all group"
          >
            <span>View LinkedIn Profile</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}

        {/* Location Card */}
        {(city || state || country) && (
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Location Details</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              {city && (
                <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">City</span>
                  <span className="text-slate-200 font-semibold truncate block">{city}</span>
                </div>
              )}
              {state && (
                <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">State</span>
                  <span className="text-slate-200 font-semibold truncate block">{state}</span>
                </div>
              )}
              {country && (
                <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Country</span>
                  <span className="text-slate-200 font-semibold truncate block">{country}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Card */}
        {aboutText && (
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">About</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {aboutText}
            </p>
          </div>
        )}

        {/* Skills component */}
        {person.skills && <Skills skills={person.skills} />}

        {/* Languages & Meta */}
        {person.languages && person.languages.length > 0 && (
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <LanguagesIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Languages</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {person.languages.map((lang, idx) => (
                <span key={idx} className="text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-white/5">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (7 Cols on large, 12 on mobile): Positions, Education, Certifications */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        {/* Experience Timeline */}
        <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Work Experience</span>
            </h3>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              {combinedPositions.length} Positions
            </span>
          </div>

          {/* Current Positions */}
          {currentPositions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Current Positions ({currentPositions.length})</span>
              </h4>
              <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-500/20">
                {currentPositions.map((pos, idx) => (
                  <PositionCard key={idx} position={pos} isCurrent={true} />
                ))}
              </div>
            </div>
          )}

          {/* Historical Positions */}
          {historicalPositions.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Historical Positions ({historicalPositions.length})</span>
              </h4>
              <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                {historicalPositions.map((pos, idx) => (
                  <PositionCard key={idx} position={pos} isCurrent={false} />
                ))}
              </div>
            </div>
          )}

          {/* Fallback if combined positions list exists but not split */}
          {currentPositions.length === 0 && historicalPositions.length === 0 && allPositions.length > 0 && (
            <div className="space-y-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {allPositions.map((pos, idx) => (
                <PositionCard key={idx} position={pos} isCurrent={idx === 0} />
              ))}
            </div>
          )}

          {combinedPositions.length === 0 && (
            <p className="text-slate-500 text-xs py-4 text-center">No career positions recorded in profile.</p>
          )}
        </div>

        {/* Education & Certifications Row */}
        {((person.education && person.education.length > 0) || (person.certifications && person.certifications.length > 0)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Education Section */}
            {person.education && person.education.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    <span>Education</span>
                  </h3>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {person.education.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {person.education.map((edu, idx) => (
                    <EducationCard key={idx} education={edu} />
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {person.certifications && person.certifications.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-xl">
                <Certifications certifications={person.certifications} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
