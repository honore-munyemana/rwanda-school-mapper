import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DistrictChart } from '@/components/dashboard/DistrictChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  School,
  CheckCircle,
  GraduationCap,
  MapPin,
  Navigation,
  Map,
  BarChart3,
  FileText,
  Wifi,
  Zap,
  Monitor,
  Trees,
  Plus,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

interface AnalyticsOverview {
  totalSchools: number;
  verifiedSchools: number;
  unverifiedSchools: number;
  averageSmartScore: number;
  schoolsWithInternet: number;
  schoolsWithElectricity: number;
  schoolsWithPlayground: number;
  schoolsWithSmartClassroom: number;
  internetPercentage: number;
  electricityPercentage: number;
  playgroundPercentage: number;
  smartClassroomPercentage: number;
}

interface RegistrySchool {
  id: number;
  name: string;
  district: string;
  status: string;
}

const statusStyles: Record<string, string> = {
  verified: 'bg-[#3D7A5C]/20 text-[#3D7A5C] border-[#3D7A5C]/30',
  pending: 'bg-[#D4A847]/20 text-[#D4A847] border-[#D4A847]/30',
  unverified: 'bg-[#8A9BAD]/20 text-[#8A9BAD] border-[#8A9BAD]/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

function normalizeStatus(status: string | null | undefined): string {
  return (status || 'Unverified').trim();
}

function parseSchoolsFromGeoJSON(geojson: {
  features?: Array<{
    properties: { id: number; name: string; district: string; status?: string };
  }>;
}): RegistrySchool[] {
  return (geojson.features || []).map((feature) => ({
    id: feature.properties.id,
    name: feature.properties.name,
    district: feature.properties.district,
    status: normalizeStatus(feature.properties.status),
  }));
}

function InfrastructureStatusCard({
  label,
  count,
  percentage,
  icon,
  accent,
}: {
  label: string;
  count: number;
  percentage: number;
  icon: ReactNode;
  accent: 'primary' | 'gold' | 'success' | 'default';
}) {
  const accentBorder = {
    primary: 'border-[#C4622D]/20',
    gold: 'border-[#D4A847]/20',
    success: 'border-[#3D7A5C]/20',
    default: 'border-white/10',
  }[accent];

  const accentText = {
    primary: 'text-[#C4622D]',
    gold: 'text-[#D4A847]',
    success: 'text-[#3D7A5C]',
    default: 'text-[#8A9BAD]',
  }[accent];

  return (
    <div
      className={cn(
        'rounded-xl border bg-[#141C25]/60 backdrop-blur-xl p-5 shadow-lg transition-all hover:border-white/10',
        accentBorder
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8A9BAD]/60">{label}</p>
          <p className="text-3xl font-display font-bold text-white tabular-nums">{count}</p>
          <p className={cn('font-mono text-xs font-bold uppercase tracking-wider', accentText)}>
            {percentage}% of registry
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-[#0F1923]/60">
          {icon}
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-[#0F1923] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', {
            'bg-[#C4622D]': accent === 'primary',
            'bg-[#D4A847]': accent === 'gold',
            'bg-[#3D7A5C]': accent === 'success',
            'bg-[#8A9BAD]': accent === 'default',
          })}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}

export default function MapperDashboard() {
  const { token, user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [districts, setDistricts] = useState<Record<string, number>>({});
  const [recentSchools, setRecentSchools] = useState<RegistrySchool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [overviewRes, districtsRes, schoolsRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/overview`, { headers }),
          fetch(`${API_BASE}/analytics/districts`, { headers }),
          fetch(`${API_BASE}/schools`),
        ]);

        if (overviewRes.ok) {
          setOverview(await overviewRes.json());
        }

        if (districtsRes.ok) {
          const districtsData = await districtsRes.json();
          setDistricts(typeof districtsData === 'object' && districtsData !== null ? districtsData : {});
        }

        if (schoolsRes.ok) {
          const geojson = await schoolsRes.json();
          const schools = parseSchoolsFromGeoJSON(geojson);
          const latest = [...schools].sort((a, b) => b.id - a.id).slice(0, 10);
          setRecentSchools(latest);
        }
      } catch {
        toast.error('Failed to load mapper dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const districtRows = useMemo(
    () =>
      Object.entries(districts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    [districts]
  );

  if (loading) {
    return (
      <div className="space-y-8 pb-10 animate-pulse">
        <div className="space-y-3 border-l-4 border-[#C4622D] pl-6">
          <Skeleton className="h-10 w-96 bg-white/5" />
          <Skeleton className="h-4 w-72 bg-white/5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl bg-white/5 border border-white/5" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-white/5 border border-white/5" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl bg-white/5 border border-white/5" />
      </div>
    );
  }

  const activeOverview: AnalyticsOverview = overview ?? {
    totalSchools: 0,
    verifiedSchools: 0,
    unverifiedSchools: 0,
    averageSmartScore: 0,
    schoolsWithInternet: 0,
    schoolsWithElectricity: 0,
    schoolsWithPlayground: 0,
    schoolsWithSmartClassroom: 0,
    internetPercentage: 0,
    electricityPercentage: 0,
    playgroundPercentage: 0,
    smartClassroomPercentage: 0,
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="border-l-4 border-[#C4622D] pl-6 py-2 space-y-2">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-[#D4A847]" />
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#8A9BAD]/60">
            Field Operations Command
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white uppercase italic">
          Mapper <span className="text-[#D4A847]">Dashboard</span>
        </h1>
        <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
          SSEVMS — {user?.name ?? 'Field Mapper'} • Geographic data capture & registry intelligence
        </p>
      </div>

      {/* Section 1 — KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Schools"
          value={activeOverview.totalSchools}
          description="National registry"
          icon={<School className="h-5 w-5" />}
          variant="primary"
        />
        <StatsCard
          title="Verified Schools"
          value={activeOverview.verifiedSchools}
          description="Field-validated records"
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          title="Districts Covered"
          value={Object.keys(districts).length}
          description="Active districts"
          icon={<MapPin className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          title="Average Smart Score"
          value={`${activeOverview.averageSmartScore} / 4`}
          description="Infrastructure index"
          icon={<GraduationCap className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Section 2 — Smart Infrastructure Status */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#D4A847]" />
          Smart Infrastructure Status
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfrastructureStatusCard
            label="Schools with Internet"
            count={activeOverview.schoolsWithInternet}
            percentage={activeOverview.internetPercentage}
            icon={<Wifi className="h-5 w-5 text-[#C4622D]" />}
            accent="primary"
          />
          <InfrastructureStatusCard
            label="Schools with Electricity"
            count={activeOverview.schoolsWithElectricity}
            percentage={activeOverview.electricityPercentage}
            icon={<Zap className="h-5 w-5 text-[#D4A847]" />}
            accent="gold"
          />
          <InfrastructureStatusCard
            label="Smart Classrooms"
            count={activeOverview.schoolsWithSmartClassroom}
            percentage={activeOverview.smartClassroomPercentage}
            icon={<Monitor className="h-5 w-5 text-[#3D7A5C]" />}
            accent="success"
          />
          <InfrastructureStatusCard
            label="Schools with Playground"
            count={activeOverview.schoolsWithPlayground}
            percentage={activeOverview.playgroundPercentage}
            icon={<Trees className="h-5 w-5 text-[#8A9BAD]" />}
            accent="default"
          />
        </div>
      </div>

      {/* Sections 3, 4, 5 — District + Actions + Registry */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Section 3 — District Distribution */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-[#141C25]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 md:p-8 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4A847] mb-6 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              District School Distribution
            </h3>
            {Object.keys(districts).length > 0 ? (
              <DistrictChart data={districts} />
            ) : (
              <div className="flex items-center justify-center h-[280px] text-[#8A9BAD] font-mono text-xs uppercase tracking-widest">
                No district data available
              </div>
            )}
          </div>

          <div className="bg-[#141C25]/85 rounded-xl border border-white/5 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="font-display text-lg font-bold text-white">District Breakdown</h3>
              <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">
                School counts by district
              </p>
            </div>
            {districtRows.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">No districts recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                        District Name
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                        School Count
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                        Avg Smart Score
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {districtRows.map((row) => (
                      <TableRow key={row.name} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-medium text-[#EEE8DC]">{row.name}</TableCell>
                        <TableCell className="font-mono text-xs text-[#D4A847]">{row.count}</TableCell>
                        <TableCell className="font-mono text-xs text-[#8A9BAD]">—</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Section 4 — Quick Actions */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-[#141C25]/85 rounded-xl border border-white/5 p-6 shadow-xl space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="h-5 w-5 text-[#C4622D]" />
              Quick Actions
            </h3>
            <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest">
              Field mapping shortcuts
            </p>
            <Button
              asChild
              className="w-full h-11 bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-[10px] uppercase tracking-widest gap-2"
            >
              <Link to="/submit-school">
                <Plus className="h-4 w-4" />
                Submit New School
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-11 border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest gap-2"
            >
              <Link to="/map">
                <Map className="h-4 w-4 text-[#D4A847]" />
                Open GIS Map
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-11 border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest gap-2"
            >
              <Link to="/analytics">
                <BarChart3 className="h-4 w-4 text-[#D4A847]" />
                Analytics
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full h-11 border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest gap-2"
            >
              <Link to="/reports">
                <FileText className="h-4 w-4 text-[#8A9BAD]" />
                Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Section 5 — Recent School Registry */}
      <div className="bg-[#141C25]/85 rounded-xl border border-white/5 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <School className="h-5 w-5 text-[#C4622D]" />
            Recent School Registry
          </h3>
          <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">
            Latest entries in the national database (by record ID)
          </p>
        </div>

        {recentSchools.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">No schools registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                    School Name
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                    District
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSchools.map((school) => (
                  <TableRow key={school.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-[#EEE8DC]">{school.name}</TableCell>
                    <TableCell className="font-mono text-xs text-[#8A9BAD]">{school.district}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider',
                          statusStyles[normalizeStatus(school.status).toLowerCase()] ??
                            'bg-white/5 text-[#8A9BAD] border-white/10'
                        )}
                      >
                        {normalizeStatus(school.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
