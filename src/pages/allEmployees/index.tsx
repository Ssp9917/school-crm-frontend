import { useState, useMemo, useRef } from "react";
import usePermissions from "../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Select, Modal } from "antd";
import { AddEmployeeRoute, EmployeeDetailAttendanceRoute } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import AddButton from "../../components/addButton";
import CommonTable from '../../components/commonTable';
import "./styles.scss";
import { useGetEmployeeQuery, useUpdateEmployeeStatusMutation, useVerifyEmployeeMutation, useUnverifyEmployeeMutation } from "../../services/employee";
import { useGetRolesByLevelQuery } from "../../services/role";
import { getEmployeeColumns, EmployeeRecord } from './columns';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface VisibleColumns {
  name:        boolean;
  email:       boolean;
  designation: boolean;
  phoneNumber: boolean;
  branchName:  boolean;
  profile:     boolean;
  status:      boolean;
  view:        boolean;
  actions:     boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllEmployees = () => {
  const branchId         = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object'
    ? (branchId?._id || branchId?.id)
    : branchId;

  const { hasPermission } = usePermissions();

  const navigate = useNavigate();
  const [page,               setPage]               = useState(1);
  const [limit,              setLimit]              = useState(10);
  const [searchText,         setSearchText]         = useState("");
  const [activeTab,          setActiveTab]          = useState("all");
  const [statusLoading,      setStatusLoading]      = useState<string | null>(null);
  const [designationFilter,  setDesignationFilter]  = useState("all");

  const { data: employeesData, isLoading, refetch } = useGetEmployeeQuery({
    page,
    limit,
    search:      searchText          || undefined,
    status:      activeTab !== 'all' ? activeTab.toUpperCase() : undefined,
    branchId:    selectedBranchId    || undefined,
    designation: designationFilter !== 'all' ? designationFilter : undefined,
  } as any);
  const [updateEmployeeStatus] = useUpdateEmployeeStatusMutation();
  const [verifyEmployee]       = useVerifyEmployeeMutation();
  const [unverifyEmployee]     = useUnverifyEmployeeMutation();
  const [showPasswordModal,  setShowPasswordModal]  = useState(false);
  const [selectedEmployee,   setSelectedEmployee]   = useState<EmployeeRecord | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name:        true,
    email:       true,
    designation: true,
    phoneNumber: true,
    branchName:  true,
    profile:     true,
    status:      true,
    view:        true,
    actions:     true,
  });

  const handleView = (record: EmployeeRecord) => {
    navigate(`/employee-detail/${record._id}/${EmployeeDetailAttendanceRoute}`);
  };

  const handleEdit = (_record: EmployeeRecord) => {
    // navigate handled inside columns via EditEmployeeRoute
  };

  const handleDelete = (_record: EmployeeRecord) => {
    // TODO: confirmation modal + delete API
  };

  const handleChangePassword = (record: EmployeeRecord) => {
    setSelectedEmployee(record);
    setShowPasswordModal(true);
  };

  const handleVerify = (record: EmployeeRecord) => {
    if (!record._id) return;
    Modal.confirm({
      title:   'Verify Employee',
      content: <p>Are you sure you want to verify <strong>{record.name}</strong>?</p>,
      okText:  'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await (verifyEmployee as any)(record._id).unwrap();
          refetch();
        } catch {
          /* error toast handled globally by badRequestHandler */
        }
      },
    });
  };

  const handleUnverify = (record: EmployeeRecord) => {
    if (!record._id) return;
    Modal.confirm({
      title:   'Unverify Employee',
      content: <p>Are you sure you want to unverify <strong>{record.name}</strong>?</p>,
      okText:  'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await (unverifyEmployee as any)(record._id).unwrap();
          refetch();
        } catch {
          /* error toast handled globally by badRequestHandler */
        }
      },
    });
  };

  const handleStatusToggle = async (record: EmployeeRecord, checked: boolean) => {
    setStatusLoading(record._id ?? null);
    try {
      const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
      await (updateEmployeeStatus as any)({ id: record._id, status: newStatus }).unwrap();
    } catch (err) {
      console.error('Error updating employee status:', err);
    } finally {
      setStatusLoading(null);
    }
  };

  const allColumns = getEmployeeColumns(
    handleView,
    handleEdit,
    handleDelete,
    handleChangePassword,
    navigate,
    handleStatusToggle,
    statusLoading,
    hasPermission('8-1-edit'),
    hasPermission('8-1-delete'),
    hasPermission('8-1-change-password'),
    hasPermission('8-1-status'),
    hasPermission('8-1-view-profile'),
    hasPermission('EMPLOYEE_VERIFY'),
    hasPermission('EMPLOYEE_UNVERIFY'),
    handleVerify,
    handleUnverify,
  );

  const columns = allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof VisibleColumns],
    }));
  };

  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    setSelectedEmployee(null);
  };

  /* designation = role name; options roles API se aate hain, saath me
     current page ke employees ki designations bhi merge kar lete hain */
  const { data: rolesData } = useGetRolesByLevelQuery(undefined);
  const seenDesignations = useRef<Set<string>>(new Set());
  const uniqueDesignations = useMemo<string[]>(() => {
    const roles = (rolesData as any)?.data;
    if (Array.isArray(roles)) {
      roles.forEach((r: any) => { if (r?.name) seenDesignations.current.add(r.name); });
    }
    const rows = (employeesData as any)?.data;
    if (rows) {
      rows.forEach((emp: any) => {
        const d = emp.designation || emp.user?.roleId?.name;
        if (d) seenDesignations.current.add(d);
      });
    }
    return [...seenDesignations.current];
  }, [rolesData, employeesData]);

  const mappedEmployees = useMemo<EmployeeRecord[]>(() => {
    const rows = (employeesData as any)?.data;
    if (!rows) return [];
    return rows.map((emp: any): EmployeeRecord => ({
      _id:         emp.user?._id,
      name:        emp.user?.name              || '-',
      email:       emp.user?.email             || '-',
      designation: emp.designation || emp.user?.roleId?.name || '-',
      phoneNumber: emp.user?.phoneNumber       || '-',
      branches:    emp.user?.branchIds         || [],
      profile:     emp.photo,
      status:      emp.user?.status?.toLowerCase() || emp.status?.toLowerCase() || '-',
      isVerified:     emp.user?.isVerified ?? false,
      verifiedByName: emp.user?.verifiedBy?.name || null,
      view:        '',
      actions:     '',
    }));
  }, [employeesData]);

  const totalCount = (employeesData as any)?.total || 0;

  const tabsData = [
    { key: 'all',      label: 'All',      count: activeTab === 'all'      ? totalCount : 0 },
    { key: 'active',   label: 'Active',   count: activeTab === 'active'   ? totalCount : 0 },
    { key: 'inactive', label: 'Inactive', count: activeTab === 'inactive' ? totalCount : 0 },
  ];

  const designationOptions = [
    { value: 'all', label: 'All Designations' },
    ...uniqueDesignations.map(d => ({ value: d, label: d })),
  ];

  return (
    <div className="all-employees-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={(v: string) => { setSearchText(v); setPage(1); }}
            placeholder="Search employees..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(t: string) => { setActiveTab(t); setPage(1); }}
            tabs={tabsData}
          />
          <Select
            value={designationFilter}
            onChange={(value: string) => { setDesignationFilter(value); setPage(1); }}
            className="designation-filter"
            style={{ height: 41 }}
            options={designationOptions}
          />
        </div>
        <div className="right-col">
          {hasPermission('8-1-add') && (
            <AddButton to={AddEmployeeRoute}>Add Employee</AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="employees-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={mappedEmployees}
          loading={isLoading}
          rowKey={(record: EmployeeRecord) => record._id || record.id || ''}
          scroll={{ x: 1200 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={totalCount}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onCancel={handlePasswordModalCancel}
        selectedUser={selectedEmployee}
        userType="employee"
      />
    </div>
  );
};

export default AllEmployees;
