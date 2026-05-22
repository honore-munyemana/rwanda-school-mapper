import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export function SimpleAnalytics() {
    const { stats } = useData();

    const provinceCount = Object.keys(stats.byProvince).length;
    const districtCount = Object.keys(stats.byDistrict).length;

    // Find top province
    const topProvinceArray = Object.entries(stats.byProvince).sort((a, b) => b[1] - a[1]);
    const topProvince = topProvinceArray.length > 0 ? topProvinceArray[0] : ['None', 0];

    const chartData = Object.entries(stats.byProvince).map(([name, count]) => ({
        name: name.replace(' Province', '').replace(' City', ''),
        Schools: count
    }));

    return (
        <Card className="w-full shadow-xl border-t-4 border-t-primary mb-6">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">School Distribution Analytics</CardTitle>
                <CardDescription>
                    A simple breakdown explaining the math of the schools and their geographical locations.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 space-y-4 text-sm leading-relaxed">
                    <p>
                        Currently, there are exactly <strong className="text-primary">{stats.total}</strong> schools registered in our system. Of these, <strong className="text-primary">{stats.verified}</strong> have been fully verified.
                    </p>
                    <p>
                        Geographically, these schools are distributed across <strong className="text-primary">{provinceCount}</strong> provinces and <strong className="text-primary">{districtCount}</strong> districts in Rwanda.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            The total count is achieved by collecting and summing every unique school record submitted.
                        </li>
                        <li>
                            The location with the highest concentration is <strong className="text-primary">{topProvince[0]}</strong>, which contains <strong className="text-primary">{topProvince[1]}</strong> registered schools.
                        </li>
                        <li>
                            Out of the <strong className="text-primary">{stats.total}</strong> schools, <strong className="text-primary">{stats.verified}</strong> are verified, <strong className="text-primary">{stats.pending}</strong> are pending, and <strong className="text-primary">{stats.unverified}</strong> are unverified. This translates to a verification rate of <strong className="text-primary">{stats.verificationRate}%</strong>.
                        </li>
                    </ul>
                </div>

                <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">Schools by Province</h4>
                    <div className="h-[250px] w-full p-4 border rounded-xl bg-card/50">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="Schools"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => {
                                        const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                style={{ filter: `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]}44)` }}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                                    formatter={(value: number, name: string) => [
                                        `${value} (${stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : 0}%)`,
                                        name,
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
