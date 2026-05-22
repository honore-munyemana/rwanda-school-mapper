import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useData } from '@/context/DataContext';

export default function Reports() {
  const { stats } = useData();
  const [regionLevel, setRegionLevel] = useState<'national' | 'province' | 'district'>('national');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'geojson'>('pdf');

  const handleExport = () => {
    // Prototype: no real file export, only conceptual.
    // In a real system this would call a backend endpoint with filters and format.
    // eslint-disable-next-line no-console
    console.log('Exporting report', { regionLevel, format, stats });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Prototype report builder using current analytics data (export actions simulated).
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Report scope</CardTitle>
              <CardDescription>Select the geographic aggregation level.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Region level</Label>
                <Select value={regionLevel} onValueChange={(value) => setRegionLevel(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National summary</SelectItem>
                    <SelectItem value="province">By province</SelectItem>
                    <SelectItem value="district">By district</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Output format</CardTitle>
              <CardDescription>Choose the desired export format.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={(value) => setFormat(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF (summary)</SelectItem>
                    <SelectItem value="excel">Excel (tabular)</SelectItem>
                    <SelectItem value="geojson">GeoJSON (spatial)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                In this academic prototype the export is simulated; use screenshots or dev console
                to illustrate the payload.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key metrics</CardTitle>
              <CardDescription>Snapshot of what will be included in the report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Total schools:{' '}
                <span className="font-semibold">
                  {stats.total}
                </span>
              </p>
              <p>
                Verified:{' '}
                <span className="font-semibold">
                  {stats.verified} ({stats.verificationRate}%)
                </span>
              </p>
              <p>
                Pending:{' '}
                <span className="font-semibold">
                  {stats.pending}
                </span>
              </p>
              <p>
                Public / Private:{' '}
                <span className="font-semibold">
                  {stats.publicSchools} / {stats.privateSchools}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleExport}>Generate report (simulated)</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

