import { Image, Button, Dropdown, Switch, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, KeyOutlined } from '@ant-design/icons';
import { NavigateFunction } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { EditEmployeeRoute, EmployeeDetailAttendanceRoute } from '../../routes/routepath';
import BadgeCheck from '../../components/badgeCheck';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface EmployeeRecord {
  _id?:            string;
  id?:             string;
  name?:           string;
  email?:          string;
  designation?:    string;
  phoneNumber?:    string;
  branches?:       { name?: string; _id?: string }[];
  profile?:        string;
  status?:         string;
  view?:           string;
  actions?:        string;
  isVerified?:     boolean;
  verifiedByName?: string | null;
}

/* ─── Columns ────────────────────────────────────────────────────────── */

export const getEmployeeColumns = (
  handleView:           (record: EmployeeRecord) => void,
  handleEdit:           (record: EmployeeRecord) => void,
  handleDelete:         (record: EmployeeRecord) => void,
  handleChangePassword: (record: EmployeeRecord) => void,
  navigate:             NavigateFunction,
  handleStatusToggle:   (record: EmployeeRecord, checked: boolean) => void,
  statusLoading:        string | null,
  canEdit           = true,
  canDelete         = true,
  canChangePassword = true,
  canStatusToggle   = true,
  canView           = true,
  canVerify         = false,
  canUnverify       = false,
  handleVerify?:      (record: EmployeeRecord) => void,
  handleUnverify?:    (record: EmployeeRecord) => void,
) => {
  const hasAnyAction = canEdit || canDelete || canChangePassword || canVerify || canUnverify;

  return [
    {
      title:     'Name',
      dataIndex: 'name',
      key:       'name',
      width:     150,
      render:    (name: string, record: EmployeeRecord) => {
        const display = name ? name.charAt(0).toUpperCase() + name.slice(1) : '-';
        const badge = (
          <Tooltip
            title={record.isVerified ? `Verified by ${record.verifiedByName || '—'}` : 'Not verified'}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <BadgeCheck size={15} verified={!!record.isVerified} />
            </span>
          </Tooltip>
        );
        return canView ? (
          <Link to={`/employee-detail/${record._id}/${EmployeeDetailAttendanceRoute}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>{display}</span>
            {badge}
          </Link>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>{display}</span>
            {badge}
          </span>
        );
      },
    },
    {
      title:     'Email',
      dataIndex: 'email',
      key:       'email',
      width:     200,
    },
    {
      title:     'Role',
      dataIndex: 'designation',
      key:       'designation',
      width:     150,
      render:    (designation: string) => designation || '-',
    },
    {
      title:     'Phone Number',
      dataIndex: 'phoneNumber',
      key:       'phoneNumber',
      width:     130,
    },
    {
      title:     'Branch Name',
      dataIndex: 'branches',
      key:       'branchName',
      width:     150,
      render:    (branches: { name?: string }[]) => {
        if (!Array.isArray(branches) || branches.length === 0) return '-';
        const firstBranch    = branches[0]?.name || '-';
        const remainingCount = branches.length - 1;
        if (remainingCount > 0) {
          return (
            <Tooltip title={branches.map(b => b.name).join(', ')}>
              <span style={{ cursor: 'pointer' }}>{firstBranch} +{remainingCount}</span>
            </Tooltip>
          );
        }
        return firstBranch;
      },
    },
    {
      title:     'Image',
      dataIndex: 'profile',
      key:       'profile',
      width:     80,
      align:     'center' as const,
      render:    (url: string) => (
        <Image
          src={url || 'https://via.placeholder.com/40'}
          alt="profile"
          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          preview={{ mask: <EyeOutlined /> }}
        />
      ),
    },
    ...(canStatusToggle ? [{
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      width:     100,
      align:     'center' as const,
      render:    (status: string, record: EmployeeRecord) => (
        <Switch
          checked={status === 'active'}
          loading={statusLoading === record._id}
          onChange={(checked: boolean) => handleStatusToggle(record, checked)}
          checkedChildren="On"
          unCheckedChildren="Off"
          size="small"
        />
      ),
    }] : []),
    ...(canView ? [{
      title:  'View',
      key:    'view',
      width:  80,
      align:  'center' as const,
      render: (_: unknown, record: EmployeeRecord) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ fontSize: 18, color: 'var(--sider-text)' }} />}
          onClick={() => handleView(record)}
        />
      ),
    }] : []),
    ...(hasAnyAction ? [{
      title:  'Actions',
      key:    'actions',
      width:  80,
      align:  'center' as const,
      render: (_: unknown, record: EmployeeRecord) => {
        const menuItems = [
          ...(canEdit ? [{
            key:     'edit',
            label:   'Edit',
            icon:    <EditOutlined />,
            onClick: () => navigate(`${EditEmployeeRoute}/${record._id}`),
          }] : []),
          ...(canChangePassword ? [{
            key:     'changePassword',
            label:   'Change Password',
            icon:    <KeyOutlined />,
            onClick: () => handleChangePassword(record),
          }] : []),
          ...(canVerify && !record.isVerified ? [{
            key:     'verify',
            label:   <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BadgeCheck size={14} verified={true} />Verify</span>,
            onClick: () => handleVerify?.(record),
          }] : []),
          ...(canUnverify && record.isVerified ? [{
            key:     'unverify',
            label:   <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BadgeCheck size={14} verified={false} />Unverify</span>,
            onClick: () => handleUnverify?.(record),
          }] : []),
          ...(canDelete ? [{
            key:     'delete',
            label:   'Delete',
            icon:    <DeleteOutlined />,
            danger:  true,
            onClick: () => handleDelete(record),
          }] : []),
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        );
      },
    }] : []),
  ];
};
