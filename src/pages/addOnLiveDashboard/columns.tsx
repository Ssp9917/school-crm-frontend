import { Tag, Image, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import TimerColumn from './TimerColumn';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface LiveDashboardRecord {
  sNo?: number;
  activeSeconds?: number;
  remainingSeconds?: number;
  status?: string;
  branch?: string;
  profile?: string;
  memberId?: string;
  name?: string;
  phoneNumber?: string;
  serviceType?: string;
  type?: string;
  planInfo?: string;
  trainer?: string;
  startDate?: string;
  endedAt?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const getStatusColor = (status: string | undefined): string => {
  switch (status) {
    case 'in_progress': return 'blue';
    case 'paused':      return 'orange';
    case 'completed':   return 'green';
    case 'pending':     return 'default';
    default:            return 'default';
  }
};

const getStatusText = (status: string | undefined): string => {
  switch (status) {
    case 'in_progress': return 'Live';
    case 'paused':      return 'Paused';
    case 'completed':   return 'Completed';
    case 'pending':     return 'Pending';
    default:            return status ?? '';
  }
};

/* ─── Columns ────────────────────────────────────────────────────────── */

export const getLiveDashboardColumns = (hasPermission: (key: string) => boolean = () => true) => [
  {
    title:     'S.No',
    dataIndex: 'sNo',
    key:       'sno',
    width:     70,
    align:     'center' as const,
    fixed:     'left' as const,
  },
  {
    title:     'Timer',
    dataIndex: 'timer',
    key:       'timer',
    width:     150,
    render:    (_: unknown, record: LiveDashboardRecord) => (
      <TimerColumn
        activeSeconds={record.activeSeconds ?? 0}
        remainingSeconds={record.remainingSeconds ?? 0}
        maxDurationSeconds={3600}
        status={record.status}
      />
    ),
  },
  {
    title:     'Branch',
    dataIndex: 'branch',
    key:       'branch',
    width:     180,
    render:    (text: string) => text || '-',
  },
  {
    title:     'Profile',
    dataIndex: 'profile',
    key:       'profile',
    width:     80,
    align:     'center' as const,
    render:    (photo: string, record: LiveDashboardRecord) => {
      const img = photo
        ? <Image src={photo} alt="Profile" width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} preview={false} />
        : <Avatar size={40} icon={<UserOutlined />} />;
      return record.memberId
        ? <Link to={`/user-detail/${record.memberId}/attendance`} style={{ cursor: 'pointer' }}>{img}</Link>
        : img;
    },
  },
  {
    title:     'Name',
    dataIndex: 'name',
    key:       'name',
    width:     150,
    render:    (text: string, record: LiveDashboardRecord) =>
      record.memberId && hasPermission('9-10-view-profile') ? (
        <Link to={`/user-detail/${record.memberId}/addon-service`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {text || '-'}
        </Link>
      ) : (text || '-'),
  },
  {
    title:     'Phone Number',
    dataIndex: 'phoneNumber',
    key:       'phoneNumber',
    width:     130,
    render:    (text: string) => text || '-',
  },
  {
    title:     'Service Type',
    dataIndex: 'serviceType',
    key:       'serviceType',
    width:     150,
    render:    (text: string) => {
      if (!text) return '-';
      return <span style={{ textTransform: 'capitalize' }}>{text.replace(/_/g, ' ')}</span>;
    },
  },
  {
    title:     'Type',
    dataIndex: 'type',
    key:       'type',
    width:     130,
    align:     'center' as const,
    render:    (type: string) => (
      <Tag color={type === 'complimentary' ? 'green' : 'blue'} style={{ textTransform: 'capitalize' }}>
        {type || 'N/A'}
      </Tag>
    ),
  },
  {
    title:     'Plan',
    dataIndex: 'planInfo',
    key:       'planInfo',
    width:     180,
    render:    (text: string) => text || '-',
  },
  {
    title:     'Trainer',
    dataIndex: 'trainer',
    key:       'trainer',
    width:     150,
    render:    (text: string) => text || '-',
  },
  {
    title:     'Status',
    dataIndex: 'status',
    key:       'status',
    width:     120,
    render:    (status: string) => (
      <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
    ),
  },
  {
    title:     'Session Date',
    dataIndex: 'startDate',
    key:       'startDate',
    width:     160,
    render:    (text: string, record: LiveDashboardRecord) => {
      if (!text) return '-';
      const d = new Date(text);
      if (isNaN(d.getTime())) return text;
      const date    = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const time    = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const endedAt = record.endedAt ? new Date(record.endedAt) : null;
      const endTime = endedAt && !isNaN(endedAt.getTime())
        ? endedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : null;
      return (
        <div>
          <div>{date}</div>
          <div style={{ fontSize: 12, color: 'var(--placeholder)' }}>
            {time}{endTime ? <span style={{ color: 'var(--muted)' }}> ({endTime})</span> : null}
          </div>
        </div>
      );
    },
  },
];
