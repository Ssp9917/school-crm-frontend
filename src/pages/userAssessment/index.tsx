import { useState, useMemo, useEffect } from "react";
import { Select, message, Modal } from "antd";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import DateRangeSelector from "../../components/dateRange/DateRangeSelector";
import CommonTable from "../../components/commonTable";
import { getAssessmentColumns, AssessmentRecord } from "./columns";
import { useGetAllAssessmentsQuery, useAssignAssessmentMutation } from "../../services/assessment";
import { useGetTrainersQuery } from "../../services/trainer";
import { useCountries } from "../../hooks/useCountries";
import usePermissions from "../../hooks/usePermissions";
import { useSelector } from "react-redux";

import "./styles.scss"
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

const STATUS_OPTIONS = [
  { label: "All Assessments", value: "all"       },
  { label: "Pending",         value: "pending"   },
  { label: "Completed",       value: "completed" },
];

/* ─── Types ──────────────────────────────────────────────────────────── */

interface AssessmentRow extends AssessmentRecord {
  _id:    string;
  status: string;
}

interface VisibleColumns {
  branch:      boolean;
  name:        boolean;
  phoneNumber: boolean;
  profile:     boolean;
  gender:      boolean;
  plan:        boolean;
  salesPerson: boolean;
  trainer:     boolean;
  assessments: boolean;
  status:      boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const UserAssessment = () => {
  const { hasPermission } = usePermissions();
  const { dialCodeMap }   = useCountries();

  const [page,        setPage]        = useState(1);
  const [limit,       setLimit]       = useState(10);
  const [searchText,  setSearchText]  = useState('');
  const [activeTab,   setActiveTab]   = useState('all');
  const [statusType,  setStatusType]  = useState('all');
  const [trainerId,   setTrainerId]   = useState('all');
  const [dateRange,   setDateRange]   = useState<FilterDateRange | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    branch:      true,
    name:        true,
    phoneNumber: true,
    profile:     true,
    gender:      true,
    plan:        true,
    salesPerson: true,
    trainer:     true,
    assessments: true,
    status:      true,
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

  const { data: apiData, isLoading } = useGetAllAssessmentsQuery({
    page,
    limit,
    search:           searchText,
    status:           activeTab !== 'all' ? activeTab : undefined,
    assessmentStatus: statusType !== 'all' ? statusType : undefined,
    trainerId:        trainerId !== 'all' ? trainerId : undefined,
    branchId:         selectedBranch || undefined,
    startDate:        dateRange?.startDate ? toLocalDateStr(dateRange.startDate) : undefined,
    endDate:          dateRange?.endDate   ? toLocalDateStr(dateRange.endDate)   : undefined,
  } as any);

  const assessmentData = useMemo<AssessmentRow[]>(() => {
    const users: any[] = (apiData as any)?.users;
    if (!Array.isArray(users)) return [];
    return users.map((user: any) => {
      const member  = user.member            || {};
      const current = user.currentMembership || {};
      return {
        _id:                  user._id,
        userId:               user._id,
        name:                 user.name        || '-',
        branch:               user.branchIds?.length > 0 ? user.branchIds[0]?.name : '-',
        phoneNumber:          user.phoneNumber || '-',
        countryCode:          member.countryCode || '',
        profile:              member.photo     || null,
        gender:               member.gender    || '-',
        plan:                 current.planName || member.currentPlan || '-',
        salesPerson:          Array.isArray(user.salesPerson) && user.salesPerson.length > 0
                                ? user.salesPerson.map((s: any) => s?.name).filter(Boolean).join(', ') || '-'
                                : '-',
        membershipId:         current.membershipId || undefined,
        trainer:              current.assignedTrainer?.name || current.assignedTrainer?.user?.name || '-',
        trainerId:            current.assignedTrainer?._id || current.assignedTrainer || member.assignedTrainer || undefined,
        totalAssessments:     current.numberOfAssessment   ?? 0,
        completedAssessments: current.completedAssessments ?? 0,
        status:               member.assessmentStatus || '-',
      };
    });
  }, [apiData]);

  const statusCounts = (apiData as any)?.statusCounts || {};
  const tabsData = [
    { key: 'all',      label: 'All',          count: statusCounts.all      ?? (apiData as any)?.total ?? 0 },
    { key: 'active',   label: 'Active',       count: statusCounts.active   ?? 0 },
    { key: 'pending',  label: 'Pending',      count: statusCounts.pending  ?? 0 },
    { key: 'inactive', label: 'Inactive',     count: statusCounts.inactive ?? 0 },
    { key: 'freezed',  label: 'Freezed',      count: statusCounts.freezed  ?? 0 },
    { key: 'advance',  label: 'Advance',      count: statusCounts.advance  ?? 0 },
    { key: 'blocked',  label: 'Black listed', count: statusCounts.blocked  ?? 0 },
  ];

  // trainer list for the per-row assign dropdown (drop the leading "All Trainers" filter entry)
  const assignTrainerOptions = useMemo(() => trainerOptions.filter(o => o.value !== 'all'), [trainerOptions]);

  const [assignAssessment, { isLoading: assigning }] = useAssignAssessmentMutation();
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const doAssign = async (userId: string, trainerId: string) => {
    setAssigningId(userId);
    try {
      await assignAssessment({ userId, trainerId }).unwrap();
      message.success('Trainer assigned for assessment');
    } catch {
      message.error('Failed to assign trainer');
    } finally {
      setAssigningId(null);
    }
  };

  const handleAssignTrainer = (userId: string, trainerId: string) => {
    const trainerName = assignTrainerOptions.find(o => o.value === trainerId)?.label || 'this trainer';
    Modal.confirm({
      title: 'Assign trainer for assessment?',
      content: `Assign ${trainerName} to this user's assessment?`,
      okText: 'Assign',
      cancelText: 'Cancel',
      onOk: () => doAssign(userId, trainerId),
    });
  };

  const columnsWithHandlers = getAssessmentColumns(hasPermission, dialCodeMap, {
    trainerOptions:  assignTrainerOptions,
    onAssignTrainer: handleAssignTrainer,
    assigningId:     assigning ? assigningId : null,
  });
  const columns = columnsWithHandlers.filter((col: any) => visibleColumns[col.key as keyof VisibleColumns]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey as keyof VisibleColumns] }));
  };

  return (
    <div className="user-assessment-page">
      <div className="header-section">
        
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search assessments..." />
          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabsData} />
   
          <Select
            value={trainerId}
            onChange={(val: string) => { setTrainerId(val); setPage(1); }}
            options={trainerOptions}
            showSearch
            optionFilterProp="label"
            style={{ width: 170, height: 41 }}
            placeholder="All Trainers"
          />
          <Select
            value={statusType}
            onChange={(val: string) => { setStatusType(val); setPage(1); }}
            options={STATUS_OPTIONS}
            style={{ width: 160, height: 41 }}
            placeholder="All Assessments"
          />
          <DateRangeSelector onChange={(range: FilterDateRange) => { setDateRange(range); setPage(1); }} />
          <ColumnVisibility
            columns={columnsWithHandlers}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
      </div>

      <div className="users-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={assessmentData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: any) => record._id || record.id}
          scroll={{ x: 900 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={(apiData as any)?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default UserAssessment;
