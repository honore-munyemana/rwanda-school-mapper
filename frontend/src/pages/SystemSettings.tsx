import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SystemSettings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">
            High-level prototype controls for maintenance mode and deployment configuration.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance & Deployment</CardTitle>
            <CardDescription>Scoping options for national rollout (simulated).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label className="text-sm font-medium">Maintenance mode</Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, end-users would see a read-only banner.
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label className="text-sm font-medium">National deployment</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle to indicate rollout beyond pilot districts.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

