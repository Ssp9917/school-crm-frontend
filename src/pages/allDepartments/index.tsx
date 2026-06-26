import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Switch, message } from "antd";
import { useGetDepartmentsQuery, useToggleDepartmentStatusMutation } from "../../services/departments";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import { AddDepartmentRoute } from "../../routes/routepath";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface DepartmentRecord {
  _id?:   string;
  name?:  string;
  status?: string;
}

interface VisibleColumns {
  name:    boolean;
  status:  boolean;
  actions: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllDepartments = () => {
  const navigate = useNavigate();
  const [searchText,     setSearchText]     = useState("");
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name:    true,
    status:  true,
    actions: true,
  });

  const { data: departmentsData, isLoading } = useGetDepartmentsQuery(undefined);
  const [toggleDepartmentStatus, { isLoading: updatingStatus }] = useToggleDepartmentStatusMutation();

  const handleStatusToggle = async (record: DepartmentRecord) => {
    try {
      await (toggleDepartmentStatus as any)({ id: record._id }).unwrap();
      message.success("Department status updated successfully");
    } catch (err) {
      message.error((err as any)?.data?.message || "Failed to update department status");
    }
  };

  const allColumns = [
    {
      title:     "Department Name",
      dataIndex: "name",
      key:       "name",
      width:     300,
      render:    (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title:     "Status",
      dataIndex: "status",
      key:       "status",
      width:     150,
      align:     "center" as const,
      render:    (status: string, record: DepartmentRecord) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Switch
            checked={status === "active"}
            onChange={() => handleStatusToggle(record)}
            loading={updatingStatus}
            size="small"
            checkedChildren="On"
            unCheckedChildren="Off"
            style={{ minWidth: 40, width: 40 }}
          />
        </div>
      ),
    },
  ];

  const visibleColumnsArray = useMemo(() => {
    return allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);
  }, [visibleColumns, updatingStatus]);

  const departments: DepartmentRecord[] = (departmentsData as any)?.data || [];

  const filteredData = useMemo<DepartmentRecord[]>(() => {
    if (!departments.length) return [];
    if (!searchText) return departments;
    const q = searchText.toLowerCase();
    return departments.filter(item => item.name?.toLowerCase().includes(q));
  }, [departmentsData, searchText]);

  return (
    <div className="all-departments-container">
      <div className="header-section">
        <h2>All Departments</h2>
        <AddButton
          label="Add Department"
          onClick={() => navigate(AddDepartmentRoute)}
        />
      </div>

      <div className="filter-section">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search departments..."
        />
        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={(key: string) =>
            setVisibleColumns(prev => ({ ...prev, [key]: !prev[key as keyof VisibleColumns] }))
          }
        />
      </div>

      <div className="table-section">
        <Table
          columns={visibleColumnsArray}
          dataSource={filteredData}
          rowKey="_id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default AllDepartments;
