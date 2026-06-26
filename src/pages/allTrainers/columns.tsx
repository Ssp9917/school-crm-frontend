import { Image, Tag, Button, Dropdown, Switch, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, KeyOutlined } from '@ant-design/icons';
import { NavigateFunction, Link } from 'react-router-dom';
import { EditTrainerRoute, TrainerDetailAttendanceRoute } from '../../routes/routepath';
import BadgeCheck from '../../components/badgeCheck';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface TrainerRecord {
  _id?:        string;
  id?:         string;
  name?:       string;
  designation?: string;
  phoneNumber?: string;
  email?:      string;
  photo?:      string;
  status?:     string;
  trainerType?: string[];
  experience?:  number | string;
  branches?:   { name?: string }[];
  isVerified?:     boolean;
  verifiedByName?: string | null;
}

/* ─── Columns factory ────────────────────────────────────────────────── */

export const getTrainerColumns = (
  handleView:           (record: TrainerRecord) => void,
  handleVerify:         (record: TrainerRecord) => void,
  handleEdit:           (record: TrainerRecord) => void,
  handleDelete:         (record: TrainerRecord) => void,
  handleChangePassword: (record: TrainerRecord) => void,
  navigate:             NavigateFunction,
  handleStatusToggle:   (record: TrainerRecord, checked: boolean) => void,
  statusLoading:        string | null,
  canEdit           = false,
  canDelete         = false,
  canVerify         = false,
  canChangePassword = false,
  canStatusToggle   = true,
  canView           = true,
  canUnverify       = false,
  handleUnverify?:    (record: TrainerRecord) => void,
) => {
  const hasAnyAction = canEdit || canDelete || canVerify || canChangePassword || canUnverify;

  return [
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
      title:     'Name',
      dataIndex: 'name',
      key:       'name',
      width:     150,
      render:    (name: string, record: TrainerRecord) => (
        <Link to={`/trainer-detail/${record._id}/${TrainerDetailAttendanceRoute}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span>{name ? name.charAt(0).toUpperCase() + name.slice(1) : '-'}</span>
          <Tooltip
            title={record.isVerified ? `Verified by ${record.verifiedByName || '—'}` : 'Not verified'}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <BadgeCheck size={15} verified={!!record.isVerified} />
            </span>
          </Tooltip>
        </Link>
      ),
    },
    {
      title:     'Role',
      dataIndex: 'designation',
      key:       'designation',
      width:     150,
      render:    (designation: string) => designation || '-',
    },
    { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 130 },
    { title: 'Email',        dataIndex: 'email',       key: 'email',       width: 180 },
    {
      title:     'Expertise',
      dataIndex: 'trainerType',
      key:       'expertise',
      width:     180,
      render:    (types: string[]) => Array.isArray(types) && types.length > 0 ? types.join(', ') : '-',
    },
    {
      title:     'Years Of Experience',
      dataIndex: 'experience',
      key:       'yearsOfExperience',
      width:     130,
      align:     'center' as const,
      render:    (exp: number | string) =>
        exp ? `${exp} ${exp === '1' || exp === 1 ? 'year' : 'years'}` : '-',
    },
    {
      title:     'Profile',
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
      width:     100,
      align:     'center' as const,
      render:    (status: string, record: TrainerRecord) => (
        <Switch
          checked={status === 'active'}
          loading={statusLoading === record._id}
          onChange={(checked) => handleStatusToggle(record, checked)}
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
      render: (_: unknown, record: TrainerRecord) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)} />
      ),
    }] : []),
    ...(hasAnyAction ? [{
      title:  'Actions',
      key:    'actions',
      width:  80,
      align:  'center' as const,
      render: (_: unknown, record: TrainerRecord) => {
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
            onClick: () => navigate(`${EditTrainerRoute}/${record._id}`),
          }] : []),
          ...(canChangePassword ? [{
            key:     'changePassword',
            label:   'Change Password',
            icon:    <KeyOutlined />,
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
