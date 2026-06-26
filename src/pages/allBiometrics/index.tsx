import { useState, useMemo } from 'react';
import { Modal, message } from 'antd';
import AddButton from '../../components/addButton';
import CommonTable from '../../components/commonTable';
import SearchBar from '../../components/searchBar';
import ColumnVisibility from '../../components/columnVisibility';
import { EditBiometricModal } from '../../components/modals';
import { useGetBiometricsQuery, useDeleteBiometricMutation } from '../../services/biometric';
import usePermissions from '../../hooks/usePermissions';
import { getBiometricsColumns, BiometricRecord } from './columns';
import { AddBiometricRoute } from '../../routes/routepath';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface VisibleColumns {
  id:            boolean;
  machineId:     boolean;
  branchName:    boolean;
  branchAddress: boolean;
  floor:         boolean;
  recordPurpose: boolean;
  actions:       boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllBiometrics = () => {
  const { data: biometricsData, isLoading, error } = useGetBiometricsQuery(undefined);
  const [deleteBiometric] = useDeleteBiometricMutation();

  const { hasPermission } = usePermissions();
  const [searchText,     setSearchText]     = useState('');
  const [editModalOpen,  setEditModalOpen]  = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BiometricRecord | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    id:            true,
    machineId:     true,
    branchName:    true,
    branchAddress: true,
    floor:         true,
    recordPurpose: true,
    actions:       true,
  });

  const machines: BiometricRecord[] = (biometricsData as any)?.data || [];

  const filteredData = useMemo<BiometricRecord[]>(() => {
    if (!searchText) return machines;
    const q = searchText.toLowerCase();
    return machines.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(q)) ||
      (item.branchId?.name    && item.branchId.name.toLowerCase().includes(q))    ||
      (item.branchId?.address && item.branchId.address.toLowerCase().includes(q))
    );
  }, [searchText, machines]);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof VisibleColumns],
    }));
  };

  const handleEdit = (record: BiometricRecord) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedRecord(null);
  };

  const handleEditSuccess = () => {
    // Refetch handled by RTK Query invalidatesTags
  };

  const handleDelete = (record: BiometricRecord) => {
    Modal.confirm({
      title:      'Delete Biometric Machine',
      content:    `Are you sure you want to delete machine "${record.machineId}"?`,
      okText:     'Delete',
      okType:     'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteBiometric(record._id as string).unwrap();
          message.success('Biometric machine deleted successfully!');
        } catch {
          message.error('Failed to delete biometric machine');
        }
      },
    });
  };

  const allColumns = getBiometricsColumns(
    handleEdit,
    handleDelete,
    hasPermission('BIOMETRIC_UPDATE'),
    hasPermission('BIOMETRIC_DELETE'),
  );
  const columns = allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  return (
    <div className="all-biometrics-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search biometric machines..."
          />
        </div>
        <div className="right-col">
          {hasPermission('BIOMETRIC_CREATE') && (
            <AddButton to={AddBiometricRoute}>
              Add Biometric Machine
            </AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="biometrics-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          rowKey={(record: BiometricRecord) => record._id || record.machineId || ''}
          scroll={{ x: 1000 }}
        />
      </div>

      {error && (
        <div className="error-state">
          <p>Error loading biometric machines: {(error as any)?.message || 'Something went wrong'}</p>
        </div>
      )}

      <EditBiometricModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        recordData={selectedRecord}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default AllBiometrics;
