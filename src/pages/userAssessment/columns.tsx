import { Image, Tag, Select } from "antd";
import { Link } from "react-router-dom";

interface TrainerOption { label: string; value: string }

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface AssessmentRecord {
  userId?:               string;
  branch?:               string;
  name?:                 string;
  phoneNumber?:          string;
  countryCode?:          string;
  profile?:              string;
  gender?:               string;
  trainer?:              string;
  trainerId?:            string;
  membershipId?:         string;
  plan?:                 string;
  salesPerson?:          string;
  totalAssessments?:     number;
  completedAssessments?: number;
  status?:               string;
}

interface ColumnOpts {
  trainerOptions?:   TrainerOption[];
  onAssignTrainer?:  (userId: string, trainerId: string) => void;
  assigningId?:      string | null;
}

/* ─── Columns ────────────────────────────────────────────────────────── */

const getAssessmentColumns = (
  hasPermission: (key: string) => boolean = () => true,
  dialCodeMap:   Map<string, { name: string; flag: string | null; dial?: string | null }> = new Map(),
  opts:          ColumnOpts = {},
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
    render:    (text: string, record: AssessmentRecord) =>
      hasPermission('9-6-view-own') || hasPermission('9-6-view-all') ? (
        <Link to={`/user-detail/${record.userId}/assessment`} style={{ color: 'inherit', textDecoration: 'none' }}>
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
    render:    (phone: string, record: AssessmentRecord) => {
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
    title:     'Plan',
    dataIndex: 'plan',
    key:       'plan',
    render:    (text: string) => text || '-',
  },
  {
    title:     'Sales Person',
    dataIndex: 'salesPerson',
    key:       'salesPerson',
    render:    (text: string) => text || '-',
  },
  {
    title:     'Trainer',
    dataIndex: 'trainer',
    key:       'trainer',
    width:     200,
    render:    (_: string, record: AssessmentRecord) => (
      <Select
        showSearch
        size="small"
        placeholder="Assign trainer"
        optionFilterProp="label"
        style={{ width: 180 }}
        value={record.trainerId || undefined}
        loading={opts.assigningId === record.userId}
        disabled={!record.userId || opts.assigningId === record.userId}
        options={opts.trainerOptions || []}
        onChange={(val: string) => record.userId && opts.onAssignTrainer?.(record.userId, val)}
      />
    ),
  },
  {
    title:  'Assessments (Done/Total)',
    key:    'assessments',
    width:  170,
    render: (_: unknown, record: AssessmentRecord) => {
      const total = record.totalAssessments ?? 0;
      const done  = record.completedAssessments ?? 0;
      return <Tag color="blue">{done} / {total}</Tag>;
    },
  },
  {
    title:     'Assessment',
    dataIndex: 'status',
    key:       'status',
    width:     130,
    render:    (text: string) => (
      <Tag color={text === 'completed' ? 'green' : text === 'pending' ? 'orange' : 'blue'}>
        {text ? text.toUpperCase() : '-'}
      </Tag>
    ),
  },
];

export default getAssessmentColumns;
export { getAssessmentColumns };
