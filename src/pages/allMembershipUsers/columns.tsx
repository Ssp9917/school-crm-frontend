import { Image, Tag, Button, Dropdown, Select, Tooltip } from "antd";
import { Link } from 'react-router-dom';
import { NavigateFunction } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, MoreOutlined, EyeOutlined, KeyOutlined } from "@ant-design/icons";
import { UserDetailAttendanceRoute, ViewFormRoute, EditUserRoute } from "../../routes/routepath";
import GymKitSelect from "../../components/gymKit/GymKitSelect";
import BadgeCheck from "../../components/badgeCheck";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SalesPerson {
  _id?:         string;
  name?:        string;
  phoneNumber?: string;
}

export interface MembershipUserRecord {
  _id?:             string;
  id?:              string;
  name?:            string;
  branch?:          string;
  phoneNumber?:     string;
  countryCode?:     string;
  gender?:          string;
  profile?:         string;
  planName?:        string;
  planPrice?:       number | string;
  remainingDays?:   string;
  status?:          string;
  invoiceStatus?:   { invoiceType?: string } | null;
  assessmentRatio?: string;
  salesPerson?:     string;
  salesPersonId?:   string | null;
  startDate?:       string;
  endDate?:         string;
  membershipForm?:  string;
  gymKit?:          string;
  planGymKit?:      unknown;
  deliveredSummary?: unknown;
  addon?:           string;
  isVerified?:      boolean;
  verifiedByName?:  string | null;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function statusColor(status: string): string {
  switch (status) {
    case 'active':   return 'green';
    case 'pending':  return 'orange';
    case 'inactive': return 'red';
    case 'freezed':  return 'blue';
    case 'block':    return 'volcano';
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
  { title: 'Branch',          dataIndex: 'branch',          key: 'branch',          width: 160 },
  {
    title:     'Name',
    dataIndex: 'name',
    key:       'name',
    width:     150,
    render:    (name: string, record: MembershipUserRecord) => {
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
      return hasPermission('9-10-view-profile') ? (
        <Link to={`/user-detail/${record._id}/${UserDetailAttendanceRoute}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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
    title:     'Phone Number',
    dataIndex: 'phoneNumber',
    key:       'phoneNumber',
    width:     170,
    render:    (phone: string, record: MembershipUserRecord) => {
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
      <Image
        src={url || 'https://via.placeholder.com/40'}
        alt="profile"
        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
      />
    ),
  },
  { title: 'Class & Section', dataIndex: 'planName',        key: 'planName',        width: 140 },
  { title: 'Admission Date',  dataIndex: 'planPrice',       key: 'planPrice',       width: 120 },
  { title: 'Remaining Days',  dataIndex: 'remainingDays',   key: 'remainingDays',   width: 140 },
  {
    title:     'Status',
    dataIndex: 'status',
    key:       'status',
    width:     100,
    align:     'center' as const,
    render:    (status: string) => (
      <Tag color={statusColor(status)}>{status?.toUpperCase() ?? '-'}</Tag>
    ),
  },
  {
    title:     'Invoice Status',
    dataIndex: 'invoiceStatus',
    key:       'invoiceStatus',
    width:     130,
    render:    (inv: { invoiceType?: string } | null) => inv?.invoiceType || '-',
  },
  { title: 'Student ID', dataIndex: 'assessmentRatio', key: 'assessmentRatio', width: 120 },
  {
    title:     'Parents',
    dataIndex: 'salesPerson',
    key:       'salesPerson',
    width:     180,
    render:    (value: string) => value || '-',
  },
  ...(hasPermission('9-10-view-form') ? [{
    title:  'Admission Form',
    key:    'membershipForm',
    width:  150,
    align:  'center' as const,
    render: (_: unknown, record: MembershipUserRecord) => (
      <Link to={`${ViewFormRoute}/${record._id}`}>
        <Button type="text" icon={<EyeOutlined style={{ fontSize: 20 }} />} />
      </Link>
    ),
  }] : []),
  { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', width: 120 },
  { title: 'End Date',   dataIndex: 'endDate',   key: 'endDate',   width: 120 },
  ...(hasPermission('9-10-gym-kit') ? [{
    title:  'Uniform & Books',
    key:    'gymKit',
    width:  140,
    render: (_: unknown, record: MembershipUserRecord) => <GymKitSelect record={record as any} />,
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
  _handleEdit:          (record: MembershipUserRecord) => void,
  handleDelete:         (record: MembershipUserRecord) => void,
  handleChangePassword: (record: MembershipUserRecord) => void,
  navigate:             NavigateFunction,
  salesPersons:         SalesPerson[] = [],
  onSalesPersonChange?: (userId: string | undefined, salesPersonId: string) => void,
  hasPermission:        (key: string) => boolean = () => true,
  dialCodeMap:          Map<string, { name: string; flag: string | null; dial?: string | null }> = new Map(),
) => {
  const hasAnyAction =
    hasPermission('9-10-edit') ||
    hasPermission('9-10-change-password') ||
    hasPermission('9-10-delete');

  const allColumns = getallColumns(salesPersons, onSalesPersonChange, hasPermission, dialCodeMap);

  return allColumns
    .filter(col => col.key !== 'actions' || hasAnyAction)
    .map(col => {
      if (col.key === 'actions') {
        return {
          ...col,
          render: (_: unknown, record: MembershipUserRecord) => {
            const menuItems = [
              ...(hasPermission('9-10-edit') ? [{
                key:     'edit',
                label:   'Edit',
                icon:    <EditOutlined />,
                onClick: () => navigate(`${EditUserRoute}/${record._id}`),
              }] : []),
              ...(hasPermission('9-10-change-password') ? [{
                key:     'changePassword',
                label:   'Change Password',
                icon:    <KeyOutlined />,
                onClick: () => handleChangePassword(record),
              }] : []),
              ...(hasPermission('9-10-delete') ? [{
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
