import { useEffect, useState } from 'react';
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
import { History, Loader2 } from 'lucide-react';
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
  const [logs, setLogs] = useState<VerificationAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
                No verification events recorded yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                    School
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                    Verifier
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                    Result
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                    Distance
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
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
