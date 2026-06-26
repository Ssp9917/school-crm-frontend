import { useMemo, useState } from "react";
import { Modal, Carousel, Tag, Select, Button } from "antd";
import QRModal from "../../components/modals/QRModal";
import DepartmentModal from "../../components/modals/DepartmentModal";
import {
  useAssignToMutation,
  useGetAllFeedbacksQuery,
  useGetEmployeesByBranchQuery,
  useUpdateFeedbackStatusMutation,
} from "../../services/feedbacks";
import usePermissions from "../../hooks/usePermissions";
import { useGetDepartmentsQuery } from "../../services/departments";
import CommonTable from "../../components/commonTable";
import CustomPagination from "../../components/pagination";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import "./styles.scss";
import { useSelector } from "react-redux";
import StatusTabs from "../../components/statusTabs";
import { getColumns, FeedbackRow, Employee } from "./colums";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface RawFeedback {
  _id?:          string;
  ticketId?:     string;
  departmentId?: { name?: string };
  department?:   string;
  branchId?:     { name?: string };
  branch?:       string;
  customerName?: string;
  name?:         string;
  mobileNumber?: string;
  phoneNumber?:  string;
  phone?:        string;
  email?:        string;
  messageText?:  string;
  feedback?:     string;
  message?:      string;
  images?:       string[];
  staffBehavior?: string | number;
  gymHygiene?:   string | number;
  dateTime?:     string;
  createdAt?:    string;
  status?:       string;
  assignTo?: {
    _id?:  string;
    user?: { name?: string };
  };
}

interface StatusTab {
  key:    string;
  label?: string;
  count?: number;
}

/* ─── Module-level helpers ───────────────────────────────────────────── */

function getSentiment(feedback: string | undefined): string {
  if (!feedback) return "neutral";
  const text = feedback.toLowerCase();
  if (/(accha|good|excellent|awesome|best|satisfied|great|very good|nice|helpful|supportive|positive)/.test(text)) return "good";
  if (/(bura|bad|poor|worst|not good|disappointed|negative|rude|problem|issue|complain|complaint)/.test(text)) return "bad";
  return "neutral";
}

function mapFeedbackToRow(fb: RawFeedback, idx: number): FeedbackRow {
  const assignToId   = fb.assignTo?._id;
  const assignToName = fb.assignTo?.user?.name;
  const feedbackText = fb.messageText || fb.feedback || fb.message || "-";
  return {
    key:           fb._id || idx,
    ticketId:      fb.ticketId      || "-",
    department:    fb.departmentId?.name || fb.department || "-",
    branch:        fb.branchId?.name     || fb.branch     || "-",
    customerName:  fb.customerName || fb.name         || "-",
    mobileNumber:  fb.mobileNumber || fb.phoneNumber  || fb.phone || "-",
    email:         fb.email        || "-",
    feedback:      feedbackText,
    sentiment:     getSentiment(feedbackText),
    images:        fb.images        || [],
    staffBehavior: fb.staffBehavior || "-",
    gymHygiene:    fb.gymHygiene    || "-",
    dateTime:      fb.dateTime
      ? new Date(fb.dateTime).toLocaleString()
      : fb.createdAt
        ? new Date(fb.createdAt).toLocaleString()
        : "-",
    status:        fb.status     || "-",
    assignToId,
    assignToName,
  };
}

const defaultVisibleColumns = getColumns(() => {}, () => {}, [])
  .reduce<Record<string, boolean>>((acc, col) => {
    acc[col.key] = true;
    return acc;
  }, {});

/* ─── Component ──────────────────────────────────────────────────────── */

const AllFeedbacks = () => {
  const branchId        = useSelector((state: any) => state.branch.selectedBranch);
  const { hasPermission } = usePermissions();

  const [searchText,       setSearchText]       = useState("");
  const [visibleColumns,   setVisibleColumns]   = useState<Record<string, boolean>>(defaultVisibleColumns);
  const [qrModalOpen,      setQrModalOpen]      = useState(false);
  const [deptModalOpen,    setDeptModalOpen]    = useState(false);
  const [feedbackModal,    setFeedbackModal]    = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });
  const [imageModal,       setImageModal]       = useState<{ open: boolean; images: string[]; index: number }>({ open: false, images: [], index: 0 });
  const [activeTab,        setActiveTab]        = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [page,             setPage]             = useState(1);
  const [pageSize,         setPageSize]         = useState(10);

  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartmentsQuery(undefined);
  const { data, isLoading } = useGetAllFeedbacksQuery({
    status:     activeTab === 'all' ? undefined : activeTab,
    department: selectedDepartment || undefined,
    branchId:   branchId           || undefined,
    page,
    limit:      pageSize,
  } as any);
  const [assignTo]            = useAssignToMutation();
  const { data: employeesData } = useGetEmployeesByBranchQuery(branchId);
  const [updateFeedbackStatus] = useUpdateFeedbackStatusMutation();

  const feedbacks = useMemo<FeedbackRow[]>(() => {
    const rows = (data as any)?.data;
    if (!Array.isArray(rows)) return [];
    return rows.map((fb: RawFeedback, idx: number) => mapFeedbackToRow(fb, idx));
  }, [data]);

  const employees = useMemo<Employee[]>(() => {
    const rows = (employeesData as any)?.data;
    return Array.isArray(rows) ? rows : [];
  }, [employeesData]);

  const handleAssignTo = async (selectedValue: string, feedbackId: string | number) => {
    try {
      await (assignTo as any)({ assignTo: selectedValue, feedbackId }).unwrap();
    } catch (err) {
      console.error("Failed to assign employee:", err);
    }
  };

  const handleStatusChange = async (status: string, feedbackId: string | number) => {
    try {
      await (updateFeedbackStatus as any)({ feedbackId, status }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusTabs = useMemo<StatusTab[]>(() => {
    const counts = (data as any)?.counts;
    if (Array.isArray(counts)) {
      return counts.map((tab: StatusTab) => ({
        ...tab,
        key: tab.key === 'in_process' ? 'in_progress' : tab.key,
      }));
    }
    return [
      { key: "all",         label: "All",         count: 0 },
      { key: "pending",     label: "Pending",      count: 0 },
      { key: "in_progress", label: "In Progress",  count: 0 },
      { key: "completed",   label: "Completed",    count: 0 },
    ];
  }, [data]);

  const filteredFeedbacks = useMemo<FeedbackRow[]>(() => {
    if (!searchText) return feedbacks;
    const q = searchText.toLowerCase();
    return feedbacks.filter(fb =>
      Object.values(fb).some(val => typeof val === "string" && val.toLowerCase().includes(q))
    );
  }, [feedbacks, searchText]);

  const visibleCols = getColumns(
    row           => setFeedbackModal({ open: true, msg: row.feedback }),
    (imgs, idx)   => setImageModal({ open: true, images: imgs, index: idx }),
    employees,
    handleAssignTo,
    handleStatusChange,
  ).filter(col => visibleColumns[col.key]);

  const handleColumnToggle = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const pagination = (data as any)?.pagination;
  const deptOptions = (departmentsData as any)?.data
    ?.filter((d: any) => d.status === 'active')
    .map((d: any) => ({ label: d.name, value: d._id })) ?? [];

  return (
    <div className="all-feedbacks-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search feedbacks..." />
          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={statusTabs} />
        </div>
        <div className="right-col">
          <Select
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={deptOptions}
            placeholder="Select Department"
            className="select-department"
            allowClear
            loading={departmentsLoading}
            style={{ width: 180 }}
          />
          {hasPermission('21-1-create-dep') && (
            <Button className="create-dept-btn" style={{ fontWeight: 500 }} type="default" onClick={() => setDeptModalOpen(true)}>
              Create Department
            </Button>
          )}
          {hasPermission('21-1-create-qr') && (
            <Button className="generate-qr-btn" style={{ fontWeight: 500 }} onClick={() => setQrModalOpen(true)}>
              Create QR
            </Button>
          )}
          <ColumnVisibility
            columns={getColumns(() => {}, () => {}, [])}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="feedbacks-table-wrapper">
        <CommonTable
          columns={visibleCols}
          dataSource={filteredFeedbacks}
          loading={isLoading}
          rowKey="key"
          scroll={{ x: 1200 }}
        />
        <CustomPagination
          current={pagination?.page     || page}
          pageSize={pagination?.limit   || pageSize}
          total={pagination?.total      || 0}
          onPageChange={p    => setPage(p)}
          onPageSizeChange={size => { setPageSize(size); setPage(1); }}
        />
      </div>

      <QRModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      <DepartmentModal open={deptModalOpen} onClose={() => setDeptModalOpen(false)} />

      <Modal
        open={feedbackModal.open}
        onCancel={() => setFeedbackModal({ open: false, msg: "" })}
        footer={null}
        centered
        title={null}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Feedback Message</div>
          <div style={{ fontSize: 17, color: '#444', textAlign: 'center', wordBreak: 'break-word', padding: '8px 0 24px' }}>
            {feedbackModal.msg}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button type="primary" onClick={() => setFeedbackModal({ open: false, msg: "" })}>OK</Button>
        </div>
      </Modal>

      <Modal
        open={imageModal.open}
        onCancel={() => setImageModal({ open: false, images: [], index: 0 })}
        footer={null}
        centered
        width={600}
        title={null}
        styles={{ body: { padding: 0 } }}
      >
        <Carousel
          initialSlide={imageModal.index}
          dots={true}
          style={{ width: '100%', textAlign: 'center', background: '#000', borderRadius: 12 }}
        >
          {imageModal.images.map((img, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <img src={img} alt={`slide-${i}`} style={{ maxHeight: 380, maxWidth: '100%', objectFit: 'contain', margin: '0 auto' }} />
            </div>
          ))}
        </Carousel>
      </Modal>
    </div>
  );
};

export default AllFeedbacks;
