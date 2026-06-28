import { useState } from 'react';
import { Select, DatePicker, Segmented, Table, Progress, Tag } from 'antd';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  DollarOutlined, TeamOutlined, UserAddOutlined, LoginOutlined,
  TrophyOutlined, RiseOutlined, ShopOutlined, FileTextOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/dashboards/StatCard';
import './styles.scss';

const { RangePicker } = DatePicker;

/* ─── Mock Data ──────────────────────────────────────────────── */

const revenueTrendData = [
  { month: 'Jan', TuitionFee: 420000, AdmissionFee: 185000, UniformsAndBooks: 62000 },
  { month: 'Feb', TuitionFee: 380000, AdmissionFee: 210000, UniformsAndBooks: 74000 },
  { month: 'Mar', TuitionFee: 510000, AdmissionFee: 198000, UniformsAndBooks: 88000 },
  { month: 'Apr', TuitionFee: 475000, AdmissionFee: 225000, UniformsAndBooks: 95000 },
  { month: 'May', TuitionFee: 560000, AdmissionFee: 240000, UniformsAndBooks: 110000 },
  { month: 'Jun', TuitionFee: 620000, AdmissionFee: 270000, UniformsAndBooks: 128000 },
];

const clubLeaderboardData = [
  { key: '1', club: 'Andheri Campus', revenue: 820000, checkins: 1240, reviews: 4.8, type: 'Direct' },
  { key: '2', club: 'Bandra Campus',  revenue: 710000, checkins: 1080, reviews: 4.6, type: 'Franchise' },
  { key: '3', club: 'Powai Campus',   revenue: 680000, checkins: 990,  reviews: 4.7, type: 'Direct' },
  { key: '4', club: 'Thane Campus',   revenue: 540000, checkins: 820,  reviews: 4.5, type: 'Franchise' },
  { key: '5', club: 'Pune Campus',    revenue: 490000, checkins: 760,  reviews: 4.4, type: 'Franchise' },
];

const salesLeaderboardData = [
  { key: '1', rank: 1,  name: 'Rohan Mehta',   branch: 'Andheri', sales: 142000, deals: 18 },
  { key: '2', rank: 2,  name: 'Priya Shah',    branch: 'Bandra',  sales: 128000, deals: 15 },
  { key: '3', rank: 3,  name: 'Amit Kumar',    branch: 'Powai',   sales: 115000, deals: 14 },
  { key: '4', rank: 4,  name: 'Neha Gupta',    branch: 'Thane',   sales: 98000,  deals: 12 },
  { key: '5', rank: 5,  name: 'Rahul Verma',   branch: 'Pune',    sales: 87000,  deals: 10 },
];

const revenueBreakdown = [
  { name: 'Tuition Fee', value: 620000, color: '#6366f1' },
  { name: 'Admission Fee', value: 270000, color: '#10b981' },
  { name: 'Uniforms & Books', value: 128000, color: '#f59e0b' },
  { name: 'Extracurriculars', value: 55000,  color: '#ec4899' },
  { name: 'Transport',    value: 38000,  color: '#8b5cf6' },
];

const crmData = [
  { source: 'Website',  leads: 142, color: '#6366f1' },
  { source: 'Walk-ins', leads: 98,  color: '#10b981' },
  { source: 'Referral', leads: 76,  color: '#f59e0b' },
  { source: 'App',      leads: 54,  color: '#ec4899' },
];

const fmt = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
  : v >= 1000  ? `₹${(v / 1000).toFixed(0)}K`
  : `₹${v}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <p className="db-tt-label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

/* ─── Columns ────────────────────────────────────────────────── */

const clubColumns = [
  { title: '#',       key: 'idx',     width: 40,  render: (_: any, __: any, i: number) => i + 1 },
  { title: 'Campus',    dataIndex: 'club',    key: 'club' },
  { title: 'Type',    dataIndex: 'type',    key: 'type',
    render: (t: string) => <Tag color={t === 'Direct' ? 'blue' : 'purple'}>{t}</Tag> },
  { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: fmt },
  { title: 'Attendance', dataIndex: 'checkins', key: 'checkins' },
  { title: 'Rating',  dataIndex: 'reviews', key: 'reviews',
    render: (v: number) => <span style={{ color: '#f59e0b' }}>★ {v}</span> },
];

const salesColumns = [
  { title: 'Rank', dataIndex: 'rank', key: 'rank', width: 60,
    render: (r: number) => (
      <span style={{ color: r <= 3 ? '#f59e0b' : 'var(--muted)', fontWeight: 700 }}>
        {r <= 3 ? ['🥇','🥈','🥉'][r-1] : r}
      </span>
    )},
  { title: 'Name',   dataIndex: 'name',   key: 'name' },
  { title: 'Branch', dataIndex: 'branch', key: 'branch' },
  { title: 'Sales',  dataIndex: 'sales',  key: 'sales',  render: fmt },
  { title: 'Deals',  dataIndex: 'deals',  key: 'deals' },
];

/* ─── Component ──────────────────────────────────────────────── */

const SuperAdminDashboard = () => {
  const [clubType, setClubType]     = useState('all');
  const [viewMode, setViewMode]     = useState<string | number>('Monthly');

  return (
    <div className="sad-page">

      {/* ── Filters ── */}
      <div className="sad-filters">
        <div className="sad-filters-left">
          <h2 className="sad-page-title">Super Admin Dashboard</h2>
          <Tag color="green" style={{ fontSize: 11 }}>Owner View</Tag>
        </div>
        <div className="sad-filters-right">
          <Select
            value={clubType}
            onChange={setClubType}
            style={{ width: 160 }}
            options={[
              { label: 'All Campuses',    value: 'all' },
              { label: 'Direct Only', value: 'company' },
              { label: 'Franchise',    value: 'franchise' },
            ]}
          />
          <Select
            defaultValue="all"
            style={{ width: 160 }}
            options={[
              { label: 'All Locations', value: 'all' },
              { label: 'Mumbai',        value: 'mumbai' },
              { label: 'Pune',          value: 'pune' },
            ]}
          />
          <RangePicker style={{ height: 36 }} />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="sad-stats-grid">
        <StatCard title="Total Revenue"    value="₹11.1L"  icon={<DollarOutlined />}  color="#6366f1" trend={{ value: 12, up: true }}  subtitle="This Month" />
        <StatCard title="Attendance Today"  value="3,842"   icon={<LoginOutlined />}   color="#10b981" trend={{ value: 8,  up: true }}  subtitle="Across all campuses" />
        <StatCard title="Active Students"   value="12,480"  icon={<TeamOutlined />}    color="#f59e0b" trend={{ value: 3,  up: true }}  subtitle="Total active" />
        <StatCard title="New Admissions"        value="284"     icon={<UserAddOutlined />} color="#ec4899" trend={{ value: 5,  up: false }} subtitle="This month" />
      </div>

      {/* ── Revenue Trend + Breakdown ── */}
      <div className="sad-charts-row">
        <div className="sad-chart-card sad-chart-wide">
          <div className="sad-chart-head">
            <span className="sad-chart-title">Revenue Trend</span>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={['Weekly', 'Monthly', 'Yearly']}
              size="small"
            />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueTrendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.25} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--sider-text)', fontSize: 11, opacity: 0.55 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fill: 'var(--sider-text)', fontSize: 10, opacity: 0.45 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--sider-text)' }} />
              <Area type="monotone" dataKey="TuitionFee" stroke="#6366f1" strokeWidth={2} fill="url(#gM)" dot={false} />
              <Area type="monotone" dataKey="AdmissionFee"         stroke="#10b981" strokeWidth={2} fill="url(#gP)" dot={false} />
              <Area type="monotone" dataKey="UniformsAndBooks"     stroke="#f59e0b" strokeWidth={2} fill="url(#gA)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="sad-chart-card">
          <div className="sad-chart-head">
            <span className="sad-chart-title">Revenue Breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueBreakdown} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.2} horizontal={false} />
              <XAxis type="number" tickFormatter={fmt} tick={{ fill: 'var(--sider-text)', fontSize: 10, opacity: 0.45 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--sider-text)', fontSize: 11, opacity: 0.65 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--muted)', borderRadius: 8, color: 'var(--sider-text)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {revenueBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Club Leaderboard ── */}
      <div className="sad-section">
        <div className="sad-section-head">
          <TrophyOutlined style={{ color: '#f59e0b' }} />
          <span>Campus Performance Leaderboard</span>
        </div>
        <Table
          columns={clubColumns}
          dataSource={clubLeaderboardData}
          pagination={false}
          size="small"
          className="sad-table"
        />
      </div>

      {/* ── Bottom Row ── */}
      <div className="sad-bottom-row">

        {/* Sales Leaderboard */}
        <div className="sad-section sad-section-flex">
          <div className="sad-section-head">
            <RiseOutlined style={{ color: '#6366f1' }} />
            <span>Sales Leaderboard</span>
          </div>
          <Table
            columns={salesColumns}
            dataSource={salesLeaderboardData}
            pagination={false}
            size="small"
            className="sad-table"
          />
        </div>

        {/* CRM Registrations + PT Utilization */}
        <div className="sad-side-col">

          {/* CRM Registrations */}
          <div className="sad-section">
            <div className="sad-section-head">
              <FileTextOutlined style={{ color: '#10b981' }} />
              <span>CRM Registrations</span>
            </div>
            <div className="sad-crm-list">
              {crmData.map(c => (
                <div key={c.source} className="sad-crm-item">
                  <span className="sad-crm-source">{c.source}</span>
                  <div className="sad-crm-bar-wrap">
                    <Progress
                      percent={Math.round((c.leads / 142) * 100)}
                      showInfo={false}
                      strokeColor={c.color}
                      trailColor="var(--hover-bg)"
                      size="small"
                    />
                  </div>
                  <span className="sad-crm-count" style={{ color: c.color }}>{c.leads}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Utilization */}
          <div className="sad-section">
            <div className="sad-section-head">
              <ShopOutlined style={{ color: '#ec4899' }} />
              <span>Teacher Utilization</span>
            </div>
            <div className="sad-util-list">
              {[
                { label: 'Andheri Campus', pct: 88, color: '#6366f1' },
                { label: 'Bandra Campus',  pct: 74, color: '#10b981' },
                { label: 'Powai Campus',   pct: 65, color: '#f59e0b' },
                { label: 'Thane Campus',   pct: 52, color: '#ec4899' },
              ].map(u => (
                <div key={u.label} className="sad-util-item">
                  <span className="sad-util-label">{u.label}</span>
                  <Progress
                    percent={u.pct}
                    strokeColor={u.color}
                    trailColor="var(--hover-bg)"
                    size="small"
                    format={p => <span style={{ color: 'var(--sider-text)', fontSize: 11 }}>{p}%</span>}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
