import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useSelector } from 'react-redux';
import { useGetSalesMonthlyQuery } from '../../services/upline';
import './RevenueAreaChart.scss';

const FILTERS = [
  { key: '6',   label: '6M ago' },
  { key: '3',   label: '3M ago' },
  { key: '1',   label: 'Last Mo' },
  { key: '0',   label: 'This Mo'  },
];

const FILTER_MAP: Record<string, string> = {
  '0':   'this_month',
  '1':   'last_month',
  '3':   '3_months',
  '6':   '6_months',
};

function mapSales(apiData: any, empKey: string, trainKey: string) {
  if (!apiData?.data) return { sales: 0, trainers: 0 };
  const emp = apiData.data.employee ?? [];
  const trn = apiData.data.trainer ?? [];
  return {
    sales:    emp.reduce((s: number, e: any)    => s + (e[empKey]   || 0), 0),
    trainers: trn.reduce((s: number, t: any) => s + (t[trainKey] || 0), 0),
  };
}

const fmt = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
  : v >= 1000  ? `₹${(v / 1000).toFixed(1)}K`
  : `₹${v}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rac-tooltip">
      <p className="rac-tt-label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>₹{Number(p.value).toLocaleString('en-IN')}</strong>
        </p>
      ))}
    </div>
  );
};

const RevenueAreaChart = () => {
  const branchId = useSelector((state: any) => state.branch.selectedBranch);
  const bId = typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const q6 = useGetSalesMonthlyQuery({ filter: '6_months', ...(bId && { branchId: bId }) } as any);
  const q3 = useGetSalesMonthlyQuery({ filter: '3_months', ...(bId && { branchId: bId }) } as any);
  const q1 = useGetSalesMonthlyQuery({ filter: 'last_month', ...(bId && { branchId: bId }) } as any);
  const q0 = useGetSalesMonthlyQuery({ filter: 'this_month', ...(bId && { branchId: bId }) } as any);

  const queries = [q6, q3, q1, q0];

  const chartData = FILTERS.map((f, i) => {
    const r = mapSales(queries[i].data, 'thisMonthSales', 'thisMonthSales');
    return { name: f.label, Sales: r.sales, Trainers: r.trainers };
  });

  const isLoading = queries.some(q => q.isLoading);

  return (
    <div className="rac-card">
      <div className="rac-header">
        <div className="rac-header-left">
          <span className="rac-badge">LIVE</span>
          <span className="rac-title">Revenue Trend</span>
        </div>
        <div className="rac-legend-row">
          <span className="rac-dot" style={{ background: '#6366f1' }} /> Sales
          <span className="rac-dot" style={{ background: '#10b981' }} /> Trainers
        </div>
      </div>

      {isLoading ? (
        <div className="rac-skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradTrainers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.3} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--sider-text)', fontSize: 11, opacity: 0.55 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fill: 'var(--sider-text)', fontSize: 10, opacity: 0.45 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="Sales"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#gradSales)"
              dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="Trainers"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#gradTrainers)"
              dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RevenueAreaChart;
