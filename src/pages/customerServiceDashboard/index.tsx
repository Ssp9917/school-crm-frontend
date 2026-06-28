import { Table, Tag, Rate, Progress, Badge } from 'antd';
import {
  CustomerServiceOutlined, CheckCircleOutlined, WarningOutlined,
  StarOutlined, PhoneOutlined, CalendarOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../../components/dashboards/StatCard';
import './styles.scss';

/* ─── Mock Data ───────────────────────────────────────────────── */

const ticketsData = [
  { key: '1', id: 'TKT-001', member: 'Arjun Sharma', issue: 'Teacher not assigned',     priority: 'high',   status: 'open',     time: '2h ago' },
  { key: '2', id: 'TKT-002', member: 'Sneha Patil',  issue: 'ID Card not printed',      priority: 'medium', status: 'open',     time: '3h ago' },
  { key: '3', id: 'TKT-003', member: 'Rohit Verma',  issue: 'Wrong billing in fee receipt', priority: 'high',   status: 'escalated',time: '5h ago' },
  { key: '4', id: 'TKT-004', member: 'Kavita Joshi', issue: 'Classroom AC not working',  priority: 'low',    status: 'resolved', time: '1h ago' },
  { key: '5', id: 'TKT-005', member: 'Manoj Singh',  issue: 'Fee installment request', priority: 'medium', status: 'open',     time: '6h ago' },
];

const bookingsData = [
  { key: '1', member: 'Priya Shah',    service: 'Computer Lab Slot', trainer: 'Rahul M.',  time: '11:00 AM', status: 'confirmed' },
  { key: '2', member: 'Vikram Nair',   service: 'Exam Re-evaluation', trainer: 'Pooja N.',  time: '12:30 PM', status: 'pending'   },
  { key: '3', member: 'Divya Kumar',   service: 'Parent-Teacher Meet',trainer: 'Kiran J.',  time: '02:00 PM', status: 'confirmed' },
  { key: '4', member: 'Suresh Rao',    service: 'Sports Class Practice', trainer: 'Amit S.',   time: '04:00 PM', status: 'confirmed' },
  { key: '5', member: 'Anita Gupta',   service: 'Lab Work Slot',     trainer: 'Rahul M.',  time: '05:00 PM', status: 'pending'   },
];

const trainerAssignment = [
  { key: '1', trainer: 'Kiran Jadhav', assigned: 12, pending: 2, capacity: 15, status: 'available' },
  { key: '2', trainer: 'Pooja Nair',   assigned: 14, pending: 1, capacity: 15, status: 'busy'      },
  { key: '3', trainer: 'Amit Sharma',  assigned: 10, pending: 0, capacity: 15, status: 'available' },
  { key: '4', trainer: 'Rahul Mehta',  assigned: 15, pending: 3, capacity: 15, status: 'overloaded'},
];

const slaData = [
  { name: 'Resolved',  value: 62, fill: '#22c55e' },
  { name: 'Pending',   value: 24, fill: '#f59e0b' },
  { name: 'Escalated', value: 14, fill: '#ef4444' },
];

const feedbackDist = [
  { name: '5★', value: 42, color: '#22c55e' },
  { name: '4★', value: 28, color: '#6366f1' },
  { name: '3★', value: 18, color: '#f59e0b' },
  { name: '2★', value: 8,  color: '#f97316' },
  { name: '1★', value: 4,  color: '#ef4444' },
];

const ticketColumns = [
  { title: 'ID',      dataIndex: 'id',       key: 'id',       width: 90  },
  { title: 'Student / Parent',  dataIndex: 'member',   key: 'member'               },
  { title: 'Issue',   dataIndex: 'issue',    key: 'issue'                },
  { title: 'Priority',dataIndex: 'priority', key: 'priority',
    render: (p: string) => <Tag color={p === 'high' ? 'red' : p === 'medium' ? 'orange' : 'default'}>{p.toUpperCase()}</Tag> },
  { title: 'Status',  dataIndex: 'status',   key: 'status',
    render: (s: string) => (
      <Tag color={s === 'resolved' ? 'green' : s === 'escalated' ? 'red' : 'blue'}>{s.toUpperCase()}</Tag>
    )},
  { title: 'Time', dataIndex: 'time', key: 'time',
    render: (t: string) => <span style={{ color: 'var(--muted)', fontSize: 11 }}>{t}</span> },
];

const bookingColumns = [
  { title: 'Student',  dataIndex: 'member',  key: 'member'  },
  { title: 'Service', dataIndex: 'service', key: 'service' },
  { title: 'Teacher', dataIndex: 'trainer', key: 'trainer' },
  { title: 'Time',    dataIndex: 'time',    key: 'time'    },
  { title: 'Status',  dataIndex: 'status',  key: 'status',
    render: (s: string) => <Tag color={s === 'confirmed' ? 'green' : 'gold'}>{s}</Tag> },
];

const trainerColumns = [
  { title: 'Teacher',   dataIndex: 'trainer',  key: 'trainer' },
  { title: 'Classes Assigned',  dataIndex: 'assigned', key: 'assigned' },
  { title: 'Pending',   dataIndex: 'pending',  key: 'pending',
    render: (v: number) => <span style={{ color: v > 0 ? '#f59e0b' : 'var(--muted)' }}>{v}</span> },
  { title: 'Status',    dataIndex: 'status',   key: 'status',
    render: (s: string) => (
      <Tag color={s === 'available' ? 'green' : s === 'busy' ? 'orange' : 'red'}>{s.toUpperCase()}</Tag>
    )},
];

/* ─── Component ───────────────────────────────────────────────── */

const CustomerServiceDashboard = () => (
  <div className="csd-page">

    {/* ── Header ── */}
    <div className="csd-header">
      <div className="csd-header-left">
        <CustomerServiceOutlined style={{ color: 'var(--accent)', fontSize: 20 }} />
        <h2 className="csd-title">Customer Service Dashboard</h2>
      </div>
      <div className="csd-header-right">
        <Badge count={3} size="small" style={{ backgroundColor: '#ef4444' }}>
          <span className="csd-badge-label">Escalated</span>
        </Badge>
      </div>
    </div>

    {/* ── KPI Cards ── */}
    <div className="csd-stats-grid">
      <StatCard title="Open Tickets"    value="18"     icon={<WarningOutlined />}        color="#ef4444" subtitle="3 escalated" />
      <StatCard title="Resolved Today"  value="24"     icon={<CheckCircleOutlined />}    color="#22c55e" trend={{ value: 15, up: true }} />
      <StatCard title="Avg. Rating"     value="4.2★"   icon={<StarOutlined />}           color="#f59e0b" subtitle="Based on 86 ratings" />
      <StatCard title="SLA Compliance"  value="88%"    icon={<ClockCircleOutlined />}    color="#6366f1" trend={{ value: 4, up: true }} />
    </div>

    {/* ── Charts Row ── */}
    <div className="csd-charts-row">

      {/* Ticket Status Pie */}
      <div className="csd-chart-card">
        <div className="csd-chart-head">
          <span className="csd-chart-title">Ticket Status Breakdown</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={slaData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}
              label={({ percent, name }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {slaData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--muted)', borderRadius: 8, color: 'var(--sider-text)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Feedback Distribution */}
      <div className="csd-chart-card">
        <div className="csd-chart-head">
          <span className="csd-chart-title">Student / Parent Feedback</span>
        </div>
        <div className="csd-feedback-dist">
          {feedbackDist.map(f => (
            <div key={f.name} className="csd-fb-row">
              <span className="csd-fb-label" style={{ color: f.color }}>{f.name}</span>
              <Progress
                percent={f.value}
                strokeColor={f.color}
                trailColor="var(--hover-bg)"
                showInfo={false}
                size="small"
                style={{ flex: 1 }}
              />
              <span className="csd-fb-count">{f.value}</span>
            </div>
          ))}
          <div className="csd-rating-avg">
            <Rate disabled defaultValue={4} style={{ fontSize: 14, color: '#f59e0b' }} />
            <span style={{ color: 'var(--sider-text)', fontSize: 13, marginLeft: 8 }}>4.2 / 5</span>
          </div>
        </div>
      </div>

      {/* SLA Tracking */}
      <div className="csd-chart-card">
        <div className="csd-chart-head">
          <span className="csd-chart-title">SLA Performance</span>
        </div>
        <div className="csd-sla-list">
          {[
            { label: 'Resolved on time', value: 88, color: '#22c55e' },
            { label: 'Delayed',          value: 8,  color: '#f59e0b' },
            { label: 'Missed SLA',       value: 4,  color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="csd-sla-item">
              <div className="csd-sla-row">
                <span className="csd-sla-label">{s.label}</span>
                <span style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>{s.value}%</span>
              </div>
              <Progress percent={s.value} strokeColor={s.color} trailColor="var(--hover-bg)" showInfo={false} size="small" />
            </div>
          ))}
          <div className="csd-comm-summary">
            <div className="csd-comm-item">
              <PhoneOutlined style={{ color: '#6366f1' }} />
              <span>Call Logs: <strong>34</strong></span>
            </div>
            <div className="csd-comm-item">
              <span>💬 WhatsApp: <strong>87</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Open Tickets Table ── */}
    <div className="csd-section csd-mt">
      <div className="csd-section-head">
        <WarningOutlined style={{ color: '#ef4444' }} />
        <span>Open Tickets</span>
        <Tag color="red" style={{ marginLeft: 'auto' }}>18 Open</Tag>
      </div>
      <Table columns={ticketColumns} dataSource={ticketsData} pagination={false} size="small" className="csd-table" />
    </div>

    {/* ── Bottom Row ── */}
    <div className="csd-bottom-row csd-mt">

      {/* Upcoming Bookings */}
      <div className="csd-section">
        <div className="csd-section-head">
          <CalendarOutlined style={{ color: '#6366f1' }} />
          <span>Upcoming Appointments Today</span>
        </div>
        <Table columns={bookingColumns} dataSource={bookingsData} pagination={false} size="small" className="csd-table" />
      </div>

      {/* Trainer Assignment */}
      <div className="csd-section">
        <div className="csd-section-head">
          <CustomerServiceOutlined style={{ color: '#10b981' }} />
          <span>Teacher Workload & Assignment</span>
        </div>
        <Table columns={trainerColumns} dataSource={trainerAssignment} pagination={false} size="small" className="csd-table" />
      </div>
    </div>
  </div>
);

export default CustomerServiceDashboard;
