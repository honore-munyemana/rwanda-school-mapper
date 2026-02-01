import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { VerificationChart } from '@/components/dashboard/VerificationChart';
import { DistrictChart } from '@/components/dashboard/DistrictChart';
import { sampleSchools, getSchoolStats } from '@/data/rwandaSchools';
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
import { School, TrendingUp, MapPin, Users, GraduationCap } from 'lucide-react';

export default function Analytics() {
  const stats = getSchoolStats(sampleSchools);

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
    { month: 'Dec', verified: stats.verified, pending: stats.pending },
  ];

  const colors = ['hsl(173, 58%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 45%)'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into school verification data
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Schools"
            value={stats.total}
            description="Registered in system"
            icon={<School className="h-6 w-6" />}
            variant="primary"
          />
          <StatsCard
            title="Verification Rate"
            value={`${stats.verificationRate}%`}
            description="Schools verified"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatsCard
            title="Districts Covered"
            value={Object.keys(stats.byDistrict).length}
            description="Active districts"
            icon={<MapPin className="h-6 w-6" />}
            variant="default"
          />
          <StatsCard
            title="Education Levels"
            value={Object.keys(stats.byEducationLevel).length}
            description="Categories tracked"
            icon={<GraduationCap className="h-6 w-6" />}
            variant="default"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <VerificationChart
            data={{
              verified: stats.verified,
              pending: stats.pending,
              unverified: stats.unverified,
              rejected: stats.rejected,
            }}
          />

          {/* Monthly Verification Trend */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Verification Trend</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="verified"
                    stroke="hsl(142, 71%, 45%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142, 71%, 45%)' }}
                    name="Verified"
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(38, 92%, 50%)' }}
                    name="Pending"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DistrictChart data={stats.byDistrict} />

          {/* Schools by Province */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Schools by Province</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value: number) => [`${value} schools`, 'Total']}
                  />
                  <Bar dataKey="value" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Education Level Distribution */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">By Education Level</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={educationLevelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {educationLevelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {educationLevelData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* School Type Breakdown */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">School Type</h3>
            <div className="space-y-6 mt-8">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Public Schools</span>
                  <span className="font-semibold">{stats.publicSchools}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(stats.publicSchools / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Private Schools</span>
                  <span className="font-semibold">{stats.privateSchools}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${(stats.privateSchools / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Public schools represent{' '}
                <span className="font-semibold text-foreground">
                  {Math.round((stats.publicSchools / stats.total) * 100)}%
                </span>{' '}
                of all registered schools
              </p>
            </div>
          </div>

          {/* Data Quality */}
          <div className="bg-card rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4">Data Quality</h3>
            <div className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GPS Accuracy</span>
                  <span className="text-lg font-bold text-success">94%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Schools with valid coordinates
                </p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Photo Evidence</span>
                  <span className="text-lg font-bold text-warning">67%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Schools with uploaded photos
                </p>
              </div>
              <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Complete Records</span>
                  <span className="text-lg font-bold text-info">82%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All required fields filled
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
