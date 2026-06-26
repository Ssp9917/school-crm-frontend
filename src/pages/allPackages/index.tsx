import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Modal } from "antd";
import { useSelector } from "react-redux";
import { AddPackageRoute } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import CommonTable from '../../components/commonTable';
import { useGetPlansQuery, useActivatePlanMutation, useDeactivatePlanMutation } from "../../services/package";
import { getPackageColumns, PackageRecord } from './columns';
import usePermissions from "../../hooks/usePermissions";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface VisibleColumns {
  packageType:  boolean;
  branchName:   boolean;
  packageName:  boolean;
  pricing:      boolean;
  numberOfDays: boolean;
  status:       boolean;
  toggle:       boolean;
  actions:      boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllPackages = () => {
  const navigate = useNavigate();
  const branchId = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId = typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;

  const [page,              setPage]              = useState(1);
  const [limit,             setLimit]             = useState(20);
  const [searchText,        setSearchText]        = useState("");
  const [activeTab,         setActiveTab]         = useState("all");
  const [packageTypeFilter, setPackageTypeFilter] = useState("all");

  const { hasPermission } = usePermissions();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activatePlan]   = useActivatePlanMutation();
  const [deactivatePlan] = useDeactivatePlanMutation();

  const { data, isLoading } = useGetPlansQuery({
    page,
    limit,
    search:   searchText,
    status:   activeTab,
    type:     packageTypeFilter,
    branchId: selectedBranchId || undefined,
  } as any);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    packageType:  true,
    branchName:   true,
    packageName:  true,
    pricing:      true,
    numberOfDays: true,
    status:       true,
    toggle:       true,
    actions:      true,
  });

  const apiData   = data as any;
  const packages: PackageRecord[] = apiData?.data       || [];
  const total: number             = apiData?.pagination?.total || 0;

  const handleDelete = (_record: PackageRecord) => {
    // TODO: confirmation modal + delete API
  };

  const canActivate   = hasPermission('PLAN_ACTIVATE') || hasPermission('PLAN_MANAGE');
  const canDeactivate = hasPermission('PLAN_DEACTIVATE') || hasPermission('PLAN_MANAGE');
  const canToggle     = canActivate || canDeactivate;

  const handleToggle = (record: PackageRecord) => {
    const isActive = record.status === 'active';
    if (isActive && !canDeactivate) return;
    if (!isActive && !canActivate) return;
    Modal.confirm({
      title:   isActive ? 'Deactivate Fee Structure' : 'Activate Fee Structure',
      content: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} "${record.name}"?`,
      okText:  isActive ? 'Deactivate' : 'Activate',
      okType:  isActive ? 'danger' : 'primary',
      onOk: async () => {
        setTogglingId(record._id || null);
        try {
          if (isActive) {
            await (deactivatePlan as any)(record._id).unwrap();
          } else {
            await (activatePlan as any)(record._id).unwrap();
          }
          // message.success(`Fee structure ${isActive ? 'deactivated' : 'activated'} successfully`);
        } catch {
          message.error('Failed to update status');
        } finally {
          setTogglingId(null);
        }
      },
    });
  };

  const allColumns = getPackageColumns(
    handleDelete,
    navigate,
    hasPermission('PACKAGE_UPDATE'),
    hasPermission('PACKAGE_DELETE'),
    handleToggle,
    canToggle,
    togglingId,
  );

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof VisibleColumns],
    }));
  };

  const tabsData = [
    { key: "all",      label: "All",      count: 0 },
    { key: "active",   label: "Active",   count: 0 },
    { key: "inactive", label: "Inactive", count: 0 },
  ];

  return (
    <div className="all-packages-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={(val: string) => { setSearchText(val); setPage(1); }}
            placeholder="Search fee structures..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(key: string) => { setActiveTab(key); setPage(1); }}
            tabs={tabsData}
          />
        </div>
        <div className="right-col">
          {hasPermission('PACKAGE_CREATE') && (
            <AddButton to={AddPackageRoute}>Add Fee Structure</AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <CommonTable
        columns={allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns])}
        dataSource={packages}
        loading={isLoading}
        rowKey="_id"
        pagination={false}
      />

      <CustomPagination
        current={page}
        pageSize={limit}
        total={total}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default AllPackages;
