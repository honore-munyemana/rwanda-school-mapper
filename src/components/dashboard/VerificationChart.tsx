import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface VerificationChartProps {
  data: {
    verified: number;
    pending: number;
    unverified: number;
    rejected: number;
  };
}

export function VerificationChart({ data }: VerificationChartProps) {
  const chartData = [
    { name: 'Verified', value: data.verified, color: 'hsl(142, 71%, 45%)' },
    { name: 'Pending', value: data.pending, color: 'hsl(38, 92%, 50%)' },
    { name: 'Unverified', value: data.unverified, color: 'hsl(215, 15%, 60%)' },
    { name: 'Rejected', value: data.rejected, color: 'hsl(0, 72%, 51%)' },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card rounded-xl border p-6 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number, name: string) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm text-muted-foreground">
                  {value}: {entry.payload.value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
