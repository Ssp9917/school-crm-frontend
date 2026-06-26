import { useState } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import usePermissions from "../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { AddGeneralStaffRoute, GeneralStaffDetailAttendanceRoute } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import { getGeneralStaffColumns, StaffRecord } from "./columns";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import AddButton from "../../components/addButton";
import "./styles.scss";
import { useGetGeneralStaffQuery, useUpdateGeneralStaffStatusMutation, useVerifyGeneralStaffMutation, useUnverifyGeneralStaffMutation } from "../../services/generalStaff";
import CommonTable from "../../components/commonTable";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface VisibleColumns {
  name:        boolean;
  role:        boolean;
  phoneNumber: boolean;
  branchName:  boolean;
  profile:     boolean;
  status:      boolean;
  view:        boolean;
  actions:     boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllGeneralStaff = () => {
  const navigate = useNavigate();
  const [page,                   setPage]                   = useState(1);
  const [limit,                  setLimit]                  = useState(10);
  const [searchText,             setSearchText]             = useState("");
  const [activeTab,              setActiveTab]              = useState("all");
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [selectedUser,           setSelectedUser]           = useState<StaffRecord | null>(null);
  const [statusLoading,          setStatusLoading]          = useState<string | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name:        true,
    role:        true,
    phoneNumber: true,
    branchName:  true,
    profile:     true,
    status:      true,
    view:        true,
    actions:     true,
  });

  const branchId         = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const { data: staffData, isLoading } = useGetGeneralStaffQuery({
    page,
    limit,
    search:   searchText          || undefined,
    status:   activeTab !== 'all' ? activeTab.toUpperCase() : undefined,
    branchId: selectedBranchId    || undefined,
  } as any);
  const [updateGeneralStaffStatus] = useUpdateGeneralStaffStatusMutation();
  const [verifyGeneralStaff]       = useVerifyGeneralStaffMutation();
  const [unverifyGeneralStaff]     = useUnverifyGeneralStaffMutation();

  const { hasPermission } = usePermissions();

  const handleView = (record: StaffRecord) => {
    const id = record._id || record.id;
    if (id) navigate(`/general-staff-detail/${id}/${GeneralStaffDetailAttendanceRoute}`);
  };

  const handleVerify = (record: StaffRecord) => {
    const id = record._id || record.id;
    if (!id) return;
    Modal.confirm({
      title:   'Verify General Staff',
      content: <p>Are you sure you want to verify <strong>{record.name}</strong>?</p>,
      okText:  'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await (verifyGeneralStaff as any)(id).unwrap();
        } catch {
          /* error toast handled globally by badRequestHandler */
        }
      },
    });
  };

  const handleUnverify = (record: StaffRecord) => {
    const id = record._id || record.id;
    if (!id) return;
    Modal.confirm({
      title:   'Unverify General Staff',
      content: <p>Are you sure you want to unverify <strong>{record.name}</strong>?</p>,
      okText:  'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await (unverifyGeneralStaff as any)(id).unwrap();
        } catch {
          /* error toast handled globally by badRequestHandler */
        }
      },
    });
  };

  const handleEdit = (record: StaffRecord) => {
    navigate(`/edit-general-staff/${record._id || record.id}`);
  };

  const handleDelete = (_record: StaffRecord) => {
    // TODO: confirmation modal + delete API
  };

  const handleChangePassword = (record: StaffRecord) => {
    setSelectedUser(record);
    setIsPasswordModalVisible(true);
  };

  const handleStatusToggle = async (id: string, checked: boolean) => {
    setStatusLoading(id);
    try {
      const status = checked ? 'ACTIVE' : 'INACTIVE';
      await (updateGeneralStaffStatus as any)({ id, status }).unwrap();
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setStatusLoading(null);
    }
  };

  const allColumns = getGeneralStaffColumns(
    handleView,
    handleVerify,
    handleEdit,
    handleDelete,
    handleChangePassword,
    handleStatusToggle,
    statusLoading,
    hasPermission('8-2-edit'),
    hasPermission('8-2-delete'),
    hasPermission('8-2-change-password'),
    hasPermission('8-2-status'),
    hasPermission('GENERAL_STAFF_VERIFY'),
    hasPermission('8-2-view-profile'),
    hasPermission('GENERAL_STAFF_UNVERIFY'),
    handleUnverify,
  );

  const columns = allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof VisibleColumns],
    }));
  };

  const mappedData: StaffRecord[] = (staffData as any)?.data?.map((item: any): StaffRecord => {
    let branchName = '-';
    if (Array.isArray(item.user?.branchIds) && item.user.branchIds.length > 0) {
      branchName = item.user.branchIds.map((b: { name?: string }) => b.name).join(', ');
    }
    return {
      ...item,
      name:        item.user?.name        || '-',
      phoneNumber: item.user?.phoneNumber || '-',
      role:        item.department        || '-',
      branchName,
      status:      item.status?.toLowerCase() || item.user?.status || 'inactive',
      isVerified:     item.user?.isVerified ?? item.isVerified ?? false,
      verifiedByName: item.user?.verifiedBy?.name || item.verifiedBy?.name || null,
      staffId:     item.staffId    || '-',
      address:     item.address    || '-',
      idType:      item.idType     || '-',
      idNumber:    item.idNumber   || '-',
      idFront:     item.idFront    || '',
      idBack:      item.idBack     || '',
      photo:       item.photo      || '',
      joiningDate: item.joiningDate || '',
    };
  }) || [];

  const totalCount = (staffData as any)?.total || 0;

  const tabsData = [
    { key: 'all',      label: 'All',      count: activeTab === 'all'      ? totalCount : 0 },
    { key: 'active',   label: 'Active',   count: activeTab === 'active'   ? totalCount : 0 },
    { key: 'inactive', label: 'Inactive', count: activeTab === 'inactive' ? totalCount : 0 },
  ];

  return (
    <div className="all-general-staff-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={(v: string) => { setSearchText(v); setPage(1); }}
            placeholder="Search general staff..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(t: string) => { setActiveTab(t); setPage(1); }}
            tabs={tabsData}
          />
        </div>
        <div className="right-col">
          {hasPermission('8-2-add') && (
            <AddButton to={AddGeneralStaffRoute}>Add General Staff</AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="staff-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={mappedData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: StaffRecord) => record._id || record.id || ''}
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
        visible={isPasswordModalVisible}
        onCancel={() => { setIsPasswordModalVisible(false); setSelectedUser(null); }}
        selectedUser={selectedUser?.user}
      />
    </div>
  );
};

export default AllGeneralStaff;
