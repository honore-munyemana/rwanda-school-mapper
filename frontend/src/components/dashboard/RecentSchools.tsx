import { School } from '@/data/rwandaSchools';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface RecentSchoolsProps {
  schools: School[];
}

const statusColors: Record<string, string> = {
  Verified: '#3D7A5C',
  Pending: '#D4A847',
  Unverified: '#8A9BAD',
  Rejected: '#ef4444',
};

export function RecentSchools({ schools }: RecentSchoolsProps) {
  const recentSchools = [...schools]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {recentSchools.map((school, index) => (
        <div
          key={school.id}
          className="group flex items-start gap-4 p-4 rounded-xl border border-white/5 hover:border-[#C4622D]/20 hover:bg-[#C4622D]/5 transition-all duration-300 relative overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Status Indicator Bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 opacity-40 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: statusColors[school.verificationStatus] || '#8A9BAD' }}
          />

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20 border border-white/5 text-[#C4622D]/60 group-hover:text-[#C4622D] transition-colors flex-shrink-0">
            <MapPin className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <h4 className="font-display font-bold text-white text-sm tracking-wide truncate group-hover:text-[#D4A847] transition-colors">{school.name}</h4>
                <p className="text-[10px] font-mono font-black text-[#8A9BAD]/40 uppercase tracking-[0.2em]">
                  {school.district} • {school.id}
                </p>
              </div>
              <div
                className="h-1.5 w-1.5 rounded-full mt-1.5 animate-pulse"
                style={{ backgroundColor: statusColors[school.verificationStatus] || '#8A9BAD', boxShadow: `0 0 8px ${statusColors[school.verificationStatus] || '#8A9BAD'}` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-[9px] font-mono text-[#8A9BAD]/60">
                <Clock className="h-3 w-3" />
                <span className="uppercase">{school.lastUpdated}</span>
              </div>
              <Link to="/schools" className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#C4622D]">
                INTEL <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
