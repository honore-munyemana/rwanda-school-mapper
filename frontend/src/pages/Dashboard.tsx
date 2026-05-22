import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { VerificationChart } from '@/components/dashboard/VerificationChart';
import { DistrictChart } from '@/components/dashboard/DistrictChart';
import { RecentSchools } from '@/components/dashboard/RecentSchools';
import { SchoolMap } from '@/components/map/SchoolMap';
import { School, CheckCircle, Clock, AlertCircle, TrendingUp, Users, MapPin, Activity, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useUser } from '@/context/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { schools, stats } = useData();
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(true);

  // Simulate mission control initialization
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-10 animate-pulse">
          <div className="flex justify-between items-end">
            <div className="space-y-3">
              <Skeleton className="h-10 w-80 bg-white/5" />
              <Skeleton className="h-4 w-60 bg-white/5" />
            </div>
            <Skeleton className="h-12 w-48 bg-white/5 rounded-xl" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl bg-white/5 border border-white/5" />)}
          </div>
          <Skeleton className="h-[500px] w-full rounded-2xl bg-white/5 border border-white/5" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Mission Control Header */}
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 border-l-4 border-[#C4622D] pl-6 py-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#D4A847]" />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#8A9BAD]/60">Operational Status: GREEN</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight">
              {currentUser ? <span className="text-[#C4622D]">{currentUser.role.toUpperCase()}</span> : 'NATIONAL'} CONTROL HUB
            </h1>
            <p className="font-label text-[#8A9BAD] text-lg max-w-2xl italic">
              "Mapping the foundation of knowledge with precision cartography."
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" asChild className="h-12 border-white/5 bg-white/5 hover:bg-white/10 text-white font-label rounded-xl px-6 group transition-all">
              <Link to="/schools" className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-[#D4A847] group-hover:animate-spin" />
                Registry Log
              </Link>
            </Button>
            <Button asChild className="h-12 bg-[#C4622D] hover:bg-[#A85225] text-white font-label rounded-xl px-8 shadow-xl shadow-[#C4622D]/20 group transition-all">
              <Link to="/map" className="flex items-center gap-3">
                <MapPin className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                Launch GIS Radar
              </Link>
            </Button>
          </div>
        </div>

        {/* Strategic KPIs */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Registry Amplitude"
            value={stats.total}
            description="Active National Records"
            icon={<School className="h-7 w-7" />}
            variant="primary"
          />
          <StatsCard
            title="Verification Index"
            value={stats.verified}
            description={`${stats.verificationRate}% Integrity`}
            icon={<CheckCircle className="h-7 w-7" />}
            variant="success"
            trend={{ value: 1.4, isPositive: true }}
          />
          <StatsCard
            title="Latency Buffer"
            value={stats.pending}
            description="Pending Validation"
            icon={<Clock className="h-7 w-7" />}
            variant="warning"
          />
          <StatsCard
            title="Geospatial Alerts"
            value={stats.unverified}
            description="Field Check Mandatory"
            icon={<AlertCircle className="h-7 w-7" />}
            variant="danger"
          />
        </div>

        {/* Live GIS Interface Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-[#C4622D] animate-ping" />
              <h2 className="font-display text-xl font-bold tracking-wide text-white">LIVE GEOSPATIAL FEED</h2>
            </div>
            <Link to="/map" className="font-mono text-[10px] text-[#D4A847] hover:text-white uppercase tracking-[0.2em] flex items-center gap-2 group transition-all">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Launch Fullscreen</span>
              Radar 01 →
            </Link>
          </div>
          <div className="rounded-2xl border border-white/5 shadow-2xl overflow-hidden ring-4 ring-black/40 relative group">
            <div className="absolute top-4 left-4 z-10 p-3 bg-[#0F1923]/80 backdrop-blur-md rounded-lg border border-white/5 font-mono text-[9px] text-[#8A9BAD] uppercase tracking-widest hidden md:block">
              Coordinates: 1.9441° S, 30.0619° E (Kigali)
            </div>
            <SchoolMap schools={schools} height="500px" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0F1923] to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Intelligence Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 grid gap-8 md:grid-cols-2">
            <div className="bg-[#141C25]/40 backdrop-blur-md rounded-2xl border border-white/5 p-8 transition-all hover:border-[#C4622D]/30 group">
              <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-3">
                <Activity className="h-5 w-5 text-[#C4622D]" />
                PROGRESS VECTORS
              </h3>
              <VerificationChart
                data={{
                  verified: stats.verified,
                  pending: stats.pending,
                  unverified: stats.unverified,
                  rejected: stats.rejected,
                }}
              />
            </div>
            <div className="bg-[#141C25]/40 backdrop-blur-md rounded-2xl border border-white/5 p-8 transition-all hover:border-[#D4A847]/30 group">
              <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="h-5 w-5 text-[#D4A847]" />
                DISTRICT AMPLITUDES
              </h3>
              <DistrictChart data={stats.byDistrict} />
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#141C25]/60 backdrop-blur-xl rounded-2xl border border-[#C4622D]/20 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2">
              <Zap className="h-4 w-4 text-[#D4A847]/20 group-hover:text-[#D4A847] transition-colors" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center justify-between">
              <span>LIVE SIGNAL LOG</span>
              <div className="flex gap-1">
                <div className="h-1 w-1 rounded-full bg-[#3D7A5C] animate-pulse" />
                <div className="h-1 w-1 rounded-full bg-[#3D7A5C] animate-pulse delay-75" />
                <div className="h-1 w-1 rounded-full bg-[#3D7A5C] animate-pulse delay-150" />
              </div>
            </h3>
            <RecentSchools schools={schools} />
            <div className="mt-6 pt-6 border-t border-white/5">
              <Button variant="ghost" className="w-full font-mono text-[10px] uppercase tracking-[0.3em] text-[#8A9BAD] hover:text-white" asChild>
                <Link to="/schools">View Complete Archive</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
