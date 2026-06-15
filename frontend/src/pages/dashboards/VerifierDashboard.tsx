import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  AlertCircle,
  TrendingUp,
  ClipboardCheck,
  Navigation,
  Loader2,
  History,
  Search,
  Wifi,
  Zap,
  Monitor,
  Trees,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

interface AnalyticsOverview {
  totalSchools: number;
  verifiedSchools: number;
  pendingSchools: number;
  unverifiedSchools: number;
}

interface SchoolListItem {
  id: number;
  name: string;
  district: string;
  status: string;
  school_type?: string | null;
  education_level?: string | null;
  smart_score?: number | null;
  has_internet?: boolean;
  has_electricity?: boolean;
  has_smart_classroom?: boolean;
  has_playground?: boolean;
}

interface SchoolDetail extends SchoolListItem {
  latitude?: number | null;
  longitude?: number | null;
}

interface VerificationAuditLog {
  id: number;
  school_name?: string;
  schoolName?: string;
  verifier_email?: string;
  verifierEmail?: string;
  verifier_full_name?: string;
  verifierFullName?: string;
  result: string;
  created_at?: string;
  timestamp?: string;
}

const statusStyles: Record<string, string> = {
  verified: 'bg-[#3D7A5C]/20 text-[#3D7A5C] border-[#3D7A5C]/30',
  pending: 'bg-[#D4A847]/20 text-[#D4A847] border-[#D4A847]/30',
  unverified: 'bg-[#8A9BAD]/20 text-[#8A9BAD] border-[#8A9BAD]/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const resultStyles: Record<string, string> = {
  verified: 'bg-[#3D7A5C]/20 text-[#3D7A5C] border-[#3D7A5C]/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

function normalizeStatus(status: string | null | undefined): string {
  return (status || 'Unverified').trim();
}

function isQueueStatus(status: string | null | undefined): boolean {
  const normalized = normalizeStatus(status).toLowerCase();
  return normalized === 'pending' || normalized === 'unverified';
}

function parseSchoolsFromGeoJSON(geojson: {
  features?: Array<{
    properties: { id: number; name: string; district: string; status?: string };
  }>;
}): SchoolListItem[] {
  return (geojson.features || []).map((feature) => ({
    id: feature.properties.id,
    name: feature.properties.name,
    district: feature.properties.district,
    status: normalizeStatus(feature.properties.status),
  }));
}

async function enrichSchoolDetail(token: string, school: SchoolListItem): Promise<SchoolDetail> {
  try {
    const res = await fetch(`${API_BASE}/reports/schools/${school.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return school;
    const detail = await res.json();
    return {
      ...school,
      ...detail,
      status: normalizeStatus(detail.status ?? school.status),
    };
  } catch {
    return school;
  }
}

async function fetchAuditLogs(token: string): Promise<VerificationAuditLog[]> {
  let res = await fetch(`${API_BASE}/audit`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 403) {
    res = await fetch(`${API_BASE}/reports/audit`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(typeof errData.error === 'string' ? errData.error : 'Failed to load audit activity');
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function InfrastructureIndicator({ label, active, icon }: { label: string; active?: boolean; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-[#0F1923]/60 p-3 rounded-md border border-white/10">
      <div className="flex items-center gap-2">
        <span className={cn('text-[#8A9BAD]', active && 'text-[#D4A847]')}>{icon}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">{label}</span>
      </div>
      <Badge
        variant="outline"
        className={cn(
          'text-[10px] font-bold uppercase',
          active
            ? 'bg-[#3D7A5C]/10 text-[#3D7A5C] border-[#3D7A5C]/30'
            : 'bg-white/5 text-[#8A9BAD] border-white/10'
        )}
      >
        {active ? 'Yes' : 'No'}
      </Badge>
    </div>
  );
}

export default function VerifierDashboard() {
  const { token, user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [queueSchools, setQueueSchools] = useState<SchoolDetail[]>([]);
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLog[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Unverified'>('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'success' | 'error' | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [overviewRes, schoolsRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/overview`, { headers }),
        fetch(`${API_BASE}/schools`),
      ]);

      if (overviewRes.ok) {
        setOverview(await overviewRes.json());
      }

      if (schoolsRes.ok) {
        const geojson = await schoolsRes.json();
        const allSchools = parseSchoolsFromGeoJSON(geojson);
        const queueBase = allSchools.filter((s) => isQueueStatus(s.status));
        const enriched = await Promise.all(queueBase.map((s) => enrichSchoolDetail(token, s)));
        setQueueSchools(enriched);
        setSelectedSchoolId((prev) => {
          if (prev !== null && enriched.some((s) => s.id === prev)) return prev;
          return enriched[0]?.id ?? null;
        });
      }

      try {
        const logs = await fetchAuditLogs(token);
        setAuditLogs(logs);
        setAuditError(null);
      } catch (err) {
        setAuditError(err instanceof Error ? err.message : 'Failed to load audit activity');
      }
    } catch {
      toast.error('Failed to load validator dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const districts = useMemo(
    () => [...new Set(queueSchools.map((s) => s.district).filter(Boolean))].sort(),
    [queueSchools]
  );

  const filteredQueue = useMemo(() => {
    return queueSchools.filter((school) => {
      if (statusFilter !== 'all' && normalizeStatus(school.status) !== statusFilter) return false;
      if (districtFilter !== 'all' && school.district !== districtFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          school.name.toLowerCase().includes(q) ||
          school.district.toLowerCase().includes(q) ||
          String(school.id).includes(q)
        );
      }
      return true;
    });
  }, [queueSchools, statusFilter, districtFilter, searchQuery]);

  const selectedSchool = useMemo(
    () => queueSchools.find((s) => s.id === selectedSchoolId) ?? null,
    [queueSchools, selectedSchoolId]
  );

  const verificationRate = useMemo(() => {
    if (!overview || overview.totalSchools === 0) return 0;
    return Number(((overview.verifiedSchools / overview.totalSchools) * 100).toFixed(1));
  }, [overview]);

  const handleSelectSchool = async (schoolId: number) => {
    setSelectedSchoolId(schoolId);
    setVerifyResult(null);
    setVerifyMessage(null);

    if (!token) return;
    const school = queueSchools.find((s) => s.id === schoolId);
    if (!school || school.smart_score !== undefined) return;

    const enriched = await enrichSchoolDetail(token, school);
    setQueueSchools((prev) => prev.map((s) => (s.id === schoolId ? enriched : s)));
  };

  const handleVerifyGPS = () => {
    if (!selectedSchool || !token) {
      toast.error('Select a school before verifying.');
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device.');
      setVerifyResult('error');
      setVerifyMessage('Geolocation is not supported on this device.');
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);
    setVerifyMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`${API_BASE}/verify`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              school_id: selectedSchool.id,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              notes: 'Verified via GPS by field officer',
            }),
          });

          const data = await res.json().catch(() => ({}));

          if (res.ok) {
            setVerifyResult('success');
            setVerifyMessage(data.message || 'School verified successfully.');
            toast.success('School verified successfully.');
            await loadDashboardData();
          } else {
            const message =
              typeof data.error === 'string'
                ? data.error
                : 'Verification failed. Please try again.';
            setVerifyResult('error');
            setVerifyMessage(message);
            toast.error(message);
          }
        } catch {
          setVerifyResult('error');
          setVerifyMessage('Network error during verification.');
          toast.error('Failed to verify school.');
        } finally {
          setIsVerifying(false);
        }
      },
      (error) => {
        setIsVerifying(false);
        const messages: Record<number, string> = {
          1: 'Location access denied. Enable location permissions and try again.',
          2: 'Location unavailable. Move to an open area and try again.',
          3: 'Location request timed out. Please try again.',
        };
        const message = messages[error.code] ?? `Failed to get location: ${error.message}`;
        setVerifyResult('error');
        setVerifyMessage(message);
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const formatDate = (value?: string) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const getAuditSchoolName = (log: VerificationAuditLog) =>
    log.school_name || log.schoolName || 'Unknown School';

  const getAuditValidator = (log: VerificationAuditLog) =>
    log.verifier_full_name || log.verifierFullName || log.verifier_email || log.verifierEmail || 'N/A';

  const getAuditTimestamp = (log: VerificationAuditLog) =>
    log.created_at || log.timestamp;

  const recentAudit = auditLogs.slice(0, 8);

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
        <Skeleton className="h-96 rounded-2xl bg-white/5 border border-white/5" />
      </div>
    );
  }

  const activeOverview: AnalyticsOverview = overview ?? {
    totalSchools: 0,
    verifiedSchools: 0,
    pendingSchools: 0,
    unverifiedSchools: 0,
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="border-l-4 border-[#C4622D] pl-6 py-2 space-y-2">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-[#D4A847]" />
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#8A9BAD]/60">
            Field Verification Operations
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white uppercase italic">
          Validator <span className="text-[#D4A847]">Dashboard</span>
        </h1>
        <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
          SSEVMS — {user?.name ?? 'Validator'} • GPS verification command post
        </p>
      </div>

      {/* Section 1 — KPI Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Schools"
          value={activeOverview.totalSchools}
          description="Registered nationally"
          icon={<School className="h-5 w-5" />}
          variant="primary"
        />
        <StatsCard
          title="Verified Schools"
          value={activeOverview.verifiedSchools}
          description="Completed verifications"
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          title="Unverified Schools"
          value={activeOverview.unverifiedSchools}
          description="Require field validation"
          icon={<AlertCircle className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          title="Verification Rate"
          value={`${verificationRate}%`}
          description="National completion index"
          icon={<TrendingUp className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Sections 2 & 3 — Queue + Detail Panel */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Section 2 — Verification Queue */}
        <div className="xl:col-span-7 bg-[#141C25]/85 rounded-xl border border-white/5 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/5 space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Verification Queue</h3>
              <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">
                Pending and unverified schools requiring attention
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9BAD]/50" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, district, or ID..."
                  className="pl-10 bg-[#0F1923] border-white/10 text-[#EEE8DC] font-mono text-xs placeholder:text-[#8A9BAD]/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-full sm:w-[160px] bg-[#0F1923] border-white/10 text-[#EEE8DC] font-mono text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#141C25] border-white/10 text-[#EEE8DC]">
                  <SelectItem value="all">All Queue</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="w-full sm:w-[160px] bg-[#0F1923] border-white/10 text-[#EEE8DC] font-mono text-xs">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent className="bg-[#141C25] border-white/10 text-[#EEE8DC]">
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
                No schools in the verification queue
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">School Name</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">District</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90 hidden md:table-cell">School Type</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90 hidden lg:table-cell">Education Level</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">Status</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90 hidden sm:table-cell">Smart Score</TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue.map((school) => (
                    <TableRow
                      key={school.id}
                      className={cn(
                        'border-white/5 hover:bg-white/5 cursor-pointer',
                        selectedSchoolId === school.id && 'bg-[#C4622D]/10'
                      )}
                      onClick={() => handleSelectSchool(school.id)}
                    >
                      <TableCell className="font-medium text-[#EEE8DC]">{school.name}</TableCell>
                      <TableCell className="font-mono text-xs text-[#8A9BAD]">{school.district}</TableCell>
                      <TableCell className="font-mono text-xs text-[#8A9BAD] hidden md:table-cell">
                        {school.school_type || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#8A9BAD] hidden lg:table-cell">
                        {school.education_level || '—'}
                      </TableCell>
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
                      <TableCell className="font-mono text-xs text-[#D4A847] hidden sm:table-cell">
                        {school.smart_score ?? '—'} / 4
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSchool(school.id);
                          }}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Section 3 & 4 — School Detail + GPS Verify */}
        <div className="xl:col-span-5 bg-[#141C25]/85 rounded-xl border border-white/5 p-6 shadow-xl space-y-5">
          <div>
            <h3 className="font-display text-lg font-bold text-white">School Detail Panel</h3>
            <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">
              Review record before GPS verification
            </p>
          </div>

          {!selectedSchool ? (
            <div className="py-12 text-center">
              <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
                Select a school from the queue
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">Name</p>
                  <p className="text-white font-display font-bold text-lg">{selectedSchool.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">District</p>
                    <p className="font-mono text-sm text-[#EEE8DC]">{selectedSchool.district}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">Status</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] mt-1 font-bold uppercase',
                        statusStyles[normalizeStatus(selectedSchool.status).toLowerCase()] ??
                          'bg-white/5 text-[#8A9BAD] border-white/10'
                      )}
                    >
                      {normalizeStatus(selectedSchool.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">School Type</p>
                    <p className="font-mono text-sm text-[#EEE8DC]">{selectedSchool.school_type || '—'}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">Education Level</p>
                    <p className="font-mono text-sm text-[#EEE8DC]">{selectedSchool.education_level || '—'}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">Smart Score</p>
                    <p className="font-mono text-sm text-[#D4A847]">{selectedSchool.smart_score ?? '—'} / 4</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD] font-bold">
                  Infrastructure Indicators
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <InfrastructureIndicator label="Internet" active={selectedSchool.has_internet} icon={<Wifi className="h-4 w-4" />} />
                  <InfrastructureIndicator label="Electricity" active={selectedSchool.has_electricity} icon={<Zap className="h-4 w-4" />} />
                  <InfrastructureIndicator label="Smart Classroom" active={selectedSchool.has_smart_classroom} icon={<Monitor className="h-4 w-4" />} />
                  <InfrastructureIndicator label="Playground" active={selectedSchool.has_playground} icon={<Trees className="h-4 w-4" />} />
                </div>
              </div>

              <div className="pt-2 space-y-3 border-t border-white/5">
                <Button
                  type="button"
                  onClick={handleVerifyGPS}
                  disabled={isVerifying || normalizeStatus(selectedSchool.status).toLowerCase() === 'verified'}
                  className="w-full h-12 bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-xs uppercase tracking-widest gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Capturing GPS & Verifying...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      Verify with GPS
                    </>
                  )}
                </Button>

                {verifyResult === 'success' && verifyMessage && (
                  <div className="p-3 rounded-lg bg-[#3D7A5C]/10 border border-[#3D7A5C]/30">
                    <p className="font-mono text-xs text-[#3D7A5C] uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {verifyMessage}
                    </p>
                  </div>
                )}

                {verifyResult === 'error' && verifyMessage && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="font-mono text-xs text-red-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {verifyMessage}
                    </p>
                  </div>
                )}

                <p className="font-mono text-[9px] text-[#8A9BAD]/70 uppercase tracking-wider leading-relaxed">
                  GPS coordinates are captured automatically. You must be within 100 meters of the school to verify.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section 5 — Recent Validation Activity */}
      <div className="bg-[#141C25]/85 rounded-xl border border-white/5 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-[#C4622D]" />
            Recent Validation Activity
          </h3>
          <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">
            Latest verification audit entries
          </p>
        </div>

        {auditError ? (
          <div className="py-12 text-center">
            <p className="font-mono text-sm text-red-400">{auditError}</p>
          </div>
        ) : recentAudit.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
              No verification events recorded yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">School</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">Validator</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">Result</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAudit.map((log) => (
                  <TableRow key={log.id ?? log.created_at} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-[#EEE8DC]">{getAuditSchoolName(log)}</TableCell>
                    <TableCell className="font-mono text-xs text-[#8A9BAD]">{getAuditValidator(log)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-2 py-0 h-5 font-bold uppercase tracking-wider',
                          resultStyles[log.result] ?? 'bg-white/5 text-[#8A9BAD] border-white/10'
                        )}
                      >
                        {log.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#8A9BAD]">
                      {formatDate(getAuditTimestamp(log))}
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
