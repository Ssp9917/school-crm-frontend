import { Image, Tag } from "antd";
import { Link } from "react-router-dom";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface AddOnUserRecord {
  userId?:      string;
  branch?:      string;
  name?:        string;
  phoneNumber?: string;
  countryCode?: string;
  profile?:     string;
  gender?:      string;
  addons?:      unknown[];
}

/* ─── Columns ────────────────────────────────────────────────────────── */

const getAddOnsUserColumns = (
  hasPermission: (key: string) => boolean = () => true,
  dialCodeMap:   Map<string, { name: string; flag: string | null; dial?: string | null }> = new Map(),
) => [
  {
    title:  'S.No',
    key:    'sno',
    width:  60,
    render: (_: unknown, __: unknown, index: number) => index + 1,
  },
  {
    title:     'Branch',
    dataIndex: 'branch',
    key:       'branch',
    render:    (text: string) => text || '-',
  },
  {
    title:     'Name',
    dataIndex: 'name',
    key:       'name',
    render:    (text: string, record: AddOnUserRecord) =>
      hasPermission('9-3-view-profile') ? (
        <Link to={`/user-detail/${record.userId}/addon-service`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {text || '-'}
        </Link>
      ) : (
        <span>{text || '-'}</span>
      ),
  },
  {
    title:     'Phone Number',
    dataIndex: 'phoneNumber',
    key:       'phoneNumber',
    render:    (phone: string, record: AddOnUserRecord) => {
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
    title:     'Profile',
    dataIndex: 'profile',
    key:       'profile',
    render:    (profile: string) =>
      profile ? (
        <Image
          src={profile}
          alt="User Profile"
          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          preview={true}
        />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          N/A
        </div>
      ),
  },
  {
    title:     'Gender',
    dataIndex: 'gender',
    key:       'gender',
    render:    (text: string) => text || '-',
  },
  {
    title:  'Total Add-Ons',
    key:    'totalAddons',
    width:  130,
    render: (_: unknown, record: AddOnUserRecord) => {
      const count = record.addons?.length ?? 0;
      return <Tag color="blue">{count} Add-On{count !== 1 ? 's' : ''}</Tag>;
    },
  },
];

export default getAddOnsUserColumns;
export { getAddOnsUserColumns };
