import { useState } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AddTrainerRoute, TrainerDetailAttendanceRoute } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import { useGetTrainersQuery, useUpdateTrainerStatusMutation, useVerifyTrainerMutation, useUnverifyTrainerMutation } from "../../services/trainer";
import { getTrainerColumns, TrainerRecord } from "./columns";
import CommonTable from "../../components/commonTable";
import usePermissions from "../../hooks/usePermissions";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface VisibleColumns {
  branchName:        boolean;
  name:              boolean;
  designation:       boolean;
  phoneNumber:       boolean;
  email:             boolean;
  expertise:         boolean;
  yearsOfExperience: boolean;
  profile:           boolean;
  status:            boolean;
  view:              boolean;
  actions:           boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllTrainers = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [page,              setPage]              = useState(1);
  const [limit,             setLimit]             = useState(10);
  const [searchText,        setSearchText]        = useState("");
  const [activeTab,         setActiveTab]         = useState("all");
  const [statusLoading,     setStatusLoading]     = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedTrainer,   setSelectedTrainer]   = useState<TrainerRecord | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    branchName:        true,
    name:              true,
    designation:       true,
    phoneNumber:       true,
    email:             true,
    expertise:         true,
    yearsOfExperience: true,
    profile:           true,
    status:            true,
    view:              true,
    actions:           true,
  });

  const branchId         = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const { data: trainersData, isLoading } = useGetTrainersQuery({
    page,
    limit,
    search:   searchText          || undefined,
    status:   activeTab !== 'all' ? activeTab.toUpperCase() : undefined,
    branchId: selectedBranchId    || undefined,
  } as any);
  const [updateTrainerStatus] = useUpdateTrainerStatusMutation();
  const [verifyTrainer]       = useVerifyTrainerMutation();
  const [unverifyTrainer]     = useUnverifyTrainerMutation();

  const handleView = (record: TrainerRecord) => {
    navigate(`/trainer-detail/${record._id}/${TrainerDetailAttendanceRoute}`);
  };

  const handleVerify = (record: TrainerRecord) => {
    if (!record._id) return;
    Modal.confirm({
      title:   'Verify Teacher',
      content: <p>Are you sure you want to verify <strong>{record.name}</strong>?</p>,
      okText:  'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await verifyTrainer(record._id as string).unwrap();
        } catch {
          /* error toast handled globally by badRequestHandler */
        }
      },
    });
  };

  const handleUnverify = (record: TrainerRecord) => {
    if (!record._id) return;
    Modal.confirm({
      title:   'Unverify Teacher',
      content: <p>Are you sure you want to unverify <strong>{record.name}</strong>?</p>,
      okText:  'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await unverifyTrainer(record._id as string).unwrap();
        } catch {
          /* error toast handled globally by badRequestHandler */
        }
      },
    });
  };

  const handleEdit = (_record: TrainerRecord) => {
    // TODO: Navigate to edit page
  };

  const handleDelete = (_record: TrainerRecord) => {
    // TODO: Confirmation modal + delete API
  };

  const handleStatusToggle = async (record: TrainerRecord, checked: boolean) => {
    setStatusLoading(record._id || null);
    try {
      const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
      await (updateTrainerStatus as any)({ id: record._id, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Error updating trainer status:', error);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleChangePassword = (record: TrainerRecord) => {
    setSelectedTrainer(record);
    setShowPasswordModal(true);
  };

  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    setSelectedTrainer(null);
  };

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof VisibleColumns],
    }));
  };

  const allColumns = getTrainerColumns(
    handleView,
    handleVerify,
    handleEdit,
    handleDelete,
    handleChangePassword,
    navigate,
    handleStatusToggle,
    statusLoading,
    hasPermission('8-3-edit'),
    hasPermission('8-3-delete'),
    hasPermission('TRAINER_VERIFY'),
    hasPermission('8-3-change-password'),
    hasPermission('8-3-status'),
    hasPermission('8-3-view-profile'),
    hasPermission('TRAINER_UNVERIFY'),
    handleUnverify,
  );

  const apiTrainers: any[] = (trainersData as any)?.data || [];

  const mappedData: TrainerRecord[] = apiTrainers.map((item: any) => {
    const branches: { name?: string }[] = item.user?.branchIds || [];
    return {
      ...item,
      name:        item.user?.name || '-',
      phoneNumber: item.user?.phone || item.user?.phoneNumber || '-',
      email:       item.user?.email || '-',
      branchName:  branches.map(b => b.name).join(', ') || '-',
      branches,
      trainerType: item.specialization || [],
      experience:  item.experience || 0,
      photo:       item.photo || '',
      designation: item.user?.roleId?.name || '-',
      status:      item.user?.status || 'inactive',
      isVerified:     item.user?.isVerified ?? item.isVerified ?? false,
      verifiedByName: item.user?.verifiedBy?.name || item.verifiedBy?.name || null,
    };
  });

  const totalCount = (trainersData as any)?.total || 0;

  const tabsData = [
    { key: 'all',      label: 'All',      count: activeTab === 'all'      ? totalCount : 0 },
    { key: 'active',   label: 'Active',   count: activeTab === 'active'   ? totalCount : 0 },
    { key: 'inactive', label: 'Inactive', count: activeTab === 'inactive' ? totalCount : 0 },
  ];

  const columns = allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  return (
    <div className="all-trainers-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={(val: string) => { setSearchText(val); setPage(1); }}
            placeholder="Search teachers..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(tab: string) => { setActiveTab(tab); setPage(1); }}
            tabs={tabsData}
          />
        </div>
        <div className="right-col">
          {hasPermission('8-3-add') && (
            <AddButton to={AddTrainerRoute}>Add Teacher</AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="trainers-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={mappedData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: TrainerRecord) => record._id || record.id || ''}
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
        selectedUser={selectedTrainer}
        userType="trainer"
      />
    </div>
  );
};

export default AllTrainers;
