import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { VerificationChart } from '@/components/dashboard/VerificationChart';
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
  AlertCircle,
  GraduationCap,
  Shield,
  Download,
  FileText,
  Users,
  History,
  Settings,
  Loader2,
  BarChart3,
} from 'lucide-react';

interface AnalyticsOverview {
  totalSchools: number;
  verifiedSchools: number;
  pendingSchools: number;
  unverifiedSchools: number;
  rejectedSchools: number;
  averageSmartScore: number;
}

interface VerificationAuditLog {
  id: number;
  school_name: string;
  verifier_email: string;
  result: string;
  created_at: string;
}

const resultStyles: Record<string, string> = {
  verified: 'bg-[#3D7A5C]/20 text-[#3D7A5C] border-[#3D7A5C]/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const API_BASE = 'http://localhost:5000';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [districts, setDistricts] = useState<Record<string, number>>({});
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [overviewRes, districtsRes, auditRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/overview`, { headers }),
          fetch(`${API_BASE}/analytics/districts`, { headers }),
          fetch(`${API_BASE}/audit`, { headers }),
        ]);

        if (overviewRes.ok) {
          setOverview(await overviewRes.json());
        }

        if (districtsRes.ok) {
          const districtsData = await districtsRes.json();
          setDistricts(typeof districtsData === 'object' && districtsData !== null ? districtsData : {});
        }

        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditLogs(Array.isArray(auditData) ? auditData : []);
          setAuditError(null);
        } else {
          const errData = await auditRes.json().catch(() => ({}));
          setAuditError(typeof errData.error === 'string' ? errData.error : 'Failed to load audit activity');
        }
      } catch {
        toast.error('Failed to load dashboard data. Check that the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handlePdfDownload = useCallback(
    async (type: 'summary' | 'districts' | 'audit') => {
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      const configs = {
        summary: {
          url: `${API_BASE}/reports/summary/pdf`,
          filename: 'ssevms-system-summary.pdf',
        },
        districts: {
          url: `${API_BASE}/reports/districts/pdf`,
          filename: 'ssevms-districts-report.pdf',
        },
        audit: {
          url: `${API_BASE}/reports/audit/pdf`,
          filename: 'ssevms-verification-audit-report.pdf',
        },
      };

      const { url, filename } = configs[type];
      setDownloading(type);
      const toastId = toast.loading('Generating PDF report...');

      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 403) {
          toast.dismiss(toastId);
          toast.error('Access denied for this report.');
          return;
        }

        if (!res.ok) {
          throw new Error(`Report generation failed (Status: ${res.status})`);
        }

        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        toast.dismiss(toastId);
        toast.success('Report downloaded successfully.');
      } catch {
        toast.dismiss(toastId);
        toast.error('Failed to download report.');
      } finally {
        setDownloading(null);
      }
    },
    [token]
  );

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

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
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl bg-white/5 border border-white/5" />
          <Skeleton className="h-80 rounded-2xl bg-white/5 border border-white/5" />
        </div>
        <Skeleton className="h-64 rounded-2xl bg-white/5 border border-white/5" />
      </div>
    );
  }

  const activeOverview: AnalyticsOverview = overview ?? {
    totalSchools: 0,
    verifiedSchools: 0,
    pendingSchools: 0,
    unverifiedSchools: 0,
    rejectedSchools: 0,
    averageSmartScore: 0,
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 border-l-4 border-[#C4622D] pl-6 py-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#D4A847]" />
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#8A9BAD]/60">
              National Command Center
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white uppercase italic">
            Admin <span className="text-[#D4A847]">Dashboard</span>
          </h1>
          <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
            SSEVMS — {user?.name ?? 'Administrator'} • Live national intelligence
          </p>
        </div>
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
          description="Verification complete"
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          title="Unverified Schools"
          value={activeOverview.unverifiedSchools}
          description="Awaiting field validation"
          icon={<AlertCircle className="h-5 w-5" />}
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

      {/* Section 2 — Analytics Visualization */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-[#141C25]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 md:p-8 shadow-xl">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#C4622D] mb-6 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Verification Status Distribution
          </h3>
          <VerificationChart
            data={{
              verified: activeOverview.verifiedSchools,
              pending: activeOverview.pendingSchools,
              unverified: activeOverview.unverifiedSchools,
              rejected: activeOverview.rejectedSchools,
            }}
          />
        </div>

        <div className="bg-[#141C25]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 md:p-8 shadow-xl">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4A847] mb-6">
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
      </div>

      {/* Sections 3 & 4 — Audit Activity + Quick Actions */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Section 3 — Recent Audit Activity */}
        <div className="xl:col-span-8 bg-[#141C25]/85 rounded-xl border border-white/5 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <History className="h-5 w-5 text-[#C4622D]" />
                Recent Audit Activity
              </h3>
              <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">
                Latest verification events
              </p>
            </div>
            <Button variant="ghost" asChild className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847] hover:text-white">
              <Link to="/audit">View Full Trail →</Link>
            </Button>
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
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                      School Name
                    </TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                      Validator Name
                    </TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                      Result
                    </TableHead>
                    <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                      Timestamp
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAudit.map((log) => (
                    <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-[#EEE8DC]">
                        {log.school_name || 'Unknown School'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-[#8A9BAD]">
                        {log.verifier_email || 'N/A'}
                      </TableCell>
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
                        {formatDate(log.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Section 4 — Quick Actions */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-[#141C25]/85 rounded-xl border border-white/5 p-6 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#D4A847]" />
              Admin Actions
            </h3>
            <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest">
              PDF reports & governance shortcuts
            </p>

            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => handlePdfDownload('summary')}
                disabled={downloading !== null}
                className="w-full h-11 bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-[10px] uppercase tracking-widest gap-2"
              >
                {downloading === 'summary' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Summary PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePdfDownload('districts')}
                disabled={downloading !== null}
                className="w-full h-11 border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest gap-2"
              >
                {downloading === 'districts' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#D4A847]" />
                ) : (
                  <Download className="h-4 w-4 text-[#D4A847]" />
                )}
                Download District Report PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePdfDownload('audit')}
                disabled={downloading !== null}
                className="w-full h-11 border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest gap-2"
              >
                {downloading === 'audit' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#D4A847]" />
                ) : (
                  <Download className="h-4 w-4 text-[#D4A847]" />
                )}
                Download Audit Report PDF
              </Button>
            </div>
          </div>

          <div className="bg-[#141C25]/60 rounded-xl border border-white/5 p-6 space-y-2">
            <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mb-3">
              Navigation
            </p>
            <Button
              variant="outline"
              asChild
              className="w-full h-10 border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest gap-2 justify-start"
            >
              <Link to="/users">
                <Users className="h-4 w-4 text-[#D4A847]" />
                User Management
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full h-10 border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest gap-2 justify-start"
            >
              <Link to="/audit">
                <History className="h-4 w-4 text-[#C4622D]" />
                Audit Trail
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full h-10 border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest gap-2 justify-start"
            >
              <Link to="/settings">
                <Settings className="h-4 w-4 text-[#8A9BAD]" />
                System Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
