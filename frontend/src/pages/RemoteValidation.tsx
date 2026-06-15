import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Map as MapIcon,
  Satellite,
  Layers,
  Maximize2,
  AlertCircle,
  Eye,
  Building,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const validationQueue = [
  { id: 'VAL-001', name: 'Kabuga Secondary', district: 'Gasabo', type: 'Building', date: '2026-02-20' },
  { id: 'VAL-002', name: 'Nyanza Primary', district: 'Nyanza', type: 'Footprint', date: '2026-02-21' },
  { id: 'VAL-003', name: 'Rubavu TVET', district: 'Rubavu', type: 'Boundaries', date: '2026-02-22' },
];

export default function RemoteValidation() {
  const [selectedItem, setSelectedItem] = useState(validationQueue[0]);
  const [zoomLevel, setZoomLevel] = useState(18);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div className="rounded-xl border border-[#D4A847]/30 bg-[#D4A847]/10 p-4 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-[#D4A847] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#8A9BAD]">
            <span className="text-sm font-semibold text-[#EEE8DC] block mb-1">Deprecated — static demo data</span>
            Remote validation uses hardcoded sample records. Live verification is available on the Validator Dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Remote Desktop Validation</h1>
            <p className="text-muted-foreground">
              Verify school existence using aerial imagery and change detection.
            </p>
          </div>
          <div className="flex bg-muted/50 p-1 rounded-xl border">
            <Button variant="ghost" size="sm" className="rounded-lg px-4 h-9">Pending (12)</Button>
            <Button variant="ghost" size="sm" className="rounded-lg px-4 h-9">Completed (84)</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4 lg:h-[700px]">
          {/* Sidebar Queue */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-widest px-2">Verification Queue</h3>
            {validationQueue.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                  selectedItem.id === item.id ? "bg-primary/5 border-primary shadow-sm" : "bg-card border-border"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-sm truncate flex-1">{item.name}</p>
                  <Badge variant="outline" className="text-[10px] uppercase h-5">{item.type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Navigation className="h-3 w-3" /> {item.district}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{item.date}</span>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Inspect
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Validation Workspace */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="rounded-xl h-full border-primary/10 overflow-hidden flex flex-col shadow-lg">
              <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedItem.name}</CardTitle>
                  <CardDescription className="text-xs">ID: {selectedItem.id} • Geolocation Verification</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg h-9">
                    <AlertCircle className="mr-2 h-4 w-4" /> Issue Report
                  </Button>
                </div>
              </CardHeader>

              <div className="flex-1 grid grid-cols-2 group">
                {/* Layer 1: OSM Mapping */}
                <div className="relative border-r bg-slate-50 overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-white/90 text-slate-900 border-slate-200 backdrop-blur-sm shadow-sm gap-1.5 py-1 px-3">
                      <MapIcon className="h-3 w-3" /> System Map (OSM)
                    </Badge>
                  </div>

                  {/* Simulated OSM Layer */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64 border-2 border-primary/40 rounded-sm bg-primary/5 flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-full h-full border border-dashed border-primary/20" />
                      <Building className="h-12 w-12 text-primary/30" />
                      <p className="absolute bottom-[-24px] text-[10px] font-mono text-primary font-bold uppercase">Building Footprint: Area B</p>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 z-10 flex gap-1">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white/80 shadow-md">
                      <Layers className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                </div>

                {/* Layer 2: Satellite Image */}
                <div className="relative bg-slate-900 overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-slate-900/80 text-white border-slate-700 backdrop-blur-sm shadow-sm gap-1.5 py-1 px-3">
                      <Satellite className="h-3 w-3 text-blue-400" /> Maxar Satellite (High Res)
                    </Badge>
                  </div>

                  {/* Simulated High-Res Satellite Layer */}
                  <div className="absolute inset-0 opacity-60">
                    <img
                      src="https://images.unsplash.com/photo-1549420074-9b2f6ef532b2?q=80&w=2000&auto=format&fit=crop"
                      alt="Satellite Preview"
                      className="w-full h-full object-cover grayscale brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-success/40 rounded-sm overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      <img
                        src="https://images.unsplash.com/photo-1549420074-9b2f6ef532b2?q=80&w=2000&auto=format&fit=crop"
                        alt="Satellite Zoom"
                        className="w-full h-full object-cover scale-[2.5]"
                        style={{ transformOrigin: 'center' }}
                      />
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 z-10 flex gap-1 items-center">
                    <span className="text-[10px] text-white font-mono bg-black/40 px-2 py-1 rounded">Zoom: 19.5z</span>
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-slate-800 border-slate-700 text-white shadow-md">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/30 border-t flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    Building Identification
                  </h4>
                  <p className="text-xs text-muted-foreground">Compare the footprints. Does the image match the recorded geometry?</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl px-6 h-12 bg-white border-destructive/30 text-destructive hover:bg-destructive/5">
                    <XCircle className="mr-2 h-5 w-5" />
                    Discard Entry
                  </Button>
                  <Button className="rounded-xl px-10 h-12 shadow-lg shadow-primary/20">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Approve Validation
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
