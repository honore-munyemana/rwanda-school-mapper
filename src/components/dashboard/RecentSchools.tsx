import { School } from '@/data/rwandaSchools';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface RecentSchoolsProps {
  schools: School[];
}

const statusStyles = {
  Verified: 'status-verified',
  Pending: 'status-pending',
  Unverified: 'status-unverified',
  Rejected: 'status-rejected',
};

export function RecentSchools({ schools }: RecentSchoolsProps) {
  const recentSchools = [...schools]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl border p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Link
          to="/schools"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          View all
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-4">
        {recentSchools.map((school) => (
          <div
            key={school.id}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-sm truncate">{school.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {school.district}, {school.province}
                  </p>
                </div>
                <span className={cn('status-badge flex-shrink-0', statusStyles[school.verificationStatus])}>
                  {school.verificationStatus}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Updated {school.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
