import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
    { name: 'Verified', value: data.verified, color: '#3D7A5C' },
    { name: 'Pending', value: data.pending, color: '#D4A847' },
    { name: 'Unverified', value: data.unverified, color: '#8A9BAD' },
    { name: 'Rejected', value: '#ef4444' },
  ];

  const total = chartData.reduce((sum, item) => sum + (item.value as number), 0);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 8px ${entry.color}44)` }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F1923',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '10px',
              color: '#8A9BAD',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
            itemStyle={{ color: '#white' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            formatter={(value: number, name: string) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-mono font-bold text-[#8A9BAD] uppercase tracking-widest">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
