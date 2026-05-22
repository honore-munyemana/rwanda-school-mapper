import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import {
  Battery,
  HardDrive,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  CloudUpload,
  Clock,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DraftSubmission {
  id: string;
  schoolName: string;
  coordinates: string;
  notes: string;
  offline: boolean;
  hasPhoto: boolean;
  timestamp: string;
}

export default function MobileDataCollection() {
  const [offlineMode, setOfflineMode] = useState(true);
  const [drafts, setDrafts] = useState<DraftSubmission[]>([]);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(82);
  const [storageUsed, setStorageUsed] = useState(45);
  const [form, setForm] = useState({
    schoolName: '',
    coordinates: '',
    notes: '',
  });

  const addDraft = () => {
    if (!form.schoolName.trim()) {
      toast.error('School name is required');
      return;
    }
    const newDraft: DraftSubmission = {
      id: `draft_${Date.now()}`,
      ...form,
      offline: offlineMode,
      hasPhoto: hasPhoto,
      timestamp: new Date().toLocaleTimeString(),
    };
    setDrafts((prev) => [newDraft, ...prev]);
    setForm({ schoolName: '', coordinates: '', notes: '' });
    setHasPhoto(false);
    toast.success('Submission saved to offline queue');
  };

  const simulateGPS = () => {
    setForm(prev => ({ ...prev, coordinates: '-1.9441, 30.0619' }));
    toast.info('GPS coordinates captured');
  };

  const simulatePhoto = () => {
    setHasPhoto(true);
    toast.info('Geotagged photo captured');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-primary" />
              Mobile Data Collection
            </h1>
            <p className="text-muted-foreground">
              Field mapping interface with offline capability and GPS capture.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-xl border shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Battery className={cn("h-3.5 w-3.5", batteryLevel < 20 ? "text-destructive" : "text-success")} />
                <span>{batteryLevel}%</span>
              </div>
              <Progress value={batteryLevel} className="h-1 w-12" />
            </div>
            <div className="h-8 w-px bg-border mx-2" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <HardDrive className="h-3.5 w-3.5 text-primary" />
                <span>{storageUsed}%</span>
              </div>
              <Progress value={storageUsed} className="h-1 w-12" />
            </div>
            <div className="h-8 w-px bg-border mx-2" />
            {offlineMode ? (
              <Badge variant="outline" className="text-[10px] uppercase gap-1 text-warning border-warning/20 bg-warning/5">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] uppercase gap-1 text-success border-success/20 bg-success/5">
                <Wifi className="h-3 w-3" /> Online
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          <Card className="md:col-span-3 shadow-md border-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">School Assessment Form</CardTitle>
              <CardDescription>Capture data even without cellular connection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border-2 border-dashed p-4 bg-muted/30">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Offline Sync Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Store data locally until internet is restored.
                  </p>
                </div>
                <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  placeholder="Enter official school name"
                  value={form.schoolName}
                  onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Geolocation</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Lat, Lng"
                      value={form.coordinates}
                      readOnly
                      className="rounded-xl bg-muted/50 font-mono text-xs"
                    />
                    <Button variant="secondary" size="icon" onClick={simulateGPS} title="Capture GPS">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Photo Evidence</Label>
                  <Button
                    variant={hasPhoto ? "success" : "outline"}
                    className="w-full rounded-xl gap-2"
                    onClick={simulatePhoto}
                  >
                    <Camera className="h-4 w-4" />
                    {hasPhoto ? "Photo Captured" : "Take Photo"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Field Observations</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe building condition, accessibility, etc."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="rounded-xl min-h-[100px]"
                />
              </div>

              <Button className="w-full rounded-xl py-6 text-lg font-bold shadow-lg" onClick={addDraft}>
                Save to Offline Queue
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Offline Queue</CardTitle>
                  <CardDescription>Waiting for sync</CardDescription>
                </div>
                {drafts.length > 0 && <Badge className="bg-primary">{drafts.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-40">
                  <CloudUpload className="h-10 w-10" />
                  <p className="text-sm">Queue is empty</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {drafts.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-xl border p-3 text-sm space-y-2 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold truncate max-w-[150px]">{d.schoolName}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
                          <Clock className="h-3 w-3" /> {d.timestamp}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {d.coordinates && <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] font-mono tracking-tighter"><MapPin className="h-2.5 w-2.5 mr-1" /> GPS</Badge>}
                        {d.hasPhoto && <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px]"><Camera className="h-2.5 w-2.5 mr-1" /> Photo</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drafts.length > 0 && (
                <Button variant="outline" className="w-full rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5">
                  <CloudUpload className="h-4 w-4" />
                  Sync All Records
                </Button>
              )}

              <div className="pt-4 border-top">
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Recent History
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Lycée de Kigali - Synced successfully 2h ago
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Green Hills Academy - Synced successfully 5h ago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
