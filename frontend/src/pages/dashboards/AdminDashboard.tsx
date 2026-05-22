import { DashboardShell } from '@/components/auth/DashboardShell';
import { useData } from '@/context/DataContext';
import { SimpleAnalytics } from '@/components/dashboard/SimpleAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getCurrentUser } from '@/routes/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const { schools, stats, updateSchool, addVerificationHistory } = useData();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardShell title="Admin Dashboard" subtitle="Loading secure administrative data...">
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl w-full" />
        </div>
      </DashboardShell>
    );
  }

  const approve = (id: string) => {
    const school = schools.find((s) => s.id === id);
    if (!school) return;
    updateSchool(id, { verificationStatus: 'Verified', lastUpdated: new Date().toISOString().slice(0, 10) });
    addVerificationHistory({
      schoolId: id,
      action: 'Verified',
      previousStatus: school.verificationStatus,
      newStatus: 'Verified',
      performedBy: user?.fullName || 'Admin',
      timestamp: new Date().toISOString(),
      notes: 'Approved by admin (prototype).',
    });
    toast.success('School approved');
  };

  const reject = (id: string) => {
    const school = schools.find((s) => s.id === id);
    if (!school) return;
    updateSchool(id, { verificationStatus: 'Rejected', lastUpdated: new Date().toISOString().slice(0, 10) });
    addVerificationHistory({
      schoolId: id,
      action: 'Rejected',
      previousStatus: school.verificationStatus,
      newStatus: 'Rejected',
      performedBy: user?.fullName || 'Admin',
      timestamp: new Date().toISOString(),
      notes: 'Rejected by admin (prototype).',
    });
    toast.error('School rejected');
  };

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="View all schools, approve/reject records, and review summary statistics (prototype)."
    >
      <div className="space-y-6">
        <SimpleAnalytics />
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total schools</CardTitle>
              <CardDescription>Registered in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verified</CardTitle>
              <CardDescription>Verification rate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.verified}</p>
              <p className="text-xs text-muted-foreground">{stats.verificationRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
              <CardDescription>Awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All schools</CardTitle>
            <CardDescription>Approve or reject submissions (mock actions).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.district}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.verificationStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => approve(s.id)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => reject(s.id)}>
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

