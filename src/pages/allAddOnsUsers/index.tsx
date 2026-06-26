import { useState, useMemo, useEffect } from "react";
import { Table, Tag, Select } from "antd";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import DateRangeSelector from "../../components/dateRange/DateRangeSelector";
import { getAddOnsUserColumns, AddOnUserRecord } from "./columns";
import { useGetAllAddonsUsersQuery } from "../../services/membership";
import { useGetTrainersQuery } from "../../services/trainer";
import { useCountries } from "../../hooks/useCountries";
import { useSelector } from "react-redux";

/** Format a Date as YYYY-MM-DD using local time. */
const toLocalDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface FilterDateRange {
  startDate: Date | null;
  endDate:   Date | null;
}

const ADDON_TYPE_OPTIONS = [
  { label: "All Types",         value: "all"               },
  { label: "Personal Training", value: "personal_training" },
  { label: "Pilates",           value: "pilates"           },
  { label: "Therapy",           value: "therapy"           },
  { label: "EMS",               value: "ems"               },
  { label: "Paid Locker",       value: "paid_locker"       },
  { label: "MMA",               value: "mma"               },
];

const SESSION_STATUS_OPTIONS = [
  { label: "All Sessions", value: "all"         },
  { label: "Live",         value: "in_progress" },
  { label: "Paused",       value: "paused"      },
  { label: "Completed",    value: "completed"   },
];
import "./styles.scss";
import CommonTable from "../../components/commonTable";
import usePermissions from "../../hooks/usePermissions";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface AddonRow {
  _id:               string;
  category:          string;
  planInfo:          string;
  trainer:           string;
  startDate:         string;
  endDate:           string;
  status:            string;
  sessions:          number | string;
  usedSessions:      number;
  remainingSessions: number;
  totalInvoiced:     number | string;
  totalPaid:         number | string;
  remainingDue:      number | string;
}

interface UserRow extends AddOnUserRecord {
  _id:    string;
  status: string;
  addons: AddonRow[];
}

interface VisibleColumns {
  branch:      boolean;
  name:        boolean;
  phoneNumber: boolean;
  profile:     boolean;
  gender:      boolean;
  totalAddons: boolean;
}

/* ─── Expand columns (static) ────────────────────────────────────────── */

const addonExpandColumns = [
  {
    title:     'Category',
    dataIndex: 'category',
    key:       'category',
    width:     160,
    render:    (text: string) => (
      <Tag color="purple" style={{ textTransform: 'capitalize' }}>{text || '-'}</Tag>
    ),
  },
  { title: 'Plan Name',   dataIndex: 'planInfo',   key: 'planInfo',   width: 180, render: (text: string) => text || '-' },
  {
    title:  'Sessions (Used/Remaining)',
    key:    'sessions',
    width:  180,
    render: (_: unknown, r: AddonRow) =>
      r.sessions === '-' ? '-' : `${r.usedSessions} / ${r.remainingSessions}`,
  },
  { title: 'Trainer',        dataIndex: 'trainer',       key: 'trainer',       width: 140, render: (text: string)          => text || '-'  },
  { title: 'Start Date',     dataIndex: 'startDate',     key: 'startDate',     width: 120 },
  { title: 'End Date',       dataIndex: 'endDate',       key: 'endDate',       width: 120 },
  { title: 'Total Invoiced', dataIndex: 'totalInvoiced', key: 'totalInvoiced', width: 130, render: (v: number | string)    => v ?? '-'     },
  { title: 'Total Paid',     dataIndex: 'totalPaid',     key: 'totalPaid',     width: 110, render: (v: number | string)    => v ?? '-'     },
  { title: 'Remaining Due',  dataIndex: 'remainingDue',  key: 'remainingDue',  width: 130, render: (v: number | string)    => v ?? '-'     },
  {
    title:     'Status',
    dataIndex: 'status',
    key:       'status',
    width:     100,
    render:    (text: string) => (
      <Tag color={text === 'active' ? 'green' : text === 'freezed' ? 'blue' : 'red'}>
        {text?.toUpperCase() || '-'}
      </Tag>
    ),
  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AllAddOnsUsers = () => {
  const { hasPermission } = usePermissions();
  const { dialCodeMap } = useCountries();

  const [page,             setPage]             = useState(1);
  const [limit,            setLimit]            = useState(10);
  const [searchText,       setSearchText]       = useState('');
  const [activeTab,        setActiveTab]        = useState('all');
  const [addonType,        setAddonType]        = useState('all');
  const [coachId,          setCoachId]          = useState('all');
  const [sessionStatus,    setSessionStatus]    = useState('all');
  const [dateRange,        setDateRange]        = useState<FilterDateRange | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser,     setSelectedUser]     = useState<UserRow | null>(null);
  const [expandedRowKey,   setExpandedRowKey]   = useState<string | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    branch:      true,
    name:        true,
    phoneNumber: true,
    profile:     true,
    gender:      true,
    totalAddons: true,
  });

  const { data: trainersData } = useGetTrainersQuery({ limit: 1000 });

  // branch comes from the global header (Redux), not a per-page filter
  const selectedBranch = useSelector((state: any) => state.branch.selectedBranch);

  // reset to first page whenever the global branch changes
  useEffect(() => { setPage(1); }, [selectedBranch]);

  const trainerOptions = useMemo(() => {
    const td = trainersData as any;
    const list = td?.data ?? td?.trainers;
    const opts = Array.isArray(list)
      ? list.map((t: any) => ({ label: t?.user?.name ?? t?.name, value: t?._id ?? t?.id })).filter((o: any) => o.label && o.value)
      : [];
    return [{ label: 'All Trainers', value: 'all' }, ...opts];
  }, [trainersData]);

  const { data: apiData, isLoading } = useGetAllAddonsUsersQuery({
    page,
    limit,
    search:        searchText,
    status:        activeTab !== 'all' ? activeTab : undefined,
    addonType:     addonType !== 'all' ? addonType : undefined,
    branchId:      selectedBranch || undefined,
    coachId:       coachId !== 'all' ? coachId : undefined,
    sessionStatus: sessionStatus !== 'all' ? sessionStatus : undefined,
    startDate:     dateRange?.startDate ? toLocalDateStr(dateRange.startDate) : undefined,
    endDate:       dateRange?.endDate   ? toLocalDateStr(dateRange.endDate)   : undefined,
  } as any);

  const usersData = useMemo<UserRow[]>(() => {
    const rows = (apiData as any)?.data;
    if (!Array.isArray(rows)) return [];
    return rows.map((item: any) => {
      const user       = item.user   || {};
      const addons     = item.addons || [];
      const firstAddon = addons[0]   || {};
      const branch     = firstAddon.branch || {};
      return {
        _id:         user._id,
        userId:      user._id,
        name:        user.name        || '-',
        branch:      branch.name      || '-',
        phoneNumber: user.phoneNumber || '-',
        countryCode: user.member?.countryCode || user.countryCode || '',
        profile:     user.photo       || null,
        gender:      user.gender      || '-',
        status:      firstAddon.status || '-',
        addons:      addons.map((addon: any): AddonRow => ({
          _id:               addon._id,
          category:          addon.plan?.addonType?.replace(/_/g, ' ') || '-',
          planInfo:          addon.plan?.name    || '-',
          trainer:           addon.trainer?.name || '-',
          startDate:         addon.startDate   ? new Date(addon.startDate).toLocaleDateString()   : '-',
          endDate:           addon.expiryDate  ? new Date(addon.expiryDate).toLocaleDateString()  : '-',
          status:            addon.status      || '-',
          sessions:          addon.totalSessions || '-',
          usedSessions:      addon.usedSessions      || 0,
          remainingSessions: addon.remainingSessions  || 0,
          totalInvoiced:     addon.totalInvoiced ?? '-',
          totalPaid:         addon.totalPaid     ?? '-',
          remainingDue:      addon.remainingDue  ?? '-',
        })),
      };
    });
  }, [apiData]);

  const tabsData = [
    { key: 'all',      label: 'All',      count: (apiData as any)?.total || 0 },
    { key: 'active',   label: 'Active',   count: usersData.filter(u => u.status === 'active').length   },
    { key: 'inactive', label: 'Inactive', count: usersData.filter(u => u.status === 'inactive').length },
  ];

  const columnsWithHandlers = getAddOnsUserColumns(hasPermission, dialCodeMap);
  const columns = columnsWithHandlers.filter((col: any) => visibleColumns[col.key as keyof VisibleColumns]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey as keyof VisibleColumns] }));
  };

  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  };

  const expandable = {
    expandedRowKeys:    expandedRowKey ? [expandedRowKey] : [],
    onExpand:           (expanded: boolean, record: UserRow) =>
                          setExpandedRowKey(expanded ? record._id : null),
    expandedRowRender:  (record: UserRow) => (
      <Table
        columns={addonExpandColumns}
        dataSource={record.addons}
        rowKey="_id"
        pagination={false}
        size="small"
        bordered
        style={{ margin: '8px 0' }}
      />
    ),
    rowExpandable: (record: UserRow) => (record.addons?.length ?? 0) > 0,
    expandIcon: ({ expanded, onExpand, record }: { expanded: boolean; onExpand: (record: UserRow, e: React.MouseEvent) => void; record: UserRow }) => (
      <button
        onClick={(e) => onExpand(record, e)}
        style={{
          width: 22, height: 22,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--hover-bg)',
          border: '1px solid var(--muted)',
          borderRadius: 5,
          color: 'var(--sider-text)',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
          transition: 'background .15s, border-color .15s',
        }}
      >
        {expanded ? '−' : '+'}
      </button>
    ),
  };

  return (
    <div className="all-users-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search add-on users..." />
          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabsData} />
        </div>
        <div className="right-col" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select
            value={coachId}
            onChange={(val: string) => { setCoachId(val); setPage(1); }}
            options={trainerOptions}
            showSearch
            optionFilterProp="label"
            style={{ width: 170, height: 41 }}
            placeholder="All Trainers"
          />
          <Select
            value={addonType}
            onChange={(val: string) => { setAddonType(val); setPage(1); }}
            options={ADDON_TYPE_OPTIONS}
            style={{ width: 170, height: 41 }}
            placeholder="All Types"
          />
          {/* <Select
            value={sessionStatus}
            onChange={(val: string) => { setSessionStatus(val); setPage(1); }}
            options={SESSION_STATUS_OPTIONS}
            style={{ width: 160, height: 41 }}
            placeholder="All Sessions"
          /> */}
          <DateRangeSelector onChange={(range: FilterDateRange) => { setDateRange(range); setPage(1); }} />
          <ColumnVisibility
            columns={columnsWithHandlers}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="users-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={usersData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: any) => record._id || record.id}
          scroll={{ x: 900 }}
          expandable={expandable}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={(apiData as any)?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onCancel={handlePasswordModalCancel}
        selectedUser={selectedUser}
        userType="user"
      />
    </div>
  );
};

export default AllAddOnsUsers;
