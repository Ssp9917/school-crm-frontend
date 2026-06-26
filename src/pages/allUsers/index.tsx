import { useState, useMemo } from "react";
import { Select, Modal, Input, message, Button } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AddUserRoute } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import AddUserQRModal from "../../components/modals/AddUserQRModal";
import AddButton from "../../components/addButton";
import { getUserColumns, UserRecord, SalesPerson } from "./columns";
import { useGetAllUserQuery, useVerifyUserMutation, useUnverifyUserMutation } from "../../services/user";
import { useCountries } from "../../hooks/useCountries";
import { useUpdateSalesPersonMutation } from "../../services/invoice";
import { useRequestBlacklistMutation, useCancelBlacklistRequestMutation } from "../../services/blacklist";
import CommonTable from "../../components/commonTable";
import usePermissions from "../../hooks/usePermissions";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface VisibleColumns {
  name:            boolean;
  branch:          boolean;
  phoneNumber:     boolean;
  assessmentRatio: boolean;
  salesPerson:     boolean;
  planName:        boolean;
  addon:           boolean;
  planPrice:       boolean;
  profile:         boolean;
  gender:          boolean;
  status:          boolean;
  invoiceStatus:   boolean;
  remainingDays:   boolean;
  membershipForm:  boolean;
  startDate:       boolean;
  endDate:         boolean;
  gymKit:          boolean;
  actions:         boolean;
}

/* ─── Module-level constants ─────────────────────────────────────────── */

const remainingDaysOptions = [
  { value: 'all', label: 'R.Days' },
  { value: '7',   label: '7 Days'             },
  { value: '15',  label: '15 Days'            },
  { value: '30',  label: '30 Days'            },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AllUsers = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const branchId         = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const [page,                setPage]                = useState(1);
  const [limit,               setLimit]               = useState(10);
  const [searchText,          setSearchText]          = useState("");
  const [activeTab,           setActiveTab]           = useState("all");
  const [remainingDays,       setRemainingDays]       = useState("all");
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("all");
  const [showPasswordModal,      setShowPasswordModal]      = useState(false);
  const [selectedUser,           setSelectedUser]           = useState<UserRecord | null>(null);
  const [showBlacklistModal,     setShowBlacklistModal]     = useState(false);
  const [blacklistUser,          setBlacklistUser]          = useState<UserRecord | null>(null);
  const [blacklistReason,        setBlacklistReason]        = useState('');
  const [qrOpen,                 setQrOpen]                 = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name:            true,
    branch:          true,
    phoneNumber:     true,
    assessmentRatio: true,
    salesPerson:     true,
    planName:        true,
    addon:           true,
    planPrice:       true,
    profile:         true,
    gender:          true,
    status:          true,
    invoiceStatus:   true,
    remainingDays:   true,
    membershipForm:  true,
    startDate:       true,
    endDate:         true,
    gymKit:          true,
    actions:         true,
  });

  const { dialCodeMap } = useCountries();

  const { data, isLoading, refetch } = useGetAllUserQuery({
    page,
    limit,
    search:         searchText,
    status:         activeTab,
    branchIds:      selectedBranchId || undefined,
    membershipType: 'all',
  } as any);

  const [updateSalesPerson]   = useUpdateSalesPersonMutation();
  const [requestBlacklist]    = useRequestBlacklistMutation();
  const [cancelBlacklist]     = useCancelBlacklistRequestMutation();
  const [verifyUser]          = useVerifyUserMutation();
  const [unverifyUser]        = useUnverifyUserMutation();

  const apiData = data as any;

  const allSalesPersons = useMemo<SalesPerson[]>(() => {
    const salesPersonMap = new Map<string, SalesPerson>();
    const users: any[] = apiData?.users || [];
    users.forEach((user: any) => {
      if (Array.isArray(user.salesPerson)) {
        user.salesPerson.forEach((sp: any) => {
          if (sp._id && sp.name && !salesPersonMap.has(sp._id)) {
            salesPersonMap.set(sp._id, { _id: sp._id, name: sp.name, phoneNumber: sp.phoneNumber });
          }
        });
      }
    });
    return Array.from(salesPersonMap.values());
  }, [apiData]);

  const handleEdit = (_record: UserRecord) => {
    // navigation handled inside columns via EditUserRoute
  };

  const handleDelete = (_record: UserRecord) => {
    // TODO: confirmation modal + delete API
  };

  const handleChangePassword = (record: UserRecord) => {
    setSelectedUser(record);
    setShowPasswordModal(true);
  };

  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  };

  const handleRequestBlacklist = (record: UserRecord) => {
    setBlacklistUser(record);
    setBlacklistReason('');
    setShowBlacklistModal(true);
  };

  const handleVerifyUser = (record: UserRecord) => {
    if (!record._id) return;
    Modal.confirm({
      title:   'Verify User',
      content: <p>Are you sure you want to verify <strong>{record.name}</strong>?</p>,
      okText:  'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await verifyUser(record._id as string).unwrap();
          refetch();
        } catch {
          message.error('Failed to verify user');
        }
      },
    });
  };

  const handleUnverifyUser = (record: UserRecord) => {
    if (!record._id) return;
    Modal.confirm({
      title:   'Unverify User',
      content: <p>Are you sure you want to unverify <strong>{record.name}</strong>?</p>,
      okText:  'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await unverifyUser(record._id as string).unwrap();
          refetch();
        } catch {
          message.error('Failed to unverify user');
        }
      },
    });
  };

  const handleCancelBlacklist = async (record: UserRecord) => {
    const requestId = record.blacklistInfo?.pendingRequestId;
    if (!requestId) return;
    try {
      await cancelBlacklist(requestId).unwrap();
      message.success('Blacklist request cancelled');
      refetch();
    } catch {
      message.error('Failed to cancel blacklist request');
    }
  };

  const handleBlacklistConfirm = async () => {
    if (!blacklistReason.trim()) {
      message.error('Please enter a reason');
      return;
    }
    try {
      await requestBlacklist({ userId: blacklistUser!._id!, reason: blacklistReason }).unwrap();
      message.success('Blacklist request submitted');
      setShowBlacklistModal(false);
      setBlacklistUser(null);
      setBlacklistReason('');
      refetch();
    } catch {
      message.error('Failed to submit blacklist request');
    }
  };

  const handleSalesPersonChange = async (userId: string | undefined, salesPersonId: string) => {
    try {
      await (updateSalesPerson as any)({ userId, salesPersonId }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update sales person:', error);
    }
  };

  const columnsWithHandlers = getUserColumns(
    handleEdit,
    handleDelete,
    handleChangePassword,
    navigate,
    allSalesPersons,
    handleSalesPersonChange,
    hasPermission,
    dialCodeMap,
    handleRequestBlacklist,
    handleCancelBlacklist,
    handleVerifyUser,
    handleUnverifyUser,
  );

  const usersData = useMemo<UserRecord[]>(() => {
    const users: any[] = apiData?.users;
    if (!users) return [];
    return users.map((user: any): UserRecord => {
      const member             = user.member            || {};
      const currentMembership  = user.currentMembership || {};
      const salesPersonArray: any[] = user.salesPerson  || [];
      const salesPerson        = salesPersonArray[0]    ?? null;
      const previousSalesPersons = salesPersonArray.slice(1).map((sp: any) => sp.name).join(', ');
      return {
        _id:             user._id,
        name:            user.name,
        branch:          user.branchIds?.length > 0 ? user.branchIds[0]?.name : '-',
        phoneNumber:     user.phoneNumber,
        countryCode:     member.countryCode || '',
        blacklistInfo:   user.blacklistInfo || undefined,
        isVerified:      user.isVerified ?? false,
        verifiedByName:  user.verifiedBy?.name || null,
        assessmentRatio: '-',
        salesPerson:     previousSalesPersons || '-',
        salesPersonId:   salesPerson?._id     || null,
        planName:        currentMembership.planName  || 'N/A',
        addon:           user.addonMembership?.planName || '-',
        planPrice:       currentMembership.pricing   || '-',
        profile:         member.photo,
        gender:          member.gender || '-',
        status:          user.status,
        remainingDays:   currentMembership.totalDays && currentMembership.remainingDays !== undefined
          ? `${currentMembership.totalDays}/${currentMembership.remainingDays}` : '-',
        membershipForm:  '-',
        startDate:       currentMembership.startDate  ? new Date(currentMembership.startDate).toLocaleDateString()  : '-',
        endDate:         currentMembership.expiryDate ? new Date(currentMembership.expiryDate).toLocaleDateString() : '-',
        gymKit:          '-',
        planGymKit:      user.planGymKit,
        deliveredSummary: user.deliveredSummary,
      };
    });
  }, [apiData]);

  const filteredData = useMemo<UserRecord[]>(() => {
    let rows = usersData;
    if (remainingDays !== 'all')
      rows = rows.filter(u => u.remainingDays !== '-' && (u.remainingDays as any) <= parseInt(remainingDays));
    if (selectedSalesPerson !== 'all')
      rows = rows.filter(u => u.salesPersonId === selectedSalesPerson);
    return rows;
  }, [usersData, remainingDays, selectedSalesPerson]);

  const tabsData = [
    { key: 'all',      label: 'All',      count: apiData?.statusCounts?.all      || 0 },
    { key: 'active',   label: 'Active',   count: apiData?.statusCounts?.active   || 0 },
    { key: 'pending',  label: 'Pending',  count: apiData?.statusCounts?.pending  || 0 },
    { key: 'inactive', label: 'Inactive', count: apiData?.statusCounts?.inactive || 0 },
    { key: 'freezed',  label: 'Freezed',  count: apiData?.statusCounts?.freezed  || 0 },
    { key: 'blocked',  label: 'Black listed',    count: apiData?.statusCounts?.blocked  || 0 },
    { key: 'advance',  label: 'Advance',  count: apiData?.statusCounts?.advance  || 0 },
  ];

  const columns = columnsWithHandlers.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey as keyof VisibleColumns] }));
  };

  return (
    <div className="all-users-page-col">
      <div className="header-section">
        {/* <div className="left-col"> */}
          <SearchBar
            value={searchText}
            onChange={(val: string) => { setSearchText(val); setPage(1); }}
            placeholder="Search users..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(tab: string) => { setActiveTab(tab); setPage(1); }}
            tabs={tabsData}
          />
        {/* </div> */}
        {/* <div className="right-col"> */}
          <Select
            value={remainingDays}
            onChange={setRemainingDays}
            className="remaining-days-filter"
            style={{ width: 130, height: 41 }}
            options={remainingDaysOptions}
          />
          {hasPermission('9-2') && (
            <Button className="qr-btn" icon={<QrcodeOutlined />} style={{ height: 41 }} onClick={() => setQrOpen(true)}>
              Generate (QR)
            </Button>
          )}
          {hasPermission('9-2') && <AddButton to={AddUserRoute}>Add User</AddButton>}
          <ColumnVisibility
            columns={columnsWithHandlers}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        {/* </div> */}
      </div>

      <div className="users-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: UserRecord) => record._id || record.id || ''}
          scroll={{ x: 1800 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={apiData?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onCancel={handlePasswordModalCancel}
        selectedUser={selectedUser}
        userType="user"
      />

      <Modal
        open={showBlacklistModal}
        title="Request to Blacklist"
        okText="Submit"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        onOk={handleBlacklistConfirm}
        onCancel={() => { setShowBlacklistModal(false); setBlacklistUser(null); setBlacklistReason(''); }}
      >
        <p style={{ marginBottom: 12 }}>
          User: <strong>{blacklistUser?.name || '—'}</strong>
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Enter reason for blacklist request..."
          value={blacklistReason}
          onChange={e => setBlacklistReason(e.target.value)}
        />
      </Modal>

      <AddUserQRModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
};

export default AllUsers;
