import { Image, Button, Dropdown, Switch, Spin, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, LockOutlined } from '@ant-design/icons';
import { GeneralStaffDetailAttendanceRoute } from '../../routes/routepath';
import { Link } from 'react-router-dom';
import BadgeCheck from '../../components/badgeCheck';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface StaffRecord {
  _id?:         string;
  id?:          string;
  name?:        string;
  phoneNumber?: string;
  role?:        string;
  branchName?:  string;
  photo?:       string;
  status?:      string;
  staffId?:     string;
  address?:     string;
  idType?:      string;
  idNumber?:    string;
  idFront?:     string;
  idBack?:      string;
  joiningDate?: string;
  department?:  string;
  isVerified?:     boolean;
  verifiedByName?: string | null;
  user?: {
    _id?:         string;
    name?:        string;
    phoneNumber?: string;
    status?:      string;
    branchIds?:   { name?: string }[];
  };
}

/* ─── Columns ────────────────────────────────────────────────────────── */

export const getGeneralStaffColumns = (
  handleView:           (record: StaffRecord) => void,
  handleVerify:         (record: StaffRecord) => void,
  handleEdit:           (record: StaffRecord) => void,
  handleDelete:         (record: StaffRecord) => void,
  handleChangePassword: (record: StaffRecord) => void,
  handleStatusToggle:   (id: string, checked: boolean) => void,
  statusLoading:        string | null,
  canEdit           = true,
  canDelete         = true,
  canChangePassword = true,
  canStatusToggle   = true,
  canVerify         = true,
  canView           = true,
  canUnverify       = false,
  handleUnverify?:    (record: StaffRecord) => void,
) => {
  const hasAnyAction = canEdit || canDelete || canChangePassword || canVerify || canUnverify;

  return [
    {
      title:     'Name',
      dataIndex: 'name',
      key:       'name',
      width:     150,
      render:    (name: string, record: StaffRecord) => {
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
          <Link
            to={`/general-staff-detail/${record._id || record.id}/${GeneralStaffDetailAttendanceRoute}`}
            style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
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
      title:     'Designation',
      dataIndex: 'role',
      key:       'role',
      width:     150,
      render:    (role: string) => role || '-',
    },
    {
      title:     'Phone Number',
      dataIndex: 'phoneNumber',
      key:       'phoneNumber',
      width:     130,
    },
    {
      title:     'Branch Name',
      dataIndex: 'branchName',
      key:       'branchName',
      width:     150,
      render:    (branchName: string) => branchName || '-',
    },
    {
      title:     'Image',
      dataIndex: 'photo',
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
      width:     120,
      align:     'center' as const,
      render:    (status: string, record: StaffRecord) => {
        const isRowLoading = statusLoading === record._id;
        return (
          <Spin spinning={isRowLoading} size="small">
            <Switch
              checked={status === 'active'}
              onChange={(checked: boolean) => handleStatusToggle(record._id as string, checked)}
              checkedChildren="On"
              unCheckedChildren="Off"
              disabled={isRowLoading}
              size="small"
            />
          </Spin>
        );
      },
    }] : []),
    ...(canView ? [{
      title:  'View',
      key:    'view',
      width:  80,
      align:  'center' as const,
      render: (_: unknown, record: StaffRecord) => (
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
      render: (_: unknown, record: StaffRecord) => {
        const menuItems = [
          ...(canVerify && !record.isVerified ? [{
            key:     'verify',
            label:   <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BadgeCheck size={14} verified={true} />Verify</span>,
            onClick: () => handleVerify(record),
          }] : []),
          ...(canUnverify && record.isVerified ? [{
            key:     'unverify',
            label:   <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BadgeCheck size={14} verified={false} />Unverify</span>,
            onClick: () => handleUnverify?.(record),
          }] : []),
          ...(canEdit ? [{
            key:     'edit',
            label:   'Edit',
            icon:    <EditOutlined />,
            onClick: () => handleEdit(record),
          }] : []),
          ...(canChangePassword ? [{
            key:     'change-password',
            label:   'Change Password',
            icon:    <LockOutlined />,
            onClick: () => handleChangePassword(record),
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
