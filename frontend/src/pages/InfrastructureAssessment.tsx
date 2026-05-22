import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function InfrastructureAssessment() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Infrastructure Assessment</h1>
          <p className="text-muted-foreground">
            Prototype survey for WASH, connectivity, safety, and accessibility attributes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Infrastructure checklist (per school)</CardTitle>
            <CardDescription>
              In a full implementation this would be bound to individual school records.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label className="text-sm font-medium">Safe building condition</Label>
                <p className="text-xs text-muted-foreground">
                  Walls, roof, and structures are in good condition.
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label className="text-sm font-medium">Water supply (WASH)</Label>
                <p className="text-xs text-muted-foreground">
                  Functional and reliable source of drinking water.
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label className="text-sm font-medium">Sanitation facilities</Label>
                <p className="text-xs text-muted-foreground">
                  Adequate latrines with handwashing facilities.
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label className="text-sm font-medium">Electricity</Label>
                <p className="text-xs text-muted-foreground">Grid, solar, or other stable power.</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label className="text-sm font-medium">Internet / connectivity</Label>
                <p className="text-xs text-muted-foreground">Internet accessible on school premises.</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div>
                <Label className="text-sm font-medium">Accessible for learners with disabilities</Label>
                <p className="text-xs text-muted-foreground">
                  Ramps, accessible paths, and inclusive facilities available.
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

