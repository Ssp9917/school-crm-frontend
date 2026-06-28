import { Table, Tag, Progress, Badge } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell,
} from 'recharts';
import {
  DollarOutlined, TrophyOutlined, RiseOutlined, FireOutlined,
  UserAddOutlined, CalendarOutlined, PercentageOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/dashboards/StatCard';
import './styles.scss';

/* ─── Mock Data ───────────────────────────────────────────────── */

const membershipsSoldData = [
  { week: 'W1', Sold: 18 },
  { week: 'W2', Sold: 24 },
  { week: 'W3', Sold: 19 },
  { week: 'W4', Sold: 31 },
];

const funnelData = [
  { name: 'Cold',   value: 280, fill: '#94a3b8' },
  { name: 'Warm',   value: 164, fill: '#f59e0b' },
  { name: 'Hot',    value: 88,  fill: '#f97316' },
  { name: 'Closed', value: 52,  fill: '#22c55e' },
];

const leaderboardData = [
  { key: '1', rank: 1, name: 'Rohan Mehta',  branch: 'Andheri', thisMonth: 142000, deals: 18, incentive: 14200 },
  { key: '2', rank: 2, name: 'Priya Shah',   branch: 'Bandra',  thisMonth: 128000, deals: 15, incentive: 12800 },
  { key: '3', rank: 3, name: 'Amit Kumar',   branch: 'Powai',   thisMonth: 115000, deals: 14, incentive: 11500 },
  { key: '4', rank: 4, name: 'Neha Gupta',   branch: 'Thane',   thisMonth: 98000,  deals: 12, incentive: 9800  },
  { key: '5', rank: 5, name: 'Rahul Verma',  branch: 'Pune',    thisMonth: 87000,  deals: 10, incentive: 8700  },
];

const followUpsData = [
  { key: '1', lead: 'Vishal T.',  phone: '+91 98765 43210', status: 'hot',  due: 'Today',    type: 'Call'      },
  { key: '2', lead: 'Meena R.',   phone: '+91 97654 32109', status: 'warm', due: 'Today',    type: 'WhatsApp'  },
  { key: '3', lead: 'Suraj G.',   phone: '+91 96543 21098', status: 'hot',  due: 'Today',    type: 'Call'      },
  { key: '4', lead: 'Alisha K.',  phone: '+91 95432 10987', status: 'cold', due: 'Missed',   type: 'Visit'     },
  { key: '5', lead: 'Ravi P.',    phone: '+91 94321 09876', status: 'warm', due: 'Tomorrow', type: 'WhatsApp'  },
];

const clientTypeData = [
  { type: 'New Admission',     count: 52, color: '#6366f1' },
  { type: 'Re-enrollment', count: 38, color: '#10b981' },
  { type: 'Referral',count: 24, color: '#f59e0b' },
  { type: 'Transfer-in', count: 12, color: '#ec4899' },
];

const lbColumns = [
  { title: 'Rank',  dataIndex: 'rank', key: 'rank', width: 60,
    render: (r: number) => (
      <span style={{ color: r <= 3 ? '#f59e0b' : 'var(--muted)', fontWeight: 700, fontSize: 16 }}>
        {r <= 3 ? ['🥇','🥈','🥉'][r-1] : r}
      </span>
    )},
  { title: 'Name',   dataIndex: 'name',   key: 'name' },
  { title: 'Branch', dataIndex: 'branch', key: 'branch',
    render: (b: string) => <Tag color="blue">{b}</Tag> },
  { title: 'Sales',  dataIndex: 'thisMonth', key: 'thisMonth',
    render: (v: number) => <span style={{ color: '#22c55e', fontWeight: 600 }}>₹{(v/1000).toFixed(0)}K</span> },
  { title: 'Deals',  dataIndex: 'deals', key: 'deals' },
  { title: 'Incentive', dataIndex: 'incentive', key: 'incentive',
    render: (v: number) => <span style={{ color: '#f59e0b' }}>₹{(v/1000).toFixed(1)}K</span> },
];

const followUpColumns = [
  { title: 'Lead',   dataIndex: 'lead',   key: 'lead'   },
  { title: 'Status', dataIndex: 'status', key: 'status',
    render: (s: string) => <Tag color={s === 'hot' ? 'red' : s === 'warm' ? 'orange' : 'default'}>{s.toUpperCase()}</Tag> },
  { title: 'Channel',dataIndex: 'type',   key: 'type',
    render: (t: string) => <Tag color="blue">{t}</Tag> },
  { title: 'Due',    dataIndex: 'due',    key: 'due',
    render: (v: string) => (
      <span style={{ color: v === 'Missed' ? '#ef4444' : v === 'Today' ? '#f59e0b' : 'var(--sider-text)', fontWeight: v === 'Missed' ? 600 : 400 }}>
        {v === 'Missed' ? '⚠ Missed' : v}
      </span>
    )},
];

/* ─── Component ───────────────────────────────────────────────── */

const SalesDashboard = () => (
  <div className="sld-page">

    {/* ── Header ── */}
    <div className="sld-header">
      <div className="sld-header-left">
        <TrophyOutlined style={{ color: 'var(--accent)', fontSize: 20 }} />
        <h2 className="sld-title">Sales Team Dashboard</h2>
        <Tag color="orange">June 2026</Tag>
      </div>
      <div className="sld-header-right">
        <Badge count={4} size="small" style={{ backgroundColor: '#ef4444' }}>
          <span className="sld-badge-label">Follow-ups Due</span>
        </Badge>
      </div>
    </div>

    {/* ── KPI Cards ── */}
    <div className="sld-stats-grid">
      <StatCard title="Monthly Target"   value="₹7.5L"  icon={<DollarOutlined />}     color="#6366f1" subtitle="June target" />
      <StatCard title="Admissions Closed" value="₹5.5L"  icon={<RiseOutlined />}        color="#22c55e" trend={{ value: 11, up: true }} subtitle="74% of target" />
      <StatCard title="Incentive Earned" value="₹52K"   icon={<FireOutlined />}        color="#f59e0b" trend={{ value: 8,  up: true }} subtitle="This month" />
      <StatCard title="Conversion Rate"  value="18.6%"  icon={<PercentageOutlined />}  color="#ec4899" trend={{ value: 2,  up: true }} subtitle="Leads to Student" />
    </div>

    {/* ── Target Progress ── */}
    <div className="sld-target-card">
      <div className="sld-target-info">
        <span className="sld-target-label">Monthly Admission Target Progress</span>
        <span className="sld-target-val">₹5.5L / ₹7.5L</span>
      </div>
      <Progress percent={74} strokeColor={{ '0%': '#6366f1', '100%': '#22c55e' }} trailColor="var(--hover-bg)" showInfo={false} strokeWidth={10} />
      <div className="sld-target-sub">
        <span>₹2L remaining</span>
        <span style={{ color: '#22c55e' }}>74% achieved</span>
        <span>19 days left</span>
      </div>
    </div>

    {/* ── Charts Row ── */}
    <div className="sld-charts-row">

      {/* Lead Funnel */}
      <div className="sld-chart-card">
        <div className="sld-chart-head">
          <span className="sld-chart-title">Lead Funnel</span>
          <UserAddOutlined style={{ color: 'var(--muted)' }} />
        </div>
        <div className="sld-funnel">
          {funnelData.map((f, i) => {
            const pct = Math.round((f.value / funnelData[0].value) * 100);
            return (
              <div key={f.name} className="sld-funnel-stage">
                <div
                  className="sld-funnel-bar"
                  style={{ width: `${pct}%`, background: f.fill, minWidth: 40 }}
                />
                <span className="sld-funnel-label">{f.name}</span>
                <span className="sld-funnel-count" style={{ color: f.fill }}>{f.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Memberships Sold */}
      <div className="sld-chart-card sld-chart-wide">
        <div className="sld-chart-head">
          <span className="sld-chart-title">Admissions Confirmed — June (Weekly)</span>
          <CalendarOutlined style={{ color: 'var(--muted)' }} />
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={membershipsSoldData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" strokeOpacity={0.25} vertical={false} />
            <XAxis dataKey="week" tick={{ fill: 'var(--sider-text)', fontSize: 12, opacity: 0.6 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--sider-text)', fontSize: 10, opacity: 0.45 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--muted)', borderRadius: 8, color: 'var(--sider-text)' }} />
            <Bar dataKey="Sold" radius={[6, 6, 0, 0]} barSize={32}>
              {membershipsSoldData.map((_, i) => (
                <Cell key={i} fill={i === 3 ? '#22c55e' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Client Type */}
      <div className="sld-chart-card">
        <div className="sld-chart-head">
          <span className="sld-chart-title">Registration Breakdown</span>
        </div>
        <div className="sld-client-type">
          {clientTypeData.map(c => (
            <div key={c.type} className="sld-ct-row">
              <span className="sld-ct-dot" style={{ background: c.color }} />
              <span className="sld-ct-label">{c.type}</span>
              <Progress
                percent={Math.round((c.count / 126) * 100)}
                strokeColor={c.color}
                trailColor="var(--hover-bg)"
                showInfo={false}
                size="small"
                style={{ flex: 1 }}
              />
              <span className="sld-ct-count" style={{ color: c.color }}>{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Bottom Row ── */}
    <div className="sld-bottom-row">

      {/* Real-Time Leaderboard */}
      <div className="sld-section">
        <div className="sld-section-head">
          <TrophyOutlined style={{ color: '#f59e0b' }} />
          <span>Real-Time Admissions Leaderboard</span>
          <span className="sld-live-dot" />
          <span style={{ fontSize: 11, color: '#22c55e' }}>LIVE</span>
        </div>
        <Table columns={lbColumns} dataSource={leaderboardData} pagination={false} size="small" className="sld-table" />
      </div>

      {/* Follow-up Reminders */}
      <div className="sld-section">
        <div className="sld-section-head">
          <CalendarOutlined style={{ color: '#ef4444' }} />
          <span>Follow-up Reminders</span>
          <Tag color="red" style={{ marginLeft: 'auto' }}>4 Due Today</Tag>
        </div>
        <Table columns={followUpColumns} dataSource={followUpsData} pagination={false} size="small" className="sld-table" />
      </div>
    </div>
  </div>
);

export default SalesDashboard;
