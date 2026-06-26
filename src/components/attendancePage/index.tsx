import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import SearchBar from '../searchBar';
import ColumnVisibility from '../columnVisibility';
import CommonTable from '../commonTable';
import CustomPagination from '../pagination';
import DateRangeSelector from '../dateRange/DateRangeSelector';
import { useGetAttendanceQuery } from '../../services/attendance';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface AttendancePageProps {
  userType: string;
  title:    string;
  userId?:  string;
}

type VisibleColumns = Record<string, boolean>;

/* ─── Constants ──────────────────────────────────────────────────────── */

const ALL_COLUMNS = [
  {
    title:     'Name',
    key:       'name',
    width:     160,
    render:    (_: unknown, record: any) =>
      record.userId?.name || record.name || '—',
  },
  {
    title:     'Mobile',
    key:       'mobile',
    width:     140,
    render:    (_: unknown, record: any) =>
      record.userId?.phoneNumber || record.userId?.mobile || record.phoneNumber || record.mobile || '—',
  },
  {
    title:     'Date & Time',
    key:       'dateTime',
    width:     170,
    render:    (_: unknown, record: any) => {
      const raw = record.logTime || record.createdAt || record.dateTime;
      return raw ? dayjs(raw).format('DD MMM YYYY, hh:mm A') : '—';
    },
  },
  {
    title:     'Record Purpose',
    key:       'recordPurpose',
    width:     150,
    render:    (_: unknown, record: any) => {
      const purpose = record.machineObjectId?.recordPurpose || record.recordPurpose || record.purpose || '';
      const upper   = purpose.toString().toUpperCase();
      const color   = upper === 'IN' ? 'green' : upper === 'OUT' ? 'red' : 'default';
      return purpose ? <Tag color={color}>{upper}</Tag> : '—';
    },
  },
  {
    title:     'Branch',
    key:       'branch',
    width:     160,
    render:    (_: unknown, record: any) =>
      record.branchId?.name || record.branchName || '—',
  },
  {
    title:     'Floor',
    key:       'floor',
    width:     130,
    render:    (_: unknown, record: any) =>
      record.machineObjectId?.floor || record.branchId?.floor || record.branchFloor || '—',
  },
];

const INITIAL_VISIBLE: VisibleColumns = {
  name: true, mobile: true, dateTime: true,
  recordPurpose: true, branch: true, floor: true,
};

/* ─── Component ──────────────────────────────────────────────────────── */

const AttendancePage = ({ userType, userId }: AttendancePageProps) => {
  const branchId         = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object'
    ? (branchId?._id || branchId?.id)
    : branchId;

  const [page,           setPage]           = useState(1);
  const [limit,          setLimit]          = useState(10);
  const [search,         setSearch]         = useState('');
  const [startDate,      setStartDate]      = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [endDate,        setEndDate]        = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(INITIAL_VISIBLE);

  const { data: attendanceData, isFetching } = useGetAttendanceQuery({
    userType,
    userId,
    startDate,
    endDate,
    branchId: selectedBranchId || undefined,
    page,
    limit,
    search: search || undefined,
  });

  const dataSource  = (attendanceData as any)?.data || [];
  const totalCount  = (attendanceData as any)?.pagination?.total || 0;

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  const handleDateRangeChange = (selection: { startDate: Date; endDate: Date }) => {
    setStartDate(dayjs(selection.startDate).format('YYYY-MM-DD'));
    setEndDate(dayjs(selection.endDate).format('YYYY-MM-DD'));
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const columns = useMemo(
    () => ALL_COLUMNS.filter(col => visibleColumns[col.key]),
    [visibleColumns],
  );

  return (
    <div className="att-page">
      <div className="att-header">
        <div className="att-header-left">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search..."
          />
          <DateRangeSelector onChange={handleDateRangeChange} />
        </div>
        <div className="att-header-right">
          <ColumnVisibility
            columns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <CommonTable
        columns={columns}
        dataSource={dataSource}
        loading={isFetching}
        rowKey={(record: any) => record._id || record.id || Math.random()}
        scroll={{ x: 900 }}
        sticky={{ offsetHeader: 0 }}
      />

      <CustomPagination
        current={page}
        pageSize={limit}
        total={totalCount}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default AttendancePage;
