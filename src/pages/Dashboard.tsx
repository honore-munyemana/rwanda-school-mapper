import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { VerificationChart } from '@/components/dashboard/VerificationChart';
import { DistrictChart } from '@/components/dashboard/DistrictChart';
import { RecentSchools } from '@/components/dashboard/RecentSchools';
import { SchoolMap } from '@/components/map/SchoolMap';
import { sampleSchools, getSchoolStats } from '@/data/rwandaSchools';
import { School, CheckCircle, Clock, AlertCircle, XCircle, TrendingUp, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = getSchoolStats(sampleSchools);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of school verification across Rwanda
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/schools">View All Schools</Link>
            </Button>
            <Button asChild>
              <Link to="/map">
                <MapPin className="mr-2 h-4 w-4" />
                Open Map
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Schools"
            value={stats.total}
            description="Registered in system"
            icon={<School className="h-6 w-6" />}
            variant="primary"
          />
          <StatsCard
            title="Verified"
            value={stats.verified}
            description={`${stats.verificationRate}% verification rate`}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Pending Validation"
            value={stats.pending}
            description="Awaiting review"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <StatsCard
            title="Unverified"
            value={stats.unverified}
            description="Need field validation"
            icon={<AlertCircle className="h-6 w-6" />}
            variant="default"
          />
        </div>

        {/* Map Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">School Distribution Map</h2>
            <Link to="/map" className="text-sm text-primary hover:text-primary/80">
              Full screen →
            </Link>
          </div>
          <SchoolMap schools={sampleSchools} height="400px" />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <VerificationChart
            data={{
              verified: stats.verified,
              pending: stats.pending,
              unverified: stats.unverified,
              rejected: stats.rejected,
            }}
          />
          <DistrictChart data={stats.byDistrict} />
          <RecentSchools schools={sampleSchools} />
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verification Rate</p>
                <p className="text-2xl font-bold">{stats.verificationRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                <School className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Public Schools</p>
                <p className="text-2xl font-bold">{stats.publicSchools}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Private Schools</p>
                <p className="text-2xl font-bold">{stats.privateSchools}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
