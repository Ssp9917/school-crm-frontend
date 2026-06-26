import { Table, Progress, Tag, Badge } from 'antd';
import {
  DollarOutlined, LoginOutlined, TeamOutlined, ExclamationCircleOutlined,
  CalendarOutlined, ToolOutlined, BellOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/dashboards/StatCard';
import './styles.scss';

/* ─── Mock Data ───────────────────────────────────────────────── */

const renewalsData = [
  { key: '1', member: 'Arjun Sharma',  plan: '6 Month',   expiry: '2026-06-14', amount: 12000, status: 'due'    },
  { key: '2', member: 'Sneha Patil',   plan: '1 Month',   expiry: '2026-06-15', amount: 2500,  status: 'due'    },
  { key: '3', member: 'Rohit Verma',   plan: 'Yearly',    expiry: '2026-06-18', amount: 18000, status: 'upcoming'},
  { key: '4', member: 'Kavita Joshi',  plan: '3 Month',   expiry: '2026-06-20', amount: 7000,  status: 'upcoming'},
  { key: '5', member: 'Manoj Singh',   plan: '1 Month',   expiry: '2026-06-22', amount: 2500,  status: 'upcoming'},
];

const ptSessionsData = [
  { key: '1', trainer: 'Kiran Jadhav', time: '08:00 AM', client: 'Anil Kapoor',   type: 'PT',      status: 'confirmed' },
  { key: '2', trainer: 'Pooja Nair',   time: '09:30 AM', client: 'Riya Mehta',    type: 'Pilates', status: 'confirmed' },
  { key: '3', trainer: 'Amit Sharma',  time: '11:00 AM', client: 'Suresh Yadav',  type: 'EMS',     status: 'pending'   },
  { key: '4', trainer: 'Kiran Jadhav', time: '02:00 PM', client: 'Divya Krishnan',type: 'PT',      status: 'confirmed' },
];

const leadsData = [
  { key: '1', name: 'Vishal Tiwari', source: 'Walk-in',  since: '2 days', status: 'warm',   followUp: 'Today'    },
  { key: '2', name: 'Meena Rawat',   source: 'Website',  since: '3 days', status: 'cold',   followUp: 'Tomorrow' },
  { key: '3', name: 'Suraj Gupta',   source: 'Referral', since: '1 day',  status: 'hot',    followUp: 'Today'    },
  { key: '4', name: 'Alisha Khan',   source: 'Walk-in',  since: '5 days', status: 'warm',   followUp: 'Jun 15'   },
];

const equipmentData = [
  { key: '1', equipment: 'Treadmill #3',    issue: 'Belt worn out',      priority: 'high',   due: 'Today'    },
  { key: '2', equipment: 'Smith Machine',   issue: 'Cable fraying',      priority: 'medium', due: 'Jun 14'   },
  { key: '3', equipment: 'AC Unit - Zone B',issue: 'Cooling reduced',    priority: 'high',   due: 'Jun 13'   },
  { key: '4', equipment: 'Leg Press #2',    issue: 'Routine maintenance', priority: 'low',   due: 'Jun 18'   },
];

const renewalColumns = [
  { title: 'Member',  dataIndex: 'member',  key: 'member'  },
  { title: 'Plan',    dataIndex: 'plan',    key: 'plan'    },
  { title: 'Expiry',  dataIndex: 'expiry',  key: 'expiry'  },
  { title: 'Amount',  dataIndex: 'amount',  key: 'amount',
    render: (v: number) => `₹${v.toLocaleString('en-IN')}` },
  { title: 'Status',  dataIndex: 'status',  key: 'status',
    render: (s: string) => <Tag color={s === 'due' ? 'red' : 'orange'}>{s.toUpperCase()}</Tag> },
];

const ptColumns = [
  { title: 'Time',    dataIndex: 'time',    key: 'time'    },
  { title: 'Trainer', dataIndex: 'trainer', key: 'trainer' },
  { title: 'Client',  dataIndex: 'client',  key: 'client'  },
  { title: 'Type',    dataIndex: 'type',    key: 'type',
    render: (t: string) => <Tag color="blue">{t}</Tag> },
  { title: 'Status',  dataIndex: 'status',  key: 'status',
    render: (s: string) => <Tag color={s === 'confirmed' ? 'green' : 'gold'}>{s}</Tag> },
];

const leadColumns = [
  { title: 'Name',   dataIndex: 'name',     key: 'name'     },
  { title: 'Source', dataIndex: 'source',   key: 'source'   },
  { title: 'Status', dataIndex: 'status',   key: 'status',
    render: (s: string) => (
      <Tag color={s === 'hot' ? 'red' : s === 'warm' ? 'orange' : 'default'}>
        {s.toUpperCase()}
      </Tag>
    )},
  { title: 'Follow-up', dataIndex: 'followUp', key: 'followUp',
    render: (v: string) => <span style={{ color: v === 'Today' ? '#ef4444' : 'var(--sider-text)' }}>{v}</span> },
];

const equipColumns = [
  { title: 'Equipment',  dataIndex: 'equipment', key: 'equipment' },
  { title: 'Issue',      dataIndex: 'issue',     key: 'issue'     },
  { title: 'Priority',   dataIndex: 'priority',  key: 'priority',
    render: (p: string) => (
      <Tag color={p === 'high' ? 'red' : p === 'medium' ? 'orange' : 'default'}>{p.toUpperCase()}</Tag>
    )},
  { title: 'Due', dataIndex: 'due', key: 'due',
    render: (v: string) => <span style={{ color: v === 'Today' ? '#ef4444' : 'var(--sider-text)' }}>{v}</span> },
];

/* ─── Component ───────────────────────────────────────────────── */

const ClubManagerDashboard = () => (
  <div className="cmd-page">

    {/* ── Header ── */}
    <div className="cmd-header">
      <div className="cmd-header-left">
        <CalendarOutlined style={{ color: 'var(--accent)', fontSize: 20 }} />
        <h2 className="cmd-title">Club Manager Dashboard</h2>
        <Tag color="blue">Today — Wed, 11 Jun 2026</Tag>
      </div>
      <div className="cmd-header-right">
        <Badge count={3} size="small">
          <BellOutlined style={{ fontSize: 20, color: 'var(--sider-text)' }} />
        </Badge>
      </div>
    </div>

    {/* ── KPI Cards ── */}
    <div className="cmd-stats-grid">
      <StatCard title="Daily Revenue"    value="₹38,400"  icon={<DollarOutlined />}         color="#6366f1" trend={{ value: 8, up: true  }} subtitle="vs yesterday" />
      <StatCard title="Check-ins Today"  value="142"      icon={<LoginOutlined />}           color="#10b981" trend={{ value: 6, up: true  }} subtitle="By 2 PM" />
      <StatCard title="Staff Present"    value="11 / 14"  icon={<TeamOutlined />}            color="#f59e0b" subtitle="3 on leave" />
      <StatCard title="Pending Leads"    value="8"        icon={<ExclamationCircleOutlined/>} color="#ec4899" subtitle="4 due today" />
    </div>

    {/* ── Targets ── */}
    <div className="cmd-targets-row">
      <div className="cmd-target-card">
        <div className="cmd-target-head">
          <DollarOutlined style={{ color: '#6366f1' }} />
          <span>Sales Target — June</span>
          <span className="cmd-target-pct" style={{ color: '#6366f1' }}>74%</span>
        </div>
        <Progress percent={74} strokeColor="#6366f1" trailColor="var(--hover-bg)" showInfo={false} />
        <div className="cmd-target-sub">
          <span>₹5.5L achieved</span>
          <span>Target: ₹7.5L</span>
        </div>
      </div>

      <div className="cmd-target-card">
        <div className="cmd-target-head">
          <TeamOutlined style={{ color: '#10b981' }} />
          <span>PT Sessions — June</span>
          <span className="cmd-target-pct" style={{ color: '#10b981' }}>68%</span>
        </div>
        <Progress percent={68} strokeColor="#10b981" trailColor="var(--hover-bg)" showInfo={false} />
        <div className="cmd-target-sub">
          <span>204 sessions done</span>
          <span>Target: 300</span>
        </div>
      </div>

      <div className="cmd-target-card">
        <div className="cmd-target-head">
          <LoginOutlined style={{ color: '#f59e0b' }} />
          <span>Check-in Target — Today</span>
          <span className="cmd-target-pct" style={{ color: '#f59e0b' }}>63%</span>
        </div>
        <Progress percent={63} strokeColor="#f59e0b" trailColor="var(--hover-bg)" showInfo={false} />
        <div className="cmd-target-sub">
          <span>142 check-ins</span>
          <span>Target: 225</span>
        </div>
      </div>
    </div>

    {/* ── Tables Row 1 ── */}
    <div className="cmd-tables-row">
      <div className="cmd-section">
        <div className="cmd-section-head">
          <BellOutlined style={{ color: '#ef4444' }} />
          <span>Upcoming Renewals</span>
          <Tag color="red" style={{ marginLeft: 'auto' }}>2 Due Soon</Tag>
        </div>
        <Table columns={renewalColumns} dataSource={renewalsData} pagination={false} size="small" className="cmd-table" />
      </div>

      <div className="cmd-section">
        <div className="cmd-section-head">
          <TeamOutlined style={{ color: '#6366f1' }} />
          <span>PT Sessions Today</span>
        </div>
        <Table columns={ptColumns} dataSource={ptSessionsData} pagination={false} size="small" className="cmd-table" />
      </div>
    </div>

    {/* ── Tables Row 2 ── */}
    <div className="cmd-tables-row cmd-mt">
      <div className="cmd-section">
        <div className="cmd-section-head">
          <ExclamationCircleOutlined style={{ color: '#f59e0b' }} />
          <span>Pending Leads + Follow-ups</span>
        </div>
        <Table columns={leadColumns} dataSource={leadsData} pagination={false} size="small" className="cmd-table" />
      </div>

      <div className="cmd-section">
        <div className="cmd-section-head">
          <ToolOutlined style={{ color: '#ec4899' }} />
          <span>Equipment / Maintenance</span>
        </div>
        <Table columns={equipColumns} dataSource={equipmentData} pagination={false} size="small" className="cmd-table" />
      </div>
    </div>
  </div>
);

export default ClubManagerDashboard;
