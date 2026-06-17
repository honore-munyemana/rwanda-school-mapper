import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface VerificationAuditLog {
  id: number;
  school_name: string;
  verifier_email: string;
  result: string;
  distance_meters: number | string;
  created_at: string;
}

const resultStyles: Record<string, string> = {
  verified: 'bg-[#3D7A5C]/20 text-[#3D7A5C] border-[#3D7A5C]/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function AuditTrail() {
  const { token } = useAuth();
  const location = useLocation();
  const [logs, setLogs] = useState<VerificationAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    return location.state && typeof location.state === 'object' && 'searchTerm' in location.state
      ? (location.state as any).searchTerm
      : '';
  });

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!token) {
        setLoading(false);
        setError('You must be logged in to view audit logs.');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/audit', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load audit logs');
        }

        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [token]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (log.school_name || '').toLowerCase().includes(term) ||
        (log.verifier_email || '').toLowerCase().includes(term) ||
        (log.result || '').toLowerCase().includes(term)
      );
    });
  }, [logs, searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-2xl font-display font-bold uppercase tracking-wider text-white italic flex items-center gap-2">
            <History className="h-6 w-6 text-[#C4622D]" />
            Verification <span className="text-[#D4A847]">Audit Trail</span>
          </h1>
          <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest mt-1">
            School verification history — verifier, distance, and result
          </p>
        </div>

        <div className="flex items-center max-w-sm relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9BAD]/40 group-focus-within:text-[#C4622D]" />
          <Input
            type="text"
            placeholder="Filter audit trail by school, verifier, result..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-[#141C25]/80 border-white/5 focus-visible:ring-1 focus-visible:ring-[#C4622D]/50 rounded-lg text-xs text-white"
          />
        </div>

        <div className="bg-[#141C25]/85 rounded-xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#8A9BAD]">
              <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
              <p className="font-mono text-xs uppercase tracking-widest">Loading audit logs...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="font-mono text-sm text-red-400">{error}</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
                No matching verification events recorded
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                    School
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                    Verifier
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                    Result
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                    Distance
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
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
                    <TableCell className="font-mono text-xs text-[#D4A847]">
                      {Number(log.distance_meters).toFixed(1)} m
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#8A9BAD]">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
