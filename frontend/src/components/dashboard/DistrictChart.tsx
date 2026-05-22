import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DistrictChartProps {
  data: Record<string, number>;
}

const COLORS = [
  '#C4622D',
  '#D4A847',
  '#3D7A5C',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#14b8a6'
];

export function DistrictChart({ data }: DistrictChartProps) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 districts

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-[300px] w-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{ filter: `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}44)` }}
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
                `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 px-2 pb-2">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-[10px] font-mono font-bold text-[#8A9BAD] uppercase tracking-widest">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
