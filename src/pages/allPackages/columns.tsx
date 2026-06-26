import { Tag, Button, Dropdown, Tooltip, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { NavigateFunction } from 'react-router-dom';
import { EditPackageRoute } from '../../routes/routepath';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface PackageRecord {
  _id?:         string;
  name?:        string;
  type?:        string;
  pricing?:     number;
  numberOfDays?: number;
  freezable?:   boolean;
  status?:      string;
  branchIds?:   { name?: string }[];
  branchId?:    { name?: string };
}

/* ─── Columns factory ────────────────────────────────────────────────── */

export const getPackageColumns = (
  handleDelete: (record: PackageRecord) => void,
  navigate:     NavigateFunction,
  canEdit      = false,
  canDelete    = false,
  handleToggle?: (record: PackageRecord) => void,
  canToggle    = false,
  togglingId?: string | null,
) => [
  {
    title:     'Frequency',
    dataIndex: 'frequency',
    key:       'packageType',
    width:     150,
    render:    (freq: string) =>
      freq ? freq.charAt(0).toUpperCase() + freq.slice(1).replace('_', ' ') : '-',
  },
  {
    title: 'Branch Name',
    key:   'branchName',
    width: 200,
    render: (_: unknown, record: PackageRecord) => {
      const branchIdsArray = (record as any).branchIds || [];
      if (branchIdsArray.length > 0) {
        if (branchIdsArray.length === 1) return branchIdsArray[0]?.name || '-';
        const branchNames = branchIdsArray.map((b: any) => b?.name).filter(Boolean) as string[];
        return (
          <Tooltip
            title={<div>{branchNames.map((n, i) => <div key={i}>{n}</div>)}</div>}
            placement="topLeft"
          >
            <span style={{ cursor: 'pointer' }}>{branchNames[0]} (+{branchNames.length - 1} more)</span>
          </Tooltip>
        );
      }
      return '-';
    },
  },
  {
    title:     'Fee Structure Name',
    dataIndex: 'name',
    key:       'packageName',
    width:     200,
  },
  {
    title:     'Amount(₹)',
    dataIndex: 'amount',
    key:       'pricing',
    width:     150,
    render:    (amount: number) => amount ? `₹${amount}` : '-',
  },
  {
    title:     'Class',
    dataIndex: ['classId', 'name'],
    key:       'numberOfDays',
    width:     130,
    render:    (className: any, record: any) => className || record.classId?.name || '-',
  },

  {
    title:     'Status',
    dataIndex: 'status',
    key:       'status',
    width:     100,
    align:     'center' as const,
    render:    (status: string) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status === 'active' ? 'ACTIVE' : 'INACTIVE'}
      </Tag>
    ),
  },
  ...(canToggle ? [{
    title:  'Toggle',
    key:    'toggle',
    width:  80,
    align:  'center' as const,
    render: (_: unknown, record: PackageRecord) => (
      <Switch
      size='small'
        checked={record.status === 'active'}
        loading={togglingId === record._id}
        onChange={() => handleToggle?.(record)}
        style={{ backgroundColor: record.status === 'active' ? '#52c41a' : undefined }}
      />
    ),
  }] : []),
  {
    title:  'Actions',
    key:    'actions',
    width:  80,
    align:  'center' as const,
    render: (_: unknown, record: PackageRecord) => {
      const menuItems = [
        ...(canEdit ? [{
          key:     'edit',
          label:   'Edit',
          icon:    <EditOutlined />,
          onClick: () => navigate(`${EditPackageRoute}/${record._id}`),
        }] : []),
        ...(canDelete ? [{
          key:     'delete',
          label:   'Delete',
          icon:    <DeleteOutlined />,
          danger:  true,
          onClick: () => handleDelete(record),
        }] : []),
      ];
      if (menuItems.length === 0) return null;
      return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
        </Dropdown>
      );
    },
  },
];
