import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { VerificationChart } from '@/components/dashboard/VerificationChart';
import { DistrictChart } from '@/components/dashboard/DistrictChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  School,
  TrendingUp,
  MapPin,
  Users,
  GraduationCap,
  FileDown,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

export default function Analytics() {
  const { stats } = useData();
  const { token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [districts, setDistricts] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (!token) return;

        const [overviewRes, districtsRes] = await Promise.all([
          fetch("http://localhost:5000/analytics/overview", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/analytics/districts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (overviewRes.ok && districtsRes.ok) {
          const overviewData = await overviewRes.json();
          const districtsData = await districtsRes.json();
          setOverview(overviewData);
          setDistricts(districtsData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics from backend:", error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const activeOverview = overview || {
    totalSchools: stats.total,
    verifiedSchools: stats.verified,
    pendingSchools: stats.pending,
    unverifiedSchools: stats.unverified,
    rejectedSchools: stats.rejected,
    averageSmartScore: 0,
    schoolsWithInternet: 0,
    schoolsWithElectricity: 0,
    schoolsWithPlayground: 0,
    schoolsWithSmartClassroom: 0,
    internetPercentage: 0,
    electricityPercentage: 0,
    playgroundPercentage: 0,
    smartClassroomPercentage: 0,
    distribution: {
      score0: 0,
      score1: 0,
      score2: 0,
      score3: 0,
      score4: 0,
    }
  };

  const activeDistricts = districts || stats.byDistrict;

  const educationLevelData = Object.entries(stats.byEducationLevel).map(([name, value]) => ({
    name,
    value,
  }));

  const provinceData = Object.entries(stats.byProvince).map(([name, value]) => ({
    name: name.replace(' Province', '').replace(' City', ''),
    value,
  }));

  const monthlyData = [
    { month: 'Jul', verified: 8, pending: 5 },
    { month: 'Aug', verified: 12, pending: 4 },
    { month: 'Sep', verified: 10, pending: 6 },
    { month: 'Oct', verified: 15, pending: 8 },
    { month: 'Nov', verified: 18, pending: 5 },
    { month: 'Dec', verified: activeOverview.verifiedSchools, pending: activeOverview.pendingSchools },
  ];

  const scoreDistributionData = [
    { score: 'Score 0', count: activeOverview.distribution.score0 },
    { score: 'Score 1', count: activeOverview.distribution.score1 },
    { score: 'Score 2', count: activeOverview.distribution.score2 },
    { score: 'Score 3', count: activeOverview.distribution.score3 },
    { score: 'Score 4', count: activeOverview.distribution.score4 },
  ];

  const verificationRate = activeOverview.totalSchools > 0
    ? Number(((activeOverview.verifiedSchools / activeOverview.totalSchools) * 100).toFixed(1))
    : stats.verificationRate;

  const colors = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 45%)'];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Compiling national school data...',
      success: () => {
        setIsGenerating(false);
        return 'National Status Report generated (PDF Simulation)';
      },
      error: 'Error generating report',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        {/* Header with Report Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-l-4 border-[#C4622D] pl-6 py-2">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold tracking-tight text-white uppercase italic">Smart School Analytics</h1>
            <p className="font-mono text-sm text-[#8A9BAD] uppercase tracking-[0.2em]">
              Infrastructure indicators and educational intelligence dashboard.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5 font-label font-bold uppercase tracking-widest rounded-xl text-[#8A9BAD]">
              <FileText className="mr-3 h-4 w-4" />
              Templates
            </Button>
            <Button className="h-12 bg-[#C4622D] hover:bg-[#A85225] text-white font-label font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02]" onClick={handleGenerateReport} disabled={isGenerating}>
              <FileDown className="mr-3 h-4 w-4" />
              {isGenerating ? "Compiling..." : "Export National Archive"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="visuals" className="space-y-8">
          <TabsList className="bg-black/20 border border-white/5 p-1 rounded-xl w-fit h-12">
            <TabsTrigger value="visuals" className="font-label text-xs uppercase tracking-widest px-8 data-[state=active]:bg-[#C4622D] data-[state=active]:text-white rounded-lg transition-all">Overview</TabsTrigger>
            <TabsTrigger value="builder" className="font-label text-xs uppercase tracking-widest px-8 data-[state=active]:bg-[#C4622D] data-[state=active]:text-white rounded-lg transition-all">Report Builder</TabsTrigger>
            <TabsTrigger value="quality" className="font-label text-xs uppercase tracking-widest px-8 data-[state=active]:bg-[#C4622D] data-[state=active]:text-white rounded-lg transition-all">QA Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="visuals" className="space-y-6 pt-2">
            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Schools"
                value={activeOverview.totalSchools}
                description="Registered in system"
                icon={<School className="h-5 w-5" />}
                variant="primary"
              />
              <StatsCard
                title="Verification Rate"
                value={`${verificationRate}%`}
                description="Schools verified"
                icon={<TrendingUp className="h-5 w-5" />}
                variant="success"
                trend={{ value: 8.5, isPositive: true }}
              />
              <StatsCard
                title="Districts Covered"
                value={Object.keys(activeDistricts).length}
                description="Active districts"
                icon={<MapPin className="h-5 w-5" />}
                variant="default"
              />
              <StatsCard
                title="Average Smart Score"
                value={`${activeOverview.averageSmartScore} / 4.0`}
                description="Infrastructure index"
                icon={<GraduationCap className="h-5 w-5" />}
                variant="default"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <VerificationChart
                data={{
                  verified: activeOverview.verifiedSchools,
                  pending: activeOverview.pendingSchools,
                  unverified: activeOverview.unverifiedSchools,
                  rejected: activeOverview.rejectedSchools,
                }}
              />

              <div className="bg-[#141C25]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#D4A847]/40" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4A847] mb-6 flex items-center justify-between">
                  <span>Verification Trend</span>
                  <div className="flex gap-1 opacity-50">
                    <div className="h-1 w-1 bg-[#D4A847]" />
                    <div className="h-1 w-1 bg-[#D4A847]" />
                    <div className="h-1 w-1 bg-[#D4A847]" />
                  </div>
                </h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#8A9BAD" fontSize={10} tickLine={false} axisLine={false} tick={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }} />
                      <YAxis stroke="#8A9BAD" fontSize={10} tickLine={false} axisLine={false} tick={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F1923',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: '10px',
                          color: '#8A9BAD',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}
                        itemStyle={{ color: '#D4A847' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="verified"
                        stroke="#D4A847"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#0F1923', strokeWidth: 2, stroke: '#D4A847' }}
                        activeDot={{ r: 6, fill: '#D4A847', strokeWidth: 0 }}
                        name="Verified Records"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Infrastructure indicators and smart score distribution */}
            <div className="grid gap-6 lg:grid-cols-2 mt-6">
              {/* Infrastructure Indicators */}
              <div className="bg-[#141C25]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#C4622D]/40" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#C4622D] mb-6 flex items-center justify-between">
                  <span>Infrastructure Penetration</span>
                  <div className="flex gap-1 opacity-50">
                    <div className="h-1 w-1 bg-[#C4622D]" />
                    <div className="h-1 w-1 bg-[#C4622D]" />
                    <div className="h-1 w-1 bg-[#C4622D]" />
                  </div>
                </h3>
                
                <div className="space-y-6">
                  {[
                    { label: "Internet Access", pct: activeOverview.internetPercentage, count: activeOverview.schoolsWithInternet, color: "#3b82f6" },
                    { label: "Electricity connection", pct: activeOverview.electricityPercentage, count: activeOverview.schoolsWithElectricity, color: "#f59e0b" },
                    { label: "Smart Classroom", pct: activeOverview.smartClassroomPercentage, count: activeOverview.schoolsWithSmartClassroom, color: "#10b981" },
                    { label: "Playground facilities", pct: activeOverview.playgroundPercentage, count: activeOverview.schoolsWithPlayground, color: "#ec4899" }
                  ].map(item => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#8A9BAD] uppercase tracking-wider">{item.label}</span>
                        <span className="text-white font-bold">{item.pct}% ({item.count} schools)</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Score Distribution Chart */}
              <div className="bg-[#141C25]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#D4A847]/40" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4A847] mb-6 flex items-center justify-between">
                  <span>Smart Score Distribution</span>
                  <div className="flex gap-1 opacity-50">
                    <div className="h-1 w-1 bg-[#D4A847]" />
                    <div className="h-1 w-1 bg-[#D4A847]" />
                    <div className="h-1 w-1 bg-[#D4A847]" />
                  </div>
                </h3>
                
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="score" stroke="#8A9BAD" fontSize={10} tickLine={false} axisLine={false} tick={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }} />
                      <YAxis stroke="#8A9BAD" fontSize={10} tickLine={false} axisLine={false} tick={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F1923',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: '10px',
                          color: '#8A9BAD',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="count" fill="#D4A847" radius={[4, 4, 0, 0]} name="School Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="builder" className="pt-2">
            <Card className="rounded-2xl shadow-2xl overflow-hidden border-white/5 bg-[#141C25]/60 backdrop-blur-xl">
              <CardHeader className="bg-black/20 border-b border-white/5">
                <CardTitle className="text-xl font-display uppercase tracking-wide italic text-white">Custom Data Archive</CardTitle>
                <CardDescription className="font-mono text-[10px] text-[#8A9BAD] uppercase tracking-widest">Filter and compile specific datasets for official use.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest">Select Region</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="rounded-xl h-12 bg-black/40 border-white/10 text-white font-mono text-xs">
                        <SelectValue placeholder="All Rwanda" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1923] border border-white/10 text-white font-mono text-xs z-[1002]">
                        <SelectItem value="all">National (All)</SelectItem>
                        <SelectItem value="kigali">Kigali City</SelectItem>
                        <SelectItem value="north">Northern Province</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest">Data Category</label>
                    <Select defaultValue="general">
                      <SelectTrigger className="rounded-xl h-12 bg-black/40 border-white/10 text-white font-mono text-xs">
                        <SelectValue placeholder="General Info" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1923] border border-white/10 text-white font-mono text-xs z-[1002]">
                        <SelectItem value="general">School Profiles</SelectItem>
                        <SelectItem value="infra">Infrastructure Status</SelectItem>
                        <SelectItem value="wash">WASH Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-[#8A9BAD] tracking-widest">Output Format</label>
                    <Select defaultValue="pdf">
                      <SelectTrigger className="rounded-xl h-12 bg-black/40 border-white/10 text-white font-mono text-xs">
                        <SelectValue placeholder="PDF" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0F1923] border border-white/10 text-white font-mono text-xs z-[1002]">
                        <SelectItem value="pdf">Official PDF Report</SelectItem>
                        <SelectItem value="csv">Raw CSV Data</SelectItem>
                        <SelectItem value="json">GeoJSON Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="font-mono text-[10px] font-bold uppercase text-white tracking-widest">Included Variables:</h4>
                  <div className="flex flex-wrap gap-3">
                    {["GPS Coordinates", "Building Condition", "Student Count", "Teacher Count", "WASH Status", "Last Verification Date"].map(v => (
                      <div key={v} className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[#C4622D]/10 text-[#C4622D] border border-[#C4622D]/20">
                        {v}
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-14 rounded-xl font-label font-bold uppercase tracking-widest bg-[#C4622D] hover:bg-[#A85225] text-white transition-all hover:scale-[1.01]" onClick={handleGenerateReport}>
                  <Search className="mr-3 h-5 w-5" />
                  Generate Custom Dataset
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="pt-2">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-2xl border border-white/5 bg-[#141C25]/60 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 text-[#3D7A5C]">
                    <ShieldCheck className="h-5 w-5" />
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <CardTitle className="text-sm uppercase font-label font-bold tracking-widest cursor-help flex items-center gap-2">
                            National QA Score <Info className="h-3 w-3 text-[#8A9BAD]" />
                          </CardTitle>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-4 bg-[#0F1923] border border-white/10 text-[#8A9BAD] font-mono text-[10px] leading-relaxed z-[1002]">
                          Comprehensive metric calculating the accuracy of school locations, structural integrity scores, and documentation completeness across all 30 districts.
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-display font-bold text-white tracking-tighter">92.4%</div>
                  <p className="text-[10px] font-mono uppercase text-[#8A9BAD] mt-2 mb-6 tracking-widest">Weighted average</p>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3D7A5C] rounded-full" style={{ width: '92.4%' }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-white/5 bg-[#141C25]/60 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 text-[#D4A847]">
                    <AlertCircle className="h-5 w-5" />
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <CardTitle className="text-sm uppercase font-label font-bold tracking-widest cursor-help flex items-center gap-2">
                            Data Gaps <Info className="h-3 w-3 text-[#8A9BAD]" />
                          </CardTitle>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-4 bg-[#0F1923] border border-white/10 text-[#8A9BAD] font-mono text-[10px] leading-relaxed z-[1002]">
                          Identifies records missing critical field-level attributes (e.g., student capacity or WASH facility counts) added in Phase 2 enrichments.
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-display font-bold text-white tracking-tighter">14.2%</div>
                  <p className="text-[10px] font-mono uppercase text-[#8A9BAD] mt-2 mb-6 tracking-widest">Avg missing fields</p>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4A847] rounded-full" style={{ width: '14.2%' }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1 p-8 bg-[#141C25]/60 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col justify-center gap-6">
                <h4 className="font-label text-sm uppercase font-bold text-white tracking-widest">Provincial Quality</h4>
                <div className="space-y-4">
                  {[
                    { p: "Kigali City", q: 98 },
                    { p: "Northern", q: 94 },
                    { p: "Eastern", q: 89 },
                    { p: "Western", q: 87 },
                    { p: "Southern", q: 84 },
                  ].map(item => (
                    <div key={item.p} className="flex items-center gap-4 group">
                      <span className="text-[10px] w-20 uppercase font-mono font-bold text-[#8A9BAD] group-hover:text-white transition-colors">{item.p}</span>
                      <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C4622D] rounded-full transition-all group-hover:bg-[#D4A847]" style={{ width: `${item.q}%` }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-white w-8 text-right">{item.q}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
