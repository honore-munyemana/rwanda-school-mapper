/** @deprecated Legacy mapper alias dashboard — /public redirects to /mapper. Retained for reference only. */
import { DashboardShell } from '@/components/auth/DashboardShell';
import { useData } from '@/context/DataContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SchoolMap } from '@/components/map/SchoolMap';

import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function PublicDashboard() {
  const { schools } = useData();
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return schools;
    return schools.filter((s) => s.name.toLowerCase().includes(query) || s.district.toLowerCase().includes(query));
  }, [q, schools]);

  if (loading) {
    return (
      <DashboardShell title="Public Dashboard" subtitle="Accessing public school registry...">
        <div className="space-y-6 animate-pulse">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-[420px] rounded-xl" />
            <Skeleton className="h-[420px] rounded-xl" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  const selected = schools.find((s) => s.id === selectedId) ?? null;

  return (
    <DashboardShell
      title="Public Dashboard"
      subtitle="Browse mapped schools, search records, and view details (prototype)."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mapped schools</CardTitle>
            <CardDescription>Search and explore school locations across Rwanda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search schools by name or district..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border overflow-hidden">
                <SchoolMap
                  schools={filtered}
                  height="420px"
                  onSchoolSelect={(s) => setSelectedId(s.id)}
                />
              </div>

              <div className="rounded-xl border p-4 max-h-[420px] overflow-y-auto space-y-2">
                {filtered.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.district}, {s.sector} • {s.verificationStatus}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedId(s.id)}>
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selected} onOpenChange={() => setSelectedId(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected?.name}</DialogTitle>
              <DialogDescription>
                {selected?.district}, {selected?.province} • {selected?.verificationStatus}
              </DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Type:</span> {selected.schoolType}
                </p>
                <p>
                  <span className="text-muted-foreground">Level:</span> {selected.educationLevel}
                </p>
                <p className="font-mono text-xs">
                  {selected.coordinates.lat.toFixed(6)}, {selected.coordinates.lng.toFixed(6)}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
