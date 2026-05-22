import { DashboardShell } from '@/components/auth/DashboardShell';
import { useData } from '@/context/DataContext';
import { SimpleAnalytics } from '@/components/dashboard/SimpleAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getCurrentUser } from '@/routes/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

export default function VerifierDashboard() {
  const { schools, updateSchool, addVerificationHistory } = useData();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardShell title="Verifier Dashboard" subtitle="Fetching assigned school records...">
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const assigned = schools.filter((s) => s.verificationStatus === 'Pending' || s.verificationStatus === 'Unverified');

  const updateStatus = (schoolId: string, newStatus: 'Verified' | 'Rejected' | 'Pending' | 'Unverified') => {
    const school = schools.find((s) => s.id === schoolId);
    if (!school) return;
    updateSchool(schoolId, { verificationStatus: newStatus, lastUpdated: new Date().toISOString().slice(0, 10) });
    addVerificationHistory({
      schoolId,
      action: 'StatusChanged',
      previousStatus: school.verificationStatus,
      newStatus,
      performedBy: user?.fullName || 'Verifier',
      timestamp: new Date().toISOString(),
      notes: 'Updated by verifier (prototype).',
    });
    toast.success('Status updated');
  };

  return (
    <DashboardShell
      title="Verifier Dashboard"
      subtitle="View assigned schools, update verification status, and upload proof (mock)."
    >
      <div className="space-y-6">
        <SimpleAnalytics />
        <Card>
          <CardHeader>
            <CardTitle>Assigned schools</CardTitle>
            <CardDescription>Prototype assignment = Pending or Unverified schools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assigned.length === 0 ? (
              <p className="text-sm text-muted-foreground">No schools assigned.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {assigned.map((s) => (
                  <div key={s.id} className="rounded-xl border p-4 space-y-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.district}, {s.sector} • {s.educationLevel}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Verification status</p>
                      <Select
                        value={s.verificationStatus}
                        onValueChange={(v) =>
                          updateStatus(s.id, v as 'Verified' | 'Rejected' | 'Pending' | 'Unverified')
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Unverified">Unverified</SelectItem>
                          <SelectItem value="Verified">Verified</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Upload proof (mock)</p>
                      <Input type="file" />
                      <Button size="sm" variant="outline">
                        Submit proof (simulated)
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

