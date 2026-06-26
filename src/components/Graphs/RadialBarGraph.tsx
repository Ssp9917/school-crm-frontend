import { ResponsiveContainer, RadialBar, RadialBarChart, Legend } from 'recharts';
import type { CSSProperties } from 'react';

interface AgeGroup {
  name: string;
  members: number;
  count: number;
  fill: string;
}

const data: AgeGroup[] = [
  { name: '18-24',   members: 28.5, count: 1425, fill: '#10b981' },
  { name: '25-29',   members: 24.2, count: 1210, fill: '#3b82f6' },
  { name: '30-34',   members: 18.3, count: 915,  fill: '#8b5cf6' },
  { name: '35-39',   members: 12.8, count: 640,  fill: '#f59e0b' },
  { name: '40-49',   members: 10.5, count: 525,  fill: '#ef4444' },
  { name: '50+',     members: 4.2,  count: 210,  fill: '#06b6d4' },
  { name: 'Unknown', members: 1.5,  count: 75,   fill: '#6b7280' },
];

const legendStyle: CSSProperties = {
  top: '50%',
  right: 0,
  transform: 'translate(0, -50%)',
  lineHeight: '24px',
};

function RadialBarGraph() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={data}>
        <RadialBar
          {...{ minAngle: 15 } as any}
          background={{ fill: 'var(--bar-color)' }}
          clockWise
          dataKey="members"
        />
        <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={legendStyle} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

export default RadialBarGraph;
