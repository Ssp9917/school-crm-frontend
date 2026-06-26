import { useState, useMemo } from "react";
import { Tag, Image, Select } from "antd";
import { Link } from "react-router-dom";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import CommonTable from "../../components/commonTable";
import DateRangeSelector from "../../components/dateRange/DateRangeSelector";
import { useGetAllAddonSessionsQuery } from "../../services/membership";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface SessionRow {
  _id:         string;
  sNo:         number;
  name:        string;
  branch:      string;
  phoneNumber: string;
  profile:     string | null;
  serviceType: string;
  trainer:     string;
  sessionDate: string;
  duration:    string;
  status:      string;
  memberId?:   string;
}

interface DateRange {
  startDate?: string;
  endDate?:   string;
}

interface VisibleColumns {
  sNo:         boolean;
  branch:      boolean;
  profile:     boolean;
  name:        boolean;
  phoneNumber: boolean;
  serviceType: boolean;
  trainer:     boolean;
  sessionDate: boolean;
  duration:    boolean;
  status:      boolean;
}

/* ─── Module-level constants & helpers ───────────────────────────────── */

const typeOptions = [
  { label: "All Types",          value: "all"               },
  { label: "Personal Training",  value: "personal_training" },
  { label: "Pilates",            value: "pilates"           },
  { label: "Therapy",            value: "therapy"           },
  { label: "EMS",                value: "ems"               },
  { label: "MMA",                value: "mma"               },
];

function statusColor(status: string): string {
  switch (status) {
    case "in_progress": return "blue";
    case "paused":      return "orange";
    case "completed":   return "green";
    case "pending":     return "default";
    case "cancelled":   return "red";
    default:            return "default";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "in_progress": return "Live";
    case "paused":      return "Paused";
    case "completed":   return "Completed";
    case "pending":     return "Pending";
    case "cancelled":   return "Cancelled";
    default:            return status || "N/A";
  }
}

const toISODate = (date?: string): string | undefined =>
  date ? new Date(date).toISOString().split("T")[0] : undefined;

/* ─── Component ──────────────────────────────────────────────────────── */

const AllSessions = () => {
  const [page,         setPage]         = useState(1);
  const [limit,        setLimit]        = useState(10);
  const [searchText,   setSearchText]   = useState("");
  const [activeTab,    setActiveTab]    = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [dateRange,    setDateRange]    = useState<DateRange | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    sNo:         true,
    branch:      true,
    profile:     true,
    name:        true,
    phoneNumber: true,
    serviceType: true,
    trainer:     true,
    sessionDate: true,
    duration:    true,
    status:      true,
  });

  const { data, isLoading } = useGetAllAddonSessionsQuery({
    status:   activeTab !== "all" ? activeTab : undefined,
    fromDate: toISODate(dateRange?.startDate),
    toDate:   toISODate(dateRange?.endDate),
    page,
    limit,
  } as any);

  const apiData = data as any;

  const sessionsData = useMemo<SessionRow[]>(() => {
    const rows: any[] = apiData?.data || [];
    return rows.map((session: any, index: number): SessionRow => ({
      _id:         session.sessionId || `row-${index}`,
      sNo:         (page - 1) * limit + index + 1,
      name:        session.memberName  || "-",
      branch:      session.branch      || "-",
      phoneNumber: session.memberPhone || "-",
      profile:     session.memberPhoto || null,
      serviceType: session.serviceType || "-",
      trainer:     session.trainerName || "-",
      sessionDate: session.sessionDate
        ? new Date(session.sessionDate).toLocaleDateString("en-GB")
        : "-",
      duration: session.activeDurationMinutes
        ? `${session.activeDurationMinutes} min`
        : "-",
      status:   session.status || "-",
      memberId: session.userId,
    }));
  }, [apiData, page, limit]);

  const filteredData = useMemo<SessionRow[]>(() => {
    let rows = sessionsData;
    if (searchText)
      rows = rows.filter(s =>
        s.name.toLowerCase().includes(searchText.toLowerCase()) ||
        s.phoneNumber.includes(searchText) ||
        s.trainer.toLowerCase().includes(searchText.toLowerCase())
      );
    if (selectedType !== "all")
      rows = rows.filter(s => s.serviceType === selectedType);
    return rows;
  }, [sessionsData, searchText, selectedType]);

  const tabsData = [
    { key: "all",         label: "All",       count: apiData?.total               || 0 },
    { key: "in_progress", label: "Live",      count: apiData?.summary?.inProgress || 0 },
    { key: "paused",      label: "Paused",    count: apiData?.summary?.paused     || 0 },
    { key: "completed",   label: "Completed", count: apiData?.summary?.completed  || 0 },
    { key: "cancelled",   label: "Cancelled", count: apiData?.summary?.cancelled  || 0 },
  ];

  const allColumns = [
    { title: "S.No",         dataIndex: "sNo",         key: "sNo",         width: 70,  align: "center" as const },
    { title: "Branch",       dataIndex: "branch",      key: "branch",      width: 160 },
    {
      title:     "Profile",
      dataIndex: "profile",
      key:       "profile",
      width:     80,
      render:    (url: string) => (
        <Image
          src={url || "https://via.placeholder.com/40"}
          alt="profile"
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
          preview={false}
        />
      ),
    },
    {
      title:     "Name",
      dataIndex: "name",
      key:       "name",
      width:     150,
      render:    (name: string, record: SessionRow) =>
        record.memberId ? (
          <Link to={`/user-detail/${record.memberId}/attendance`} style={{ color: "inherit", textDecoration: "none" }}>
            {name ? name.charAt(0).toUpperCase() + name.slice(1) : "-"}
          </Link>
        ) : (name || "-"),
    },
    { title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber", width: 130 },
    {
      title:     "Service Type",
      dataIndex: "serviceType",
      key:       "serviceType",
      width:     150,
      render:    (type: string) => (
        <span style={{ textTransform: "capitalize" }}>
          {type ? type.replace(/_/g, " ") : "-"}
        </span>
      ),
    },
    { title: "Trainer",      dataIndex: "trainer",     key: "trainer",     width: 150 },
    { title: "Session Date", dataIndex: "sessionDate", key: "sessionDate", width: 130 },
    { title: "Duration",     dataIndex: "duration",    key: "duration",    width: 110, align: "center" as const },
    {
      title:     "Status",
      dataIndex: "status",
      key:       "status",
      width:     110,
      align:     "center" as const,
      render:    (status: string) => (
        <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>
      ),
    },
  ];

  const columns = allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  return (
    <div className="all-users-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={(val: string) => { setSearchText(val); setPage(1); }}
            placeholder="Search by name, phone, trainer..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(tab: string) => { setActiveTab(tab); setPage(1); }}
            tabs={tabsData}
          />
        </div>
        <div className="right-col">
          <DateRangeSelector onChange={(range: DateRange | null) => { setDateRange(range); setPage(1); }} />
          <Select
            value={selectedType}
            onChange={setSelectedType}
            style={{ width: 180, height: 41 }}
            options={typeOptions}
          />
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={(key: string) =>
              setVisibleColumns(prev => ({ ...prev, [key]: !prev[key as keyof VisibleColumns] }))
            }
          />
        </div>
      </div>

      <div className="users-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: SessionRow) => record._id}
          scroll={{ x: 1200 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={apiData?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default AllSessions;
