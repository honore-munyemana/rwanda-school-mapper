import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { School } from '@/data/rwandaSchools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  X,
  Building2,
  Droplets,
  Zap,
  Image as ImageIcon,
  History
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useBackendSchools } from '@/hooks/useBackendSchools';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type VerificationStatus = 'All' | 'Verified' | 'Pending' | 'Unverified' | 'Rejected';

const statusStyles: Record<string, string> = {
  Verified: 'bg-[#3D7A5C]/10 text-[#3D7A5C] border-[#3D7A5C]/20 shadow-[0_0_10px_rgba(61,122,92,0.1)]',
  Pending: 'bg-[#D4A847]/10 text-[#D4A847] border-[#D4A847]/20 shadow-[0_0_10px_rgba(212,168,71,0.1)]',
  Unverified: 'bg-[#8A9BAD]/10 text-[#8A9BAD] border-[#8A9BAD]/20',
  Rejected: 'bg-red-900/10 text-red-500 border-red-900/20',
};

export default function SchoolsRegistry() {
  const { schools, loading } = useBackendSchools();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(() => {
    return location.state && typeof location.state === 'object' && 'searchQuery' in location.state
      ? (location.state as any).searchQuery
      : '';
  });
  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  useEffect(() => {
    if (schools.length > 0 && location.state && typeof location.state === 'object' && 'selectedSchoolId' in location.state) {
      const schId = String((location.state as any).selectedSchoolId);
      const found = schools.find((s) => String(s.id) === schId);
      if (found) {
        setSelectedSchool(found);
      }
    }
  }, [schools, location.state]);

  const filteredSchools = schools.filter((school) => {
    if (statusFilter !== 'All' && school.verificationStatus !== statusFilter) return false;
    if (districtFilter !== 'All' && school.district !== districtFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        school.name.toLowerCase().includes(query) ||
        school.id.toLowerCase().includes(query) ||
        school.district.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const allDistricts = useMemo(
    () => [...new Set(schools.map((s) => s.district).filter(Boolean))].sort(),
    [schools]
  );

  const clearFilters = () => {
    setStatusFilter('All');
    setDistrictFilter('All');
    setSearchQuery('');
  };

  const hasFilters = statusFilter !== 'All' || districtFilter !== 'All' || searchQuery;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Mission Control Registry Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-l-4 border-[#D4A847] pl-6 py-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#8A9BAD]/40" />
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-[#8A9BAD]/40">Database Engine: ACTIVE</span>
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-white uppercase italic">
              National <span className="text-[#D4A847]">Registry</span> Archive
            </h1>
            <p className="font-label text-[#8A9BAD] text-sm tracking-widest uppercase">
              Authenticated Master Record • Verified Infrastructure
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="h-11 border-white/5 bg-white/5 hover:bg-white/10 text-[#8A9BAD] font-label rounded-xl px-5 transition-all">
              <Download className="mr-3 h-4 w-4" />
              Export .CSV
            </Button>
            <Button className="h-11 bg-[#C4622D] hover:bg-[#A85225] text-white font-label rounded-xl px-6 shadow-lg shadow-[#C4622D]/10 group transition-all">
              <Plus className="mr-3 h-4 w-4 group-hover:rotate-90 transition-transform" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Multi-Parameter Radar Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-6 bg-[#141C25]/60 backdrop-blur-xl rounded-2xl border border-white/5">
          <div className="lg:col-span-5 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9BAD]/40 group-focus-within:text-[#D4A847] transition-colors" />
            <Input
              placeholder="Query ID, Designation, or Regional Vector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-black/20 border-white/5 text-sm font-mono focus-visible:ring-1 focus-visible:ring-[#D4A847]/40 placeholder:text-[#8A9BAD]/30"
            />
          </div>

          <div className="lg:col-span-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VerificationStatus)}>
              <SelectTrigger className="h-12 bg-black/20 border-white/5 font-label text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                <SelectValue placeholder="STATUS_TAG" />
              </SelectTrigger>
              <SelectContent className="bg-[#141C25] border-white/10 text-[#8A9BAD]">
                <SelectItem value="All" className="text-[10px] uppercase tracking-widest">Global Status</SelectItem>
                <SelectItem value="Verified" className="text-[10px] uppercase tracking-widest">Verified</SelectItem>
                <SelectItem value="Pending" className="text-[10px] uppercase tracking-widest">Pending</SelectItem>
                <SelectItem value="Unverified" className="text-[10px] uppercase tracking-widest">Unverified</SelectItem>
                <SelectItem value="Rejected" className="text-[10px] uppercase tracking-widest">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-3">
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="h-12 bg-black/20 border-white/5 font-label text-[10px] uppercase tracking-widest text-[#8A9BAD]">
                <SelectValue placeholder="REGION_VECTOR" />
              </SelectTrigger>
              <SelectContent className="bg-[#141C25] border-white/10 text-[#8A9BAD]">
                <SelectItem value="All" className="text-[10px] uppercase tracking-widest">All Districts</SelectItem>
                {allDistricts.map((district) => (
                  <SelectItem key={district} value={district} className="text-[10px] uppercase tracking-widest">
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-4">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[8px] font-black uppercase tracking-[0.2em] text-[#C4622D] hover:bg-red-500/5">
                <X className="h-3 w-3 mr-1" />
                Reset Radar
              </Button>
            )}
            <div className="text-[10px] font-mono font-bold text-[#8A9BAD]/40 uppercase tracking-widest">
              {loading ? '…' : `${filteredSchools.length} Match`}
            </div>
          </div>
        </div>

        {/* High-Precision Data Table */}
        <div className="bg-[#141C25]/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
          {/* Decorative Corner Decor */}
          <div className="absolute top-0 right-0 h-16 w-16 opacity-5 pointer-events-none">
            <div className="absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 border-[#D4A847]" />
          </div>

          <Table>
            <TableHeader className="bg-black/20 border-b border-white/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-label text-[10px] font-black uppercase text-[#D4A847]/90 tracking-widest h-14 pl-8 bg-[#0F1923]/60">Strategic Designation</TableHead>
                <TableHead className="font-label text-[10px] font-black uppercase text-[#D4A847]/90 tracking-widest h-14 bg-[#0F1923]/60">Data ID</TableHead>
                <TableHead className="font-label text-[10px] font-black uppercase text-[#D4A847]/90 tracking-widest h-14 bg-[#0F1923]/60">Vector Region</TableHead>
                <TableHead className="font-label text-[10px] font-black uppercase text-[#D4A847]/90 tracking-widest h-14 bg-[#0F1923]/60">Classification</TableHead>
                <TableHead className="font-label text-[10px] font-black uppercase text-[#D4A847]/90 tracking-widest h-14 bg-[#0F1923]/60">Tier</TableHead>
                <TableHead className="font-label text-[10px] font-black uppercase text-[#D4A847]/90 tracking-widest h-14 bg-[#0F1923]/60">Integrity</TableHead>
                <TableHead className="font-label text-[10px] font-black uppercase text-[#D4A847]/90 tracking-widest h-14 bg-[#0F1923]/60">Archive Log</TableHead>
                <TableHead className="w-[80px] h-14"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C4622D] mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredSchools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center font-mono text-xs text-[#8A9BAD] uppercase tracking-widest">
                    No schools match the current filters
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading && filteredSchools.map((school, index) => (
                <TableRow
                  key={school.id}
                  className={cn(
                    "group transition-all duration-300 border-b border-white/5 relative",
                    index % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent",
                    "hover:bg-[#C4622D]/5"
                  )}
                >
                  {/* Terracotta hover marker */}
                  <div className="absolute left-0 top-0 bottom-0 w-0 bg-[#C4622D] group-hover:w-1 transition-all" />

                  <TableCell className="pl-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/10 border border-white/5 group-hover:border-[#C4622D]/30 transition-colors">
                        <MapPin className="h-4 w-4 text-[#C4622D] opacity-40 group-hover:opacity-100 transition-all" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-display text-white font-bold group-hover:text-[#D4A847] transition-colors">{school.name}</p>
                        <p className="font-mono text-[9px] text-[#8A9BAD]/60 uppercase tracking-widest">{school.sector}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-[#D4A847]/60 group-hover:text-[#D4A847] transition-colors">{school.id}</TableCell>
                  <TableCell className="font-label text-xs uppercase tracking-wider text-[#8A9BAD]">{school.district}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-widest border-white/5 text-[#8A9BAD] bg-white/5 rounded-sm">
                      {school.schoolType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-label text-xs italic text-[#8A9BAD]/80">{school.educationLevel}</TableCell>
                  <TableCell>
                    <span className={cn(
                      'px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-[0.15em] border transition-all',
                      statusStyles[school.verificationStatus]
                    )}>
                      {school.verificationStatus}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-[#8A9BAD]/40 group-hover:text-[#8A9BAD] transition-colors">
                    {school.lastUpdated}
                  </TableCell>
                  <TableCell className="pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                          <MoreHorizontal className="h-5 w-5 text-[#8A9BAD]/50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#141C25] border-white/10 text-[#EEE8DC] w-48 shadow-2xl">
                        <DropdownMenuItem className="focus:bg-[#C4622D]/10 cursor-pointer p-3 rounded-lg" onClick={() => setSelectedSchool(school)}>
                          <Eye className="mr-3 h-4 w-4 text-[#D4A847]" />
                          <span className="text-xs font-label uppercase tracking-widest">Master Intel</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-[#C4622D]/10 cursor-pointer p-3 rounded-lg">
                          <Pencil className="mr-3 h-4 w-4 text-[#8A9BAD]" />
                          <span className="text-xs font-label uppercase tracking-widest">Modify Record</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-[#C4622D]/10 cursor-pointer p-3 rounded-lg">
                          <MapPin className="mr-3 h-4 w-4 text-[#C4622D]" />
                          <span className="text-xs font-label uppercase tracking-widest">GIS Vector</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:bg-red-400/10 cursor-pointer p-3 rounded-lg">
                          <Trash2 className="mr-3 h-4 w-4" />
                          <span className="text-xs font-label uppercase tracking-widest">Purge Archive</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* High-Precision School Detail Intelligence */}
        <Dialog open={!!selectedSchool} onOpenChange={() => setSelectedSchool(null)}>
          <DialogContent className="max-w-4xl bg-[#0F1923] border border-white/10 text-[#EEE8DC] shadow-2xl p-0 overflow-hidden rounded-2xl">
            {selectedSchool && (
              <div className="flex flex-col h-[85vh]">
                {/* Header Strip */}
                <div className="relative h-48 w-full bg-[#141C25] overflow-hidden border-b border-white/5">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("/rwanda-terrain.png")', bgSize: 'cover' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1923] to-transparent" />

                  <div className="absolute bottom-6 left-8 flex items-end gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-[#C4622D] shadow-xl flex items-center justify-center border-4 border-black/40">
                      <Building2 className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-[#D4A847] uppercase tracking-[0.4em] font-black">{selectedSchool.id}</span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest">{selectedSchool.district}, {selectedSchool.province}</span>
                      </div>
                      <DialogTitle className="text-4xl font-display font-bold text-white tracking-tight leading-none uppercase italic">
                        {selectedSchool.name}
                      </DialogTitle>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSchool(null)}
                    className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-white hover:bg-[#C4622D] transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-6">
                  <Tabs defaultValue="general" className="w-full">
                    <TabsList className="bg-black/20 border border-white/5 p-1 rounded-xl w-fit mb-8 h-12">
                      <TabsTrigger value="general" className="font-label text-xs uppercase tracking-widest px-6 data-[state=active]:bg-[#C4622D] data-[state=active]:text-white rounded-lg">Tactical Specs</TabsTrigger>
                      <TabsTrigger value="infrastructure" className="font-label text-xs uppercase tracking-widest px-6 data-[state=active]:bg-[#C4622D] data-[state=active]:text-white rounded-lg">Assets</TabsTrigger>
                      <TabsTrigger value="gallery" className="font-label text-xs uppercase tracking-widest px-6 data-[state=active]:bg-[#C4622D] data-[state=active]:text-white rounded-lg">Visual Intel</TabsTrigger>
                      <TabsTrigger value="history" className="font-label text-xs uppercase tracking-widest px-6 data-[state=active]:bg-[#C4622D] data-[state=active]:text-white rounded-lg">Log History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-8 outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-2">
                          <p className="font-mono text-[9px] text-[#8A9BAD] uppercase tracking-widest font-black">Authentication Status</p>
                          <span className={cn(
                            'inline-block px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest border',
                            statusStyles[selectedSchool.verificationStatus]
                          )}>
                            {selectedSchool.verificationStatus}
                          </span>
                        </div>
                        <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-2">
                          <p className="font-mono text-[9px] text-[#8A9BAD] uppercase tracking-widest font-black">Institutional Tier</p>
                          <p className="font-display text-xl font-bold text-white uppercase italic tracking-tighter">{selectedSchool.schoolType}</p>
                        </div>
                        <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-2">
                          <p className="font-mono text-[9px] text-[#8A9BAD] uppercase tracking-widest font-black">Academic Scope</p>
                          <p className="font-display text-xl font-bold text-white uppercase italic tracking-tighter">{selectedSchool.educationLevel}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-6 border-y border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-[#8A9BAD]/40 uppercase tracking-[0.3em]">Lat Vector</p>
                          <p className="text-lg font-mono font-bold text-[#D4A847] tabular-nums">{selectedSchool.coordinates.lat.toFixed(6)}°S</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-[#8A9BAD]/40 uppercase tracking-[0.3em]">Lng Vector</p>
                          <p className="text-lg font-mono font-bold text-[#D4A847] tabular-nums">{selectedSchool.coordinates.lng.toFixed(6)}°E</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-[#8A9BAD]/40 uppercase tracking-[0.3em]">Personnel Cap</p>
                          <p className="text-lg font-mono font-bold text-white tabular-nums">{selectedSchool.studentCount || '---'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-[#8A9BAD]/40 uppercase tracking-[0.3em]">Faculty Log</p>
                          <p className="text-lg font-mono font-bold text-white tabular-nums">{selectedSchool.teacherCount || '---'}</p>
                        </div>
                      </div>

                      {selectedSchool.rejectionReason && (
                        <div className="p-6 rounded-2xl bg-red-900/10 border border-red-500/20 relative">
                          <div className="absolute top-0 right-8 transform translate-y-[-50%] bg-[#0F1923] px-3 font-mono text-[10px] text-red-500 font-bold tracking-widest uppercase">System Remark</div>
                          <p className="text-sm font-label text-[#EEE8DC]/80 leading-relaxed italic">{selectedSchool.rejectionReason}</p>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <Button className="flex-1 h-14 bg-[#C4622D] hover:bg-[#A85225] text-white font-label font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01]">
                          <MapPin className="mr-3 h-5 w-5" />
                          Coordinate Sync
                        </Button>
                        <Button variant="outline" className="flex-1 h-14 border-white/10 hover:bg-white/5 font-label font-bold uppercase tracking-widest rounded-xl text-[#8A9BAD]">
                          <Pencil className="mr-3 h-5 w-5" />
                          Modify Metadata
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="infrastructure" className="pt-4 outline-none">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-white/5 bg-black/20 space-y-5 group hover:border-[#C4622D]/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-5 w-5 text-[#C4622D]" />
                              <span className="font-display font-bold text-white tracking-wide uppercase italic">Building Integrity</span>
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#3D7A5C]" />
                          </div>
                          <div className="space-y-3 font-mono text-[11px] text-[#8A9BAD]">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="uppercase">Classroom Units</span>
                              <span className="text-white font-bold">12 [STATUS: NOMINAL]</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="uppercase">Staff HQ</span>
                              <span className="text-white font-bold">02 [STATUS: DEGRADED]</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="uppercase">Knowledge Lab</span>
                              <span className="text-[#3D7A5C] font-black tracking-widest">ENABLED</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-white/5 bg-black/20 space-y-5 group hover:border-[#D4A847]/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Droplets className="h-5 w-5 text-[#D4A847]" />
                              <span className="font-display font-bold text-white tracking-wide uppercase italic">WASH Logistics</span>
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#3D7A5C]" />
                          </div>
                          <div className="space-y-3 font-mono text-[11px] text-[#8A9BAD]">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="uppercase">Toxicity Scan</span>
                              <span className="text-[#3D7A5C] font-black tracking-widest">CLEAN</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="uppercase">Sanitation Nodes</span>
                              <span className="text-white font-bold">24 [PITS]</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="uppercase">Supply Vector</span>
                              <span className="text-white font-bold">PIPED + RESERVOIR</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-white/5 bg-black/20 space-y-5 group hover:border-[#C4622D]/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Zap className="h-5 w-5 text-[#C4622D]" />
                              <span className="font-display font-bold text-white tracking-wide uppercase italic">Energy Grid</span>
                            </div>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#3D7A5C] animate-pulse" />
                          </div>
                          <div className="space-y-3 font-mono text-[11px] text-[#8A9BAD]">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="uppercase">Primary Source</span>
                              <span className="text-white font-bold">REG_GRID_SYNC</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="uppercase">Data Link</span>
                              <span className="text-white font-bold">FIBER [UP 99.9%]</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="gallery" className="pt-4 outline-none">
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="group relative aspect-video bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden hover:border-[#C4622D]/40 transition-all">
                            <div className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-80 scale-110 group-hover:scale-100" />
                            <ImageIcon className="h-8 w-8 text-white/20 group-hover:text-white/80 transition-all relative z-10" />
                            <div className="absolute bottom-4 left-4 font-mono text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-1 rounded">IMAGE_BUFFER_0{i}_ENCRYPTED</div>
                          </div>
                        ))}
                        <div className="aspect-video bg-[#C4622D]/5 rounded-2xl border border-dashed border-[#C4622D]/30 flex items-center justify-center flex-col gap-3 hover:bg-[#C4622D]/10 cursor-pointer transition-all">
                          <div className="h-10 w-10 rounded-full bg-[#C4622D] flex items-center justify-center text-white shadow-lg">
                            <Plus className="h-6 w-6" />
                          </div>
                          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#C4622D] font-black">Upload Visual Proof</span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="pt-4 space-y-6 outline-none">
                      <div className="relative space-y-8 pl-10 border-l border-white/5 ml-4">
                        <div className="relative">
                          <div className="absolute -left-[51px] top-1 h-5 w-5 rounded-full bg-[#3D7A5C] shadow-[0_0_10px_rgba(61,122,92,0.8)] border-4 border-[#0F1923]" />
                          <p className="font-display text-base font-bold text-white tracking-wide">STATUS_INTEGRITY: VERIFIED</p>
                          <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">Personnel: Head Commissioner • Feb 15, 2026</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[51px] top-1 h-5 w-5 rounded-full bg-[#D4A847] shadow-[0_0_10px_rgba(212,168,71,0.8)] border-4 border-[#0F1923]" />
                          <p className="font-display text-base font-bold text-white tracking-wide">STATUS_BUFFER: PENDING</p>
                          <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">Personnel: Verifier_Alpha_02 • Feb 10, 2026</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[51px] top-1 h-5 w-5 rounded-full bg-white/20 border-4 border-[#0F1923]" />
                          <p className="font-display text-base font-bold text-white tracking-wide">SYSTEM_CREATE: ARCHIVE_INIT</p>
                          <p className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest mt-1">Personnel: SYSTEM_AUTO • Jan 01, 2026</p>
                        </div>
                      </div>
                      <div className="pt-8">
                        <Button variant="ghost" className="w-full h-12 border border-white/5 hover:bg-white/5 font-mono text-[9px] uppercase tracking-[0.4em] text-[#8A9BAD]">
                          Launch Complete Audit Archive →
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
