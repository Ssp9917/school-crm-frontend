import { Image, Tag, Button, Dropdown, Select, Tooltip } from "antd";
import { Link } from 'react-router-dom';
import { NavigateFunction } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, MoreOutlined, EyeOutlined, KeyOutlined, StopOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { UserDetailAttendanceRoute, ViewFormRoute, EditUserRoute } from "../../routes/routepath";
import BadgeCheck from "../../components/badgeCheck";
import { img } from "../../assets";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SalesPerson {
  _id?:         string;
  name?:        string;
  phoneNumber?: string;
}

export interface BlacklistInfo {
  isBlacklisted:      boolean;
  hasPendingRequest:  boolean;
  pendingRequestId:   string | null;
  canRequestBlacklist: boolean;
  canCancelRequest:   boolean;
}

export interface UserRecord {
  _id?:            string;
  id?:             string;
  name?:           string;
  branch?:         string;
  phoneNumber?:    string;
  countryCode?:    string;
  gender?:         string;
  profile?:        string;
  planName?:       string;
  addon?:          string;
  planPrice?:      number | string;
  remainingDays?:  string | number;
  status?:         string;
  assessmentRatio?: string;
  salesPerson?:    string;
  salesPersonId?:  string | null;
  startDate?:      string;
  endDate?:        string;
  membershipForm?: string;
  gymKit?:         string;
  planGymKit?:     unknown;
  deliveredSummary?: unknown;
  blacklistInfo?:  BlacklistInfo;
  isVerified?:     boolean;
  verifiedByName?: string | null;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function statusStyle(status: string): { color?: string; background?: string; borderColor?: string } {
  switch (status) {
    case 'block':
    case 'blocked':  return { background: '#f97316', borderColor: '#f97316', color: '#fff' };
    default:         return {};
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'active':   return 'green';
    case 'pending':  return 'orange';
    case 'inactive': return 'red';
    case 'freezed':  return 'blue';
    default:         return 'default';
  }
}

/* ─── Base column template ───────────────────────────────────────────── */

const getallColumns = (
  salesPersons:       SalesPerson[] = [],
  onSalesPersonChange?: (userId: string | undefined, salesPersonId: string) => void,
  hasPermission:      (key: string) => boolean = () => true,
  dialCodeMap:        Map<string, { name: string; flag: string | null; dial?: string | null }> = new Map(),
) => [
  { title: 'Branch', dataIndex: 'branch', key: 'branch', width: 160 },
  {
    title:     'Name',
    dataIndex: 'name',
    key:       'name',
    width:     150,
    render:    (name: string, record: UserRecord) => {
      const display   = name ? name.charAt(0).toUpperCase() + name.slice(1) : '-';
      const truncStyle: React.CSSProperties = {
        display: 'block', maxWidth: 130, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      };
      const badgeTitle = record.isVerified
        ? `Verified by ${record.verifiedByName || '—'}`
        : 'Not verified';
      const badge = (
        <Tooltip title={badgeTitle}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <BadgeCheck size={15} verified={!!record.isVerified} />
          </span>
        </Tooltip>
      );
      return hasPermission('9-1-view-profile') ? (
        <Link to={`/user-detail/${record._id}/${UserDetailAttendanceRoute}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: 130 }}>
          <Tooltip title={display}>
            <span style={truncStyle}>{display}</span>
          </Tooltip>
          {badge}
        </Link>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Tooltip title={display}>
            <span style={truncStyle}>{display}</span>
          </Tooltip>
          {badge}
        </span>
      );
    },
  },
  {
    title:     'Phone Number',
    dataIndex: 'phoneNumber',
    key:       'phoneNumber',
    width:     170,
    render:    (phone: string, record: UserRecord) => {
      const info = record.countryCode ? dialCodeMap.get(record.countryCode) : null;
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
          {info ? (
            <>
              {info.flag && <img src={info.flag} alt={info.name} style={{ width: 16, height: 12, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} />}
              <span style={{ fontSize: 11, opacity: 0.7, whiteSpace: 'nowrap' }}>{info.dial || record.countryCode}</span>
            </>
          ) : record.countryCode ? (
            <span style={{ fontSize: 11, opacity: 0.7, whiteSpace: 'nowrap' }}>{record.countryCode}</span>
          ) : null}
          <span>{phone || '—'}</span>
        </span>
      );
    },
  },
  {
    title:     'Gender',
    dataIndex: 'gender',
    key:       'gender',
    width:     80,
    render:    (gender: string) => gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : '-',
  },
  {
    title:     'Profile',
    dataIndex: 'profile',
    key:       'profile',
    width:     80,
    render:    (url: string) => (
      <Image src={url || img} alt="profile" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
    ),
  },
  { title: 'Membership', dataIndex: 'planName', key: 'planName', width: 120 },
  { title: 'Addon',      dataIndex: 'addon',    key: 'addon',    width: 140 },
  {
    title:     'Status',
    dataIndex: 'status',
    key:       'status',
    width:     100,
    align:     'center' as const,
    render:    (status: string) => (
      <Tag color={statusColor(status)} style={statusStyle(status)}>{status?.toUpperCase() ?? '-'}</Tag>
    ),
  },
  {
    title:     'Sales Person',
    dataIndex: 'salesPerson',
    key:       'salesPerson',
    width:     200,
    render:    (value: string, record: UserRecord) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {value && value !== '-' && (
          <div style={{ fontSize: '12px', color: '#dcdcdc6e', marginBottom: '2px' }}>{value}</div>
        )}
        <Select
          placeholder="Select sales person"
          style={{ width: '100%' }}
          value={record.salesPersonId ?? undefined}
          allowClear
          showSearch
          disabled
          onChange={(salesPersonId: string) =>
            onSalesPersonChange?.(record._id, salesPersonId)
          }
          options={salesPersons.map(p => ({ value: p._id, label: p.name }))}
        />
      </div>
    ),
  },
  ...(hasPermission('9-1-view-form') ? [{
    title:  'Membership Form',
    key:    'membershipForm',
    width:  150,
    align:  'center' as const,
    render: (_: unknown, record: UserRecord) => (
      <Link to={`${ViewFormRoute}/${record._id}`}>
        <Button type="text" icon={<EyeOutlined style={{ fontSize: 20 }} />} />
      </Link>
    ),
  }] : []),
  {
    title:  'Actions',
    key:    'actions',
    width:  100,
    align:  'center' as const,
    render: () => null,
  },
];

/* ─── Columns factory ────────────────────────────────────────────────── */

export const getUserColumns = (
  _handleEdit:             (record: UserRecord) => void,
  handleDelete:            (record: UserRecord) => void,
  handleChangePassword:    (record: UserRecord) => void,
  navigate:                NavigateFunction,
  salesPersons:            SalesPerson[] = [],
  onSalesPersonChange?:    (userId: string | undefined, salesPersonId: string) => void,
  hasPermission:           (key: string) => boolean = () => true,
  dialCodeMap:             Map<string, { name: string; flag: string | null; dial?: string | null }> = new Map(),
  handleRequestBlacklist?: (record: UserRecord) => void,
  handleCancelBlacklist?:  (record: UserRecord) => void,
  handleVerifyUser?:       (record: UserRecord) => void,
  handleUnverifyUser?:     (record: UserRecord) => void,
) => {
  const hasAnyAction =
    hasPermission('9-2-3') ||
    hasPermission('9-1-view-profile') ||
    hasPermission('9-1-change-password') ||
    hasPermission('9-1-delete') ||
    hasPermission('BLACKLIST_CREATE_REQUEST') ||
    hasPermission('USER_VERIFY') ||
    hasPermission('USER_UNVERIFY');

  const allColumns = getallColumns(salesPersons, onSalesPersonChange, hasPermission, dialCodeMap);

  return allColumns
    .filter(col => col.key !== 'actions' || hasAnyAction)
    .map(col => {
      if (col.key === 'actions') {
        return {
          ...col,
          render: (_: unknown, record: UserRecord) => {
            const bl = record.blacklistInfo;
            const menuItems = [
              ...(hasPermission('9-2-3') ? [{
                key:     'edit',
                label:   'Edit',
                icon:    <EditOutlined />,
                onClick: () => navigate(`${EditUserRoute}/${record._id}`),
              }] : []),
              ...(hasPermission('9-1-view-profile') ? [{
                key:     'viewProfile',
                label:   'View Profile',
                icon:    <EyeOutlined />,
                onClick: () => navigate(`/user-detail/${record._id}`),
              }] : []),
              ...(hasPermission('9-1-change-password') ? [{
                key:     'changePassword',
                label:   'Change Password',
                icon:    <KeyOutlined />,
                onClick: () => handleChangePassword(record),
              }] : []),
              ...(hasPermission('USER_VERIFY') && !record.isVerified ? [{
                key:     'verify',
                label:   <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BadgeCheck size={14} verified={true} />Verify</span>,
                onClick: () => handleVerifyUser?.(record),
              }] : []),
              ...(hasPermission('USER_UNVERIFY') && record.isVerified ? [{
                key:     'unverify',
                label:   <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BadgeCheck size={14} verified={false} />Unverify</span>,
                onClick: () => handleUnverifyUser?.(record),
              }] : []),
              ...(hasPermission('BLACKLIST_CREATE_REQUEST') && bl?.canRequestBlacklist ? [{
                key:     'requestBlacklist',
                label:   'Request to Blacklist',
                icon:    <StopOutlined />,
                danger:  true,
                onClick: () => handleRequestBlacklist?.(record),
              }] : []),
              ...(hasPermission('BLACKLIST_CANCEL_REQUEST') && bl?.canCancelRequest ? [{
                key:     'cancelBlacklist',
                label:   'Cancel Blacklist Request',
                icon:    <CloseCircleOutlined />,
                danger:  true,
                onClick: () => handleCancelBlacklist?.(record),
              }] : []),
              ...(hasPermission('9-1-delete') ? [{
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
        };
      }
      return col;
    });
};
