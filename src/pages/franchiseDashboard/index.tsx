import { useState } from 'react';
import { Select, Table, Tag } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  DollarOutlined, TeamOutlined, UserAddOutlined, PercentageOutlined,
  BranchesOutlined, StarOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/dashboards/StatCard';
import './styles.scss';

/* ─── Mock Data ───────────────────────────────────────────────── */

const revenueData = [
  { period: 'Mon', Revenue: 42000 },
  { period: 'Tue', Revenue: 38000 },
  { period: 'Wed', Revenue: 51000 },
  { period: 'Thu', Revenue: 47000 },
  { period: 'Fri', Revenue: 62000 },
  { period: 'Sat', Revenue: 78000 },
  { period: 'Sun', Revenue: 55000 },
];

const ptVsMembershipData = [
  { name: 'Membership', value: 62, color: '#6366f1' },
  { name: 'PT Revenue',  value: 28, color: '#10b981' },
  { name: 'Add-Ons',    value: 10, color: '#f59e0b' },
];

const newVsRenewalData = [
  { name: 'New',     value: 38, color: '#6366f1' },
  { name: 'Renewal', value: 62, color: '#10b981' },
];

const teamPerformanceData = [
  { key: '1', name: 'Rahul M.',   role: 'Sales',   target: 150000, achieved: 142000, sessions: '-' },
  { key: '2', name: 'Priya S.',   role: 'Sales',   target: 150000, achieved: 128000, sessions: '-' },
  { key: '3', name: 'Kiran J.',   role: 'Trainer', target: 80,     achieved: 72,     sessions: '72 / 80' },
  { key: '4', name: 'Amit R.',    role: 'Trainer', target: 80,     achieved: 65,     sessions: '65 / 80' },
];

const bookingSourceData = [
  { source: 'Walk-in',  bookings: 48, color: '#6366f1' },
  { source: 'Website',  bookings: 36, color: '#10b981' },
  { source: 'Referral', bookings: 24, color: '#f59e0b' },
  { source: 'Concierge',bookings: 18, color: '#ec4899' },
];

const expenseData = [
  { month: 'Mar', Revenue: 510000, Expense: 320000 },
  { month: 'Apr', Revenue: 475000, Expense: 298000 },
  { month: 'May', Revenue: 560000, Expense: 340000 },
  { month: 'Jun', Revenue: 620000, Expense: 365000 },
];

const fmt = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

const teamColumns = [
  { title: 'Name',     dataIndex: 'name',     key: 'name' },
  { title: 'Role',     dataIndex: 'role',     key: 'role',
    render: (r: string) => <Tag color={r === 'Sales' ? 'blue' : 'green'}>{r}</Tag> },
  { title: 'Target',   dataIndex: 'target',   key: 'target',
    render: (v: number, r: any) => r.role === 'Trainer' ? `${v} sessions` : fmt(v) },
  { title: 'Achieved', dataIndex: 'achieved', key: 'achieved',
    render: (v: number, r: any) => {
      const pct = Math.round((v / r.target) * 100);
      return (
        <span style={{ color: pct >= 90 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
          {r.role === 'Trainer' ? `${v} sessions` : fmt(v)} ({pct}%)
        </span>
      );
    }},
];

const RADIAN = Math.PI / 180;
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ─── Component ───────────────────────────────────────────────── */

const FranchiseDashboard = () => {
  const [franchise, setFranchise] = useState('bellator_bandra');
  const [period,    setPeriod]    = useState('monthly');

  return (
    <div className="frd-page">

      {/* ── Header ── */}
      <div className="frd-header">
        <div className="frd-header-left">
          <BranchesOutlined style={{ color: 'var(--accent)', fontSize: 20 }} />
          <h2 className="frd-title">Franchise Dashboard</h2>
        </div>
        <div className="frd-header-right">
          <Select
            value={franchise}
            onChange={setFranchise}
            style={{ width: 180 }}
            options={[
              { label: 'Bellator Bandra',  value: 'bellator_bandra' },
              { label: 'Bellator Thane',   value: 'bellator_thane' },
              { label: 'Bellator Pune',    value: 'bellator_pune' },
            ]}
          />
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 130 }}
            options={[
              { label: 'Today',   value: 'daily' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly',  value: 'yearly' },
            ]}
          />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="frd-stats-grid">
        <StatCard title="Club Revenue"     value="₹7.1L"  icon={<DollarOutlined />}     color="#6366f1" trend={{ value: 9,  up: true  }} subtitle="This month" />
        <StatCard title="New Customers"    value="84"     icon={<UserAddOutlined />}     color="#10b981" trend={{ value: 14, up: true  }} subtitle="vs last month" />
        <StatCard title="Renewals"         value="196"    icon={<TeamOutlined />}        color="#f59e0b" trend={{ value: 4,  up: false }} subtitle="This month" />
        <StatCard title="Conversion Rate"  value="68%"    icon={<PercentageOutlined />}  color="#ec4899" trend={{ value: 3,  up: true  }} subtitle="Walk-in to member" />
      </div>

      {/* ── Revenue + Split Charts ── */}
      <div className="frd-charts-row">

        {/* Daily Revenue Bar */}
        <div className="frd-chart-card frd-chart-wide">
          <div className="frd-chart-head">
            <span className="frd-chart-title">Weekly Revenue</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.25} vertical={false} />
              <XAxis dataKey="period" tick={{ fill: 'var(--sider-text)', fontSize: 11, opacity: 0.6 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fill: 'var(--sider-text)', fontSize: 10, opacity: 0.45 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--muted)', borderRadius: 8, color: 'var(--sider-text)' }} />
              <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PT vs Membership Donut */}
        <div className="frd-chart-card">
          <div className="frd-chart-head">
            <span className="frd-chart-title">Revenue Split</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ptVsMembershipData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={renderPieLabel}>
                {ptVsMembershipData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--sider-text)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* New vs Renewal */}
        <div className="frd-chart-card">
          <div className="frd-chart-head">
            <span className="frd-chart-title">New vs Renewal</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={newVsRenewalData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" labelLine={false} label={renderPieLabel}>
                {newVsRenewalData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--sider-text)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="frd-bottom-row">

        {/* Team Performance */}
        <div className="frd-section">
          <div className="frd-section-head">
            <TeamOutlined style={{ color: '#6366f1' }} />
            <span>Team Performance</span>
          </div>
          <Table
            columns={teamColumns}
            dataSource={teamPerformanceData}
            pagination={false}
            size="small"
            className="frd-table"
          />
        </div>

        <div className="frd-side-col">
          {/* Booking Sources */}
          <div className="frd-section">
            <div className="frd-section-head">
              <StarOutlined style={{ color: '#f59e0b' }} />
              <span>Booking Sources</span>
            </div>
            <div className="frd-source-list">
              {bookingSourceData.map(b => (
                <div key={b.source} className="frd-source-item">
                  <span className="frd-source-dot" style={{ background: b.color }} />
                  <span className="frd-source-label">{b.source}</span>
                  <span className="frd-source-count" style={{ color: b.color }}>{b.bookings}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expense vs Revenue */}
          <div className="frd-section">
            <div className="frd-section-head">
              <DollarOutlined style={{ color: '#ec4899' }} />
              <span>Expense vs Revenue</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={expenseData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--sider-text)', fontSize: 10, opacity: 0.55 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fill: 'var(--sider-text)', fontSize: 9, opacity: 0.45 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--muted)', borderRadius: 8, color: 'var(--sider-text)', fontSize: 11 }} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[3,3,0,0]} barSize={14} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[3,3,0,0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranchiseDashboard;
