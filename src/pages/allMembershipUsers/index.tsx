import { useState, useMemo } from "react";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import { getUserColumns, MembershipUserRecord, SalesPerson } from "./columns";
import "./styles.scss";
import { useGetUsersByRoleQuery } from "../../services/user";
import { useGetStudentsQuery } from "../../services/student";
import { useCountries } from "../../hooks/useCountries";
import { useUpdateSalesPersonMutation } from "../../services/invoice";
import CommonTable from "../../components/commonTable";
import usePermissions from "../../hooks/usePermissions";

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

const remainingDaysOptions = [
  { value: 'all', label: 'All Remaining Days' },
  { value: '7',   label: '7 Days'             },
  { value: '15',  label: '15 Days'            },
  { value: '30',  label: '30 Days'            },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AllMembershipUsers = () => {
  const { hasPermission } = usePermissions();
  const branchId         = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const [page,                setPage]                = useState(1);
  const [limit,               setLimit]               = useState(10);
  const [searchText,          setSearchText]          = useState("");
  const [activeTab,           setActiveTab]           = useState("all");
  const [remainingDays,       setRemainingDays]       = useState("all");
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("all");
  const [showPasswordModal,   setShowPasswordModal]   = useState(false);
  const [selectedUser,        setSelectedUser]        = useState<MembershipUserRecord | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name:            true,
    branch:          true,
    phoneNumber:     true,
    assessmentRatio: true,
    salesPerson:     true,
    planName:        true,
    addon:           false,
    planPrice:       true,
    profile:         true,
    gender:          true,
    status:          true,
    invoiceStatus:   false,
    remainingDays:   false,
    membershipForm:  false,
    startDate:       false,
    endDate:         false,
    gymKit:          false,
    actions:         true,
  });

  const navigate = useNavigate();
  const { dialCodeMap } = useCountries();

  const handleEdit = (_record: MembershipUserRecord) => {
    // navigation handled inside columns via EditUserRoute
  };

  const handleDelete = (_record: MembershipUserRecord) => {
    // TODO: confirmation modal + delete API
  };

  const handleChangePassword = (record: MembershipUserRecord) => {
    setSelectedUser(record);
    setShowPasswordModal(true);
  };

  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  };

  const { data, isLoading, refetch } = useGetStudentsQuery({
    page,
    limit,
    search:         searchText,
    status:         activeTab,
    branchId:       selectedBranchId || undefined,
  } as any);

  const { data: salesPersonsData } = useGetUsersByRoleQuery({
    role:     'sales_representative',
    branchId: selectedBranchId || undefined,
  } as any);

  const [updateSalesPerson] = useUpdateSalesPersonMutation();

  const allSalesPersons = useMemo<SalesPerson[]>(() => {
    const salesPersonMap = new Map<string, SalesPerson>();
    const apiSalesPersons: any[] = (salesPersonsData as any)?.data || [];
    apiSalesPersons.forEach((sp: any) => {
      if (sp._id && sp.name) salesPersonMap.set(sp._id, { _id: sp._id, name: sp.name, phoneNumber: sp.phoneNumber });
    });
    const users: any[] = (data as any)?.users || [];
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
  }, [salesPersonsData, data]);

  const handleSalesPersonChange = async (userId: string | undefined, salesPersonId: string) => {
    try {
      await (updateSalesPerson as any)({ userId, salesPersonId }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to update sales person:', err);
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
  );

  const usersData = useMemo<MembershipUserRecord[]>(() => {
    const students: any[] = (data as any)?.data;
    if (!students) return [];
    return students.map((std: any): MembershipUserRecord => {
      const user = std.user || {};
      const branches = user.branchIds || [];
      const parents = std.parentIds || [];
      const parentNames = parents.map((p: any) => p.user?.name || p.name || '').filter(Boolean).join(', ');

      return {
        _id:             std._id,
        name:            user.name || '-',
        branch:          branches.length > 0 ? branches[0]?.name : '-',
        phoneNumber:     user.phoneNumber || '-',
        countryCode:     std.countryCode || '',
        assessmentRatio: std.studentId || '-',
        salesPerson:     parentNames || '-',
        salesPersonId:   null,
        planName:        std.classId?.name ? `${std.classId.name}${std.sectionId?.name ? ` - ${std.sectionId.name}` : ''}` : 'N/A',
        addon:           std.rollNumber || '-',
        planPrice:       std.admissionDate ? new Date(std.admissionDate).toLocaleDateString() : '-',
        profile:         std.photo,
        gender:          std.gender || '-',
        status:          std.status || user.status || 'ACTIVE',
        invoiceStatus:   null,
        remainingDays:   '-',
        membershipForm:  '-',
        startDate:       '-',
        endDate:         '-',
        gymKit:          '-',
        planGymKit:      null,
        deliveredSummary: null,
        isVerified:      !!user.isVerified,
        verifiedByName:  user.verifiedBy?.name || null,
      };
    });
  }, [data]);

  const filteredData = useMemo<MembershipUserRecord[]>(() => {
    let result = usersData;
    if (remainingDays !== 'all') {
      result = result.filter(u => u.remainingDays !== '-' && (u.remainingDays as any) <= parseInt(remainingDays));
    }
    return result;
  }, [usersData, remainingDays]);

  const apiData = data as any;
  const tabsData = [
    { key: 'all',      label: 'All',      count: apiData?.statusCounts?.all      || 0 },
    { key: 'active',   label: 'Active',   count: apiData?.statusCounts?.active   || 0 },
    { key: 'inactive', label: 'Inactive', count: apiData?.statusCounts?.inactive || 0 },
    { key: 'freezed',  label: 'Freezed',  count: apiData?.statusCounts?.freezed  || 0 },
    // { key: 'blocked',  label: 'Block',    count: apiData?.statusCounts?.blocked  || 0 },
    { key: 'advance',  label: 'Advance',  count: apiData?.statusCounts?.advance  || 0 },
  ];

  const salesPersonOptions = [
    { value: 'all', label: 'All Sales Representatives' },
    ...allSalesPersons.map(sp => ({ value: sp.name, label: sp.name })),
  ];

  const columns = columnsWithHandlers.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey as keyof VisibleColumns] }));
  };

  return (
    <div className="all-users-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={(val: string) => { setSearchText(val); setPage(1); }}
            placeholder="Search students..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(tab: string) => { setActiveTab(tab); setPage(1); }}
            tabs={tabsData}
          />
        </div>
        <div className="right-col">
          <Select
            value={selectedSalesPerson}
            onChange={(val: string) => { setSelectedSalesPerson(val); setPage(1); }}
            className="remaining-days-filter"
            style={{ width: 220, height: 41 }}
            showSearch
            optionFilterProp="label"
            placeholder="Sales Representative"
            options={salesPersonOptions}
          />
          <Select
            value={remainingDays}
            onChange={setRemainingDays}
            className="remaining-days-filter"
            style={{ width: 180, height: 41 }}
            options={remainingDaysOptions}
          />
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
          dataSource={filteredData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: MembershipUserRecord) => record._id || record.id || ''}
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
    </div>
  );
};

export default AllMembershipUsers;
