import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthData {
  name: string;
  members: number;
  revenue: number;
}

const data: MonthData[] = [
  { name: 'Jan', members: 2400, revenue: 240000 },
  { name: 'Feb', members: 2600, revenue: 285000 },
  { name: 'Mar', members: 2900, revenue: 320000 },
  { name: 'Apr', members: 3200, revenue: 365000 },
  { name: 'May', members: 3500, revenue: 410000 },
  { name: 'Jun', members: 3800, revenue: 445000 },
  { name: 'Jul', members: 4100, revenue: 485000 },
  { name: 'Aug', members: 4300, revenue: 520000 },
  { name: 'Sep', members: 4500, revenue: 555000 },
  { name: 'Oct', members: 4700, revenue: 580000 },
  { name: 'Nov', members: 4900, revenue: 615000 },
  { name: 'Dec', members: 5200, revenue: 650000 },
];

function Bargraph() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="members"
          fill="#10b981"
          background={{ fill: 'var(--page-bg-color)', radius: [20, 20, 20, 20] as any }}
          barSize="3%"
          radius={[20, 20, 20, 20] as any}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default Bargraph;
