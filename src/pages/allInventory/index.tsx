import { useState, useEffect } from "react";
import { Spin, message } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import CommonTable from "../../components/commonTable";
import PageBreadcrumb from "../../components/breadcrumb";
import SearchBar from "../../components/searchBar";
import AddButton from "../../components/addButton";
import { EditInventoryModal, AddQuantityModal } from "../../components/modals";
import { getInventoryColumns, InventoryRecord } from "./columns";
import { useGetInventoryQuery, useDeleteInventoryMutation, useToggleInventoryStatusMutation } from "../../services/inventory";
import usePermissions from "../../hooks/usePermissions";
import { Home, AddInventoryRoute } from "../../routes/routepath";
import "./styles.scss";

/* ─── Component ──────────────────────────────────────────────────────── */

const AllInventory = () => {
  const [searchText,            setSearchText]            = useState("");
  const [filteredData,          setFilteredData]          = useState<InventoryRecord[]>([]);
  const [isEditModalOpen,       setIsEditModalOpen]       = useState(false);
  const [selectedRecord,        setSelectedRecord]        = useState<InventoryRecord | null>(null);
  const [isAddQuantityModalOpen, setIsAddQuantityModalOpen] = useState(false);
  const [addQuantityRecord,     setAddQuantityRecord]     = useState<InventoryRecord | null>(null);

  const { data: inventoryData, isLoading, refetch } = useGetInventoryQuery(undefined);
  const [deleteInventory]  = useDeleteInventoryMutation();
  const [toggleStatus]     = useToggleInventoryStatusMutation();

  const { hasPermission } = usePermissions();

  useEffect(() => {
    const apiData = inventoryData as any;
    if (apiData?.success && Array.isArray(apiData?.data)) {
      const processedData: InventoryRecord[] = apiData.data.map((item: any, index: number) => ({
        ...item,
        key:               item._id || String(index),
        branchName:        item.branchId?.name || 'N/A',
        warehouseName:     item.warehouseName  || 'N/A',
        productName:       item.productName,
        quantity:          item.quantity,
        quantityAvailable: item.quantity,
      }));

      const filtered = searchText
        ? processedData.filter(item =>
            item.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.branchName?.toLowerCase().includes(searchText.toLowerCase())  ||
            item.warehouseName?.toLowerCase().includes(searchText.toLowerCase())
          )
        : processedData;

      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [inventoryData, searchText]);

  const handleEdit = (record: InventoryRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (record: InventoryRecord) => {
    try {
      await (deleteInventory as any)(record._id || record.id).unwrap();
      message.success('Inventory item deleted successfully!');
      refetch();
    } catch (err) {
      message.error((err as any)?.data?.message || 'Failed to delete inventory item.');
    }
  };

  const handleStatusToggle = async (record: InventoryRecord, newStatus: string) => {
    try {
      await (toggleStatus as any)({ id: record._id || record.id, status: newStatus }).unwrap();
      refetch();
    } catch {
      // silently ignored
    }
  };

  const handleAddQuantity = (record: InventoryRecord) => {
    setAddQuantityRecord(record);
    setIsAddQuantityModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="all-inventory-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>All Inventory</h2>
          <PageBreadcrumb items={[
            { label: <HomeOutlined />, to: Home },
            { label: "All Inventory" },
          ]} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="all-inventory-page">
      <div className="content-wrapper">
        <div className="search-and-add-section">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search inventory..."
          />
          {hasPermission('INVENTORY_CREATE') && (
            <AddButton to={AddInventoryRoute}>Add Inventory</AddButton>
          )}
        </div>

        <CommonTable
          dataSource={filteredData}
          columns={getInventoryColumns(
            handleEdit,
            handleDelete,
            handleStatusToggle,
            handleAddQuantity,
            hasPermission('INVENTORY_UPDATE'),
            hasPermission('INVENTORY_DELETE'),
          )}
          entityType="inventory"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <EditInventoryModal
        open={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedRecord(null); }}
        recordData={selectedRecord as any}
        onSuccess={() => { refetch(); }}
      />

      <AddQuantityModal
        open={isAddQuantityModalOpen}
        onClose={() => { setIsAddQuantityModalOpen(false); setAddQuantityRecord(null); }}
        recordData={addQuantityRecord as any}
        onSuccess={() => { refetch(); message.success('Quantity added successfully!'); }}
      />
    </div>
  );
};

export default AllInventory;
