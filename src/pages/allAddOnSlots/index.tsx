import { useState, useMemo } from "react";
import { AddAddOnSlotRoute } from "../../routes/routepath";
import usePermissions from "../../hooks/usePermissions";
import CustomPagination from "../../components/pagination";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import CommonTable from "../../components/commonTable";
import "./styles.scss";
import { getAddOnSlotColumns, AddOnSlotRecord } from "./columns";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface VisibleColumns {
  date:        boolean;
  planType:    boolean;
  className:   boolean;
  timeFrom:    boolean;
  timeTo:      boolean;
  viewHistory: boolean;
  actions:     boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllAddOnSlots = () => {
  const { hasPermission } = usePermissions();

  const [page,       setPage]       = useState(1);
  const [limit,      setLimit]      = useState(10);
  const [searchText, setSearchText] = useState('');
  const activeTab = 'all';

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    date:        true,
    planType:    true,
    className:   true,
    timeFrom:    true,
    timeTo:      true,
    viewHistory: true,
    actions:     true,
  });

  const addOnSlots: AddOnSlotRecord[] = [];
  const isLoading = false;

  const handleEdit   = (record: AddOnSlotRecord) => console.log('Edit',   record);
  const handleDelete = (record: AddOnSlotRecord) => console.log('Delete', record);

  const allColumns = getAddOnSlotColumns(handleEdit, handleDelete);

  const filteredData = useMemo<AddOnSlotRecord[]>(() => {
    if (!addOnSlots.length) return [];
    let d = addOnSlots;
    if (searchText) {
      const q = searchText.toLowerCase();
      d = d.filter(item =>
        item.packageName?.toLowerCase().includes(q) ||
        item.className?.toLowerCase().includes(q)
      );
    }
    if (activeTab !== 'all') d = d.filter(item => item.status === activeTab);
    return d;
  }, [addOnSlots, searchText, activeTab]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey as keyof VisibleColumns] }));
  };

  const visibleCols = allColumns.filter((col: any) => visibleColumns[col.key as keyof VisibleColumns]);

  return (
    <div className="all-add-on-slots-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search add on slots..." />
        </div>
        <div className="right-col">
          {hasPermission('ADDON_SLOT_CREATE') && (
            <AddButton to={AddAddOnSlotRoute}>Add On Slot</AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <CommonTable
        columns={visibleCols}
        dataSource={paginatedData}
        loading={isLoading}
        rowKey="_id"
        pagination={false}
      />

      <CustomPagination
        current={page}
        total={filteredData.length}
        pageSize={limit}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default AllAddOnSlots;
