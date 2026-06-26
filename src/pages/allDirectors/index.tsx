import { useState, useMemo } from "react";
import usePermissions from "../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { EditDirectorRoute, AddDirectorRoute } from "../../routes/routepath";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import ChangePasswordModal from "../../components/modals/ChangePasswordModal";
import AddButton from "../../components/addButton";
import { getColumns, DirectorRecord } from "./columns";
import { useGetDirectorsQuery, useUpdateDirectorStatusMutation } from "../../services/director";
import "./styles.scss";
import CommonTable from "../../components/commonTable";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface VisibleColumns {
  name:        boolean;
  email:       boolean;
  phoneNumber: boolean;
  branchName:  boolean;
  ownedBy:     boolean;
  status:      boolean;
  view:        boolean;
  actions:     boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllDirectors = () => {
  const navigate = useNavigate();
  const [page,              setPage]              = useState(1);
  const [limit,             setLimit]             = useState(10);
  const [searchText,        setSearchText]        = useState("");
  const [activeTab,         setActiveTab]         = useState("all");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedDirector,  setSelectedDirector]  = useState<DirectorRecord | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name:        true,
    email:       true,
    phoneNumber: true,
    branchName:  true,
    ownedBy:     true,
    status:      true,
    view:        true,
    actions:     true,
  });

  const { data: directorsData, isLoading } = useGetDirectorsQuery({ page, limit } as any);
  const [updateDirectorStatus, { isLoading: updatingStatus }] = useUpdateDirectorStatusMutation();

  const { hasPermission } = usePermissions();

  const handleStatusToggle = async (record: DirectorRecord) => {
    try {
      await (updateDirectorStatus as any)(record._id).unwrap();
    } catch {
      // silently ignored — status toggle failures are non-critical
    }
  };

  const directors = useMemo<DirectorRecord[]>(() => {
    const arr: any[] = (directorsData as any)?.data || (directorsData as any)?.directors || [];
    return arr.map(item => ({
      ...item,
      phoneNumber: item.number,
      branches:   item.branchIds?.length > 0 ? item.branchIds : (item.branch ? [item.branch] : []),
      branchName: item.branch?.name || "-",
      ownedBy:    item.role?.name   || "-",
      status:     item?.status      || "INACTIVE",
    }));
  }, [directorsData]);

  const handleView = (_record: DirectorRecord) => {
    // TODO: navigate to director detail page
  };

  const handleEdit = (record: DirectorRecord) => {
    if (record?._id) {
      navigate(`${EditDirectorRoute}/${record._id}`);
    }
  };

  const handleChangePassword = (record: DirectorRecord) => {
    setSelectedDirector(record);
    setShowPasswordModal(true);
  };

  const handleDelete = (_record: DirectorRecord) => {
    // TODO: confirmation modal + delete API
  };

  const allColumns = getColumns(
    handleView,
    handleEdit,
    handleDelete,
    handleChangePassword,
    handleStatusToggle,
    updatingStatus,
    hasPermission("6-edit"),
    hasPermission("6-delete"),
    hasPermission("6-change-password"),
    hasPermission("6-status"),
    hasPermission("6-view-profile"),
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
    setSelectedDirector(null);
  };

  const filteredData = useMemo<DirectorRecord[]>(() => {
    return directors.filter(item => {
      const q            = searchText.toLowerCase();
      const matchesSearch = searchText === "" ||
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phoneNumber?.includes(searchText);

      const matchesTab = activeTab === "all" ||
        (activeTab === "active"   && item.status?.toLowerCase() === "active")  ||
        (activeTab === "inactive" && item.status?.toLowerCase() !== "active");

      return matchesSearch && matchesTab;
    });
  }, [directors, searchText, activeTab]);

  const allCount      = directors.length;
  const activeCount   = directors.filter(d => d.status?.toLowerCase() === "active").length;
  const inactiveCount = directors.filter(d => d.status?.toLowerCase() !== "active").length;

  const tabsData = [
    { key: "all",      label: "All",      count: allCount      },
    { key: "active",   label: "Active",   count: activeCount   },
    { key: "inactive", label: "Inactive", count: inactiveCount },
  ];

  const paginatedData = useMemo<DirectorRecord[]>(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  return (
    <div className="all-directors-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search directors..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabsData}
          />
        </div>
        <div className="right-col">
          {hasPermission("6-add") && (
            <AddButton to={AddDirectorRoute}>Add Director</AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="directors-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData}
          loading={isLoading}
          pagination={false}
          rowKey={(record: DirectorRecord) => record._id || record.id || ""}
          scroll={{ x: 1000 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={filteredData.length}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onCancel={handlePasswordModalCancel}
        selectedUser={selectedDirector}
        userType="director"
      />
    </div>
  );
};

export default AllDirectors;
