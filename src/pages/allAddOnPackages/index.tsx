import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Modal, message } from "antd";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import CommonTable from "../../components/commonTable";
import allColumns from "./columns";
import "./styles.scss";
import { useGetAddOnPackagesQuery, useDeletePlanMutation, useActivatePlanMutation, useDeactivatePlanMutation } from "../../services/package";
import usePermissions from "../../hooks/usePermissions";
import { AddAddOnPackageRoute, EditAddOnPackageRoute } from "../../routes/routepath";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface PackageRow {
  _id:          string;
  branch:       string;
  packageType:  string;
  name:         string;
  session:      number | string;
  pricing:      number | string;
  numberOfDays: number | string;
  status:       string;
}

interface VisibleColumns {
  branch:       boolean;
  packageType:  boolean;
  name:         boolean;
  session:      boolean;
  pricing:      boolean;
  numberOfDays: boolean;
  status:       boolean;
  toggle:       boolean;
  actions:      boolean;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const typeOptions = [
  { label: 'All Package Types', value: 'all'              },
  { label: 'Personal Training', value: 'personal_training' },
  { label: 'Pilates',           value: 'pilates'          },
  { label: 'Therapy',           value: 'therapy'          },
  { label: 'EMS',               value: 'ems'              },
  { label: 'Paid Locker',       value: 'paid_locker'      },
  { label: 'MMA',               value: 'mma'              },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AllAddOnPackages = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [page,              setPage]              = useState(1);
  const [limit,             setLimit]             = useState(10);
  const [searchText,        setSearchText]        = useState('');
  const [activeTab,         setActiveTab]         = useState('all');
  const [packageTypeFilter, setPackageTypeFilter] = useState('all');

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    branch:       true,
    packageType:  true,
    name:         true,
    session:      true,
    pricing:      true,
    numberOfDays: true,
    status:       true,
    toggle:       true,
    actions:      true,
  });

  const { data, isLoading } = useGetAddOnPackagesQuery({
    type:      'addon',
    addonType: packageTypeFilter !== 'all' ? packageTypeFilter.toLowerCase().replace(/\s+/g, '_') : undefined,
    branchId:  undefined,
  } as any);

  const packagesData = useMemo<PackageRow[]>(() => {
    const rows = (data as any)?.data;
    if (!Array.isArray(rows)) return [];
    return rows.map((pkg: any) => ({
      _id:          pkg._id,
      branch:       pkg.branchIds?.map((b: any) => b.name).join(', ') || '-',
      packageType:  pkg.addonType
        ? pkg.addonType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        : '-',
      name:         pkg.name         || '-',
      session:      pkg.numberOfSessions || '-',
      pricing:      pkg.pricing      || '-',
      numberOfDays: pkg.numberOfDays || '-',
      status:       pkg.status       || '-',
    }));
  }, [data]);

  const filteredData = useMemo<PackageRow[]>(() => {
    let d = packagesData;
    if (activeTab !== 'all')         d = d.filter(u => u.status === activeTab);
    if (packageTypeFilter !== 'all') d = d.filter(u => u.packageType === packageTypeFilter);
    if (searchText)                  d = d.filter(u => u.name?.toLowerCase().includes(searchText.toLowerCase()));
    return d;
  }, [packagesData, activeTab, packageTypeFilter, searchText]);

  const tabsData = [
    { key: 'all',      label: 'All',      count: filteredData.length },
    { key: 'active',   label: 'Active',   count: filteredData.filter(u => u.status === 'active').length   },
    { key: 'inactive', label: 'Inactive', count: filteredData.filter(u => u.status === 'inactive').length },
  ];

  const [deletePlan]     = useDeletePlanMutation();
  const [activatePlan]   = useActivatePlanMutation();
  const [deactivatePlan] = useDeactivatePlanMutation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleEdit = (id: string) => navigate(`${EditAddOnPackageRoute}/${id}`);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title:   'Delete Package',
      content: 'Are you sure you want to delete this package?',
      okText:  'Delete',
      okType:  'danger',
      onOk: async () => {
        try {
          await deletePlan(id).unwrap();
          message.success('Package deleted successfully');
        } catch {
          message.error('Failed to delete package');
        }
      },
    });
  };

  const canEdit       = hasPermission('12-3-edit');
  const canDelete     = hasPermission('12-3-delete');
  const canActivate   = hasPermission('PLAN_ACTIVATE') || hasPermission('PLAN_MANAGE');
  const canDeactivate = hasPermission('PLAN_DEACTIVATE') || hasPermission('PLAN_MANAGE');
  const canToggle     = canActivate || canDeactivate;

  const handleToggle = (record: PackageRow) => {
    const isActive = record.status === 'active';
    if (isActive && !canDeactivate) return;
    if (!isActive && !canActivate) return;
    Modal.confirm({
      title:   isActive ? 'Deactivate Package' : 'Activate Package',
      content: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} "${record.name}"?`,
      okText:  isActive ? 'Deactivate' : 'Activate',
      okType:  isActive ? 'danger' : 'primary',
      onOk: async () => {
        setTogglingId(record._id);
        try {
          if (isActive) {
            await (deactivatePlan as any)(record._id).unwrap();
          } else {
            await (activatePlan as any)(record._id).unwrap();
          }
          // message.success(`Package ${isActive ? 'deactivated' : 'activated'} successfully`);
        } catch {
          message.error('Failed to update status');
        } finally {
          setTogglingId(null);
        }
      },
    });
  };

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey as keyof VisibleColumns] }));
  };

  const fullColumns = allColumns(handleEdit, handleDelete, handleToggle, canEdit, canDelete, canToggle, togglingId);
  const columns     = fullColumns.filter((col: any) => visibleColumns[col.key as keyof VisibleColumns]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  return (
    <div className="all-add-on-packages-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search add on packages..." />
          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabsData} />
          <Select
            value={packageTypeFilter}
            onChange={(v: string) => setPackageTypeFilter(v)}
            className="designation-filter"
            style={{ height: 41 }}
            options={typeOptions}
          />
        </div>
        <div className="right-col">
          <ColumnVisibility
            columns={fullColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
          {hasPermission('12-3-add') && (
            <AddButton to={AddAddOnPackageRoute} style={{ whiteSpace: 'nowrap' }}>
              Add Add-On Package
            </AddButton>
          )}
        </div>
      </div>

      <div className="packages-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: any) => record._id || record.id}
          scroll={{ x: 1200 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={filteredData.length}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default AllAddOnPackages;
