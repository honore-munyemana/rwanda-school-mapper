import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function DataIntegration() {
  const [osmEnabled, setOsmEnabled] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Integration</h1>
          <p className="text-muted-foreground">
            Prototype panels for OpenStreetMap, Ministry of Education datasets, and external APIs.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>OpenStreetMap</CardTitle>
              <CardDescription>Configure OSM-based synchronization (simulated).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable OSM sync</p>
                  <p className="text-xs text-muted-foreground">
                    When enabled, SSEVMS can pull and push school data to OSM.
                  </p>
                </div>
                <Switch checked={osmEnabled} onCheckedChange={setOsmEnabled} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="osm-username">OSM account (simulated)</Label>
                <Input id="osm-username" placeholder="osm_username" />
              </div>
              <Button
                size="sm"
                disabled={!osmEnabled}
                onClick={() => setLastSync(new Date().toISOString())}
              >
                Sync from OSM (mock)
              </Button>
              {lastSync && (
                <p className="text-xs text-muted-foreground">
                  Last simulated sync: {new Date(lastSync).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Ministry of Education</CardTitle>
              <CardDescription>Import official school lists from MINEDUC files.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="moe-file">Upload CSV/Excel</Label>
                <Input id="moe-file" type="file" />
              </div>
              <Textarea
                readOnly
                className="min-h-[80px] text-xs"
                value="Prototype: uploaded records would appear here for review before import."
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>External APIs</CardTitle>
              <CardDescription>Configure integration endpoints (placeholder only).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="api-url">Inbound API URL</Label>
                <Input id="api-url" placeholder="https://api.example.org/schools" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API key</Label>
                <Input id="api-key" type="password" />
              </div>
              <Button size="sm" variant="outline">
                Test connection (simulated)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

