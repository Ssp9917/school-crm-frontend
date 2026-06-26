import { useState, useMemo } from "react";
import { Select } from "antd";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import DateRangeSelector from "../../components/dateRange/DateRangeSelector";
import { useGetAllAddonSessionsQuery } from "../../services/membership";
import { useGetTrainersQuery } from "../../services/trainer";
import { getLiveDashboardColumns } from "./columns";
import CommonTable from "../../components/commonTable";
import usePermissions from "../../hooks/usePermissions";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface DateRange {
  startDate: Date | null;
  endDate:   Date | null;
}

/** Format a Date as YYYY-MM-DD using local time (avoids the UTC off-by-one from toISOString). */
const toLocalDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

interface VisibleColumns {
  sno:         boolean;
  timer:       boolean;
  branch:      boolean;
  profile:     boolean;
  name:        boolean;
  phoneNumber: boolean;
  type:        boolean;
  serviceType: boolean;
  planInfo:    boolean;
  trainer:     boolean;
  status:      boolean;
  startDate:   boolean;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const typeOptions = [
  { label: "All Categories",    value: "all"               },
  { label: "Personal Training", value: "personal_training" },
  { label: "Pilates",           value: "pilates"           },
  { label: "Therapy",           value: "therapy"           },
  { label: "EMS",               value: "ems"               },
  { label: "Paid Locker",       value: "paid_locker"       },
  { label: "MMA",               value: "mma"               },
];

const payTypeOptions = [
  { label: "All Types",     value: "all"           },
  { label: "Paid",          value: "paid"          },
  { label: "Complimentary", value: "complimentary" },
];

const columnsForVisibility = [
  { key: 'sno',         label: 'S.No'         },
  { key: 'timer',       label: 'Timer'        },
  { key: 'branch',      label: 'Branch'       },
  { key: 'profile',     label: 'Profile'      },
  { key: 'name',        label: 'Name'         },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'category',    label: 'Category'     },
  { key: 'planInfo',    label: 'Plan'         },
  { key: 'trainer',     label: 'Trainer'      },
  { key: 'status',      label: 'Status'       },
  { key: 'startDate',   label: 'Session Date' },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddOnLiveDashboard = () => {
  const { hasPermission } = usePermissions();

  const [page,             setPage]             = useState(1);
  const [limit,            setLimit]            = useState(10);
  const [searchText,       setSearchText]       = useState('');
  const [activeTab,        setActiveTab]        = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPayType,  setSelectedPayType]  = useState('all');
  const [trainerId,        setTrainerId]        = useState('');
  const [dateRange,        setDateRange]        = useState<DateRange | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    sno:         true,
    timer:       true,
    branch:      true,
    profile:     true,
    name:        true,
    phoneNumber: true,
    type:        true,
    serviceType: true,
    planInfo:    true,
    trainer:     true,
    status:      true,
    startDate:   true,
  });

  const { data, isLoading } = useGetAllAddonSessionsQuery({
    status:      activeTab !== 'all' ? activeTab.toLowerCase() : undefined,
    serviceType: selectedCategory !== 'all' ? selectedCategory : undefined,
    type:        selectedPayType !== 'all' ? selectedPayType : undefined,
    trainerId:   trainerId || undefined,
    fromDate:    dateRange?.startDate ? toLocalDateStr(dateRange.startDate) : undefined,
    toDate:      dateRange?.endDate   ? toLocalDateStr(dateRange.endDate)   : undefined,
    page,
    limit,
  } as any);

  const { data: trainersData } = useGetTrainersQuery({ limit: 1000 });

  const trainerOptions = useMemo(() => {
    const td = trainersData as any;
    const list = td?.data ?? td?.trainers;
    const opts = Array.isArray(list)
      ? list
          .map((t: any) => ({
            label: t?.user?.name ?? t?.name,
            value: t?._id ?? t?.id,
          }))
          .filter((o: any) => o.label && o.value)
      : [];
    return [{ label: 'All Trainers', value: 'all' }, ...opts];
  }, [trainersData]);

  const sessionsData = useMemo(() => {
    const rows = (data as any)?.data;
    if (!Array.isArray(rows)) return [];
    return rows.map((session: any, index: number) => ({
      _id:                   session.sessionId,
      sNo:                   (page - 1) * limit + index + 1,
      name:                  session.memberName    || '-',
      branch:                session.branch        || '-',
      phoneNumber:           session.memberPhone   || '-',
      profile:               session.memberPhoto   || null,
      gender:                session.memberGender  || '-',
      type:                  session.type          || '-',
      serviceType:           session.serviceType   || '-',
      planInfo:              session.planName      || 'N/A',
      trainer:               session.trainerName   || '-',
      startDate:             session.sessionDate   || null,
      endedAt:               session.endedAt       || null,
      endDate:               session.endedAt ? new Date(session.endedAt).toLocaleDateString() : '-',
      status:                session.status        || '-',
      sessionId:             session.sessionId,
      activeSeconds:         session.activeSeconds         || 0,
      activeDurationMinutes: session.activeDurationMinutes || 0,
      remainingSeconds:      session.remainingSeconds      || 0,
      remainingMinutes:      session.remainingMinutes      || 0,
      maxDurationSeconds:    session.maxDurationSeconds    || 3600,
      memberId:              session.userId || session.memberId,
      membershipId:          session.membershipId,
      trainerId:             session.trainerId,
      branchId:              session.branchId,
    }));
  }, [data, page, limit]);

  const filteredData = useMemo(() => {
    if (!searchText) return sessionsData;
    const q = searchText.toLowerCase();
    return sessionsData.filter((s: any) => s.name && s.name.toLowerCase().includes(q));
  }, [sessionsData, searchText]);

  const summary = (data as any)?.summary;
  const tabsData = [
    { key: 'all',         label: 'All',       count: summary?.total      ?? (data as any)?.total ?? 0 },
    { key: 'in_progress', label: 'Live',      count: summary?.inProgress ?? 0 },
    { key: 'paused',      label: 'Paused',    count: summary?.paused     ?? 0 },
    { key: 'completed',   label: 'Completed', count: summary?.completed  ?? 0 },
  ];

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey as keyof VisibleColumns] }));
  };

  const columns           = getLiveDashboardColumns(hasPermission);
  const visibleColumnsArr = columns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  return (
    <div className="add-on-live-dashboard-page">
      <div className="header-section">
        {/* <div className="left-col"> */}
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search sessions..." />
          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabsData} />
        {/* </div> */}
        {/* <div className="right-col"> */}
          <Select
            showSearch
            value={trainerId || 'all'}
            onChange={(val: string) => { setTrainerId(val === 'all' ? '' : val); setPage(1); }}
            className="category-filter"
            style={{ width: 170, height: 41 }}
            options={trainerOptions}
            optionFilterProp="label"
            placeholder="All Trainers"
          />
          <Select
            value={selectedCategory}
            onChange={(val: string) => { setSelectedCategory(val); setPage(1); }}
            className="category-filter"
            style={{ width: 160, height: 41 }}
            options={typeOptions}
          />
          <Select
            value={selectedPayType}
            onChange={(val: string) => { setSelectedPayType(val); setPage(1); }}
            className="category-filter"
            style={{ width: 150, height: 41 }}
            options={payTypeOptions}
          />
          <DateRangeSelector onChange={setDateRange} />
          <ColumnVisibility
            columns={columnsForVisibility}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        {/* </div> */}
      </div>

      <div className="users-table-wrapper add-on-live-dashboard">
        <CommonTable
          columns={visibleColumnsArr}
          dataSource={filteredData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: any) => record._id || record.sessionId}
          scroll={{ x: 1600 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={(data as any)?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default AddOnLiveDashboard;
