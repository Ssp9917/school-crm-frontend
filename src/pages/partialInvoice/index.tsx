import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Modal, message, Select } from 'antd';
import CommonTable from '../../components/commonTable';
import SearchBar from '../../components/searchBar';
import ColumnVisibility from '../../components/columnVisibility';
import CustomPagination from '../../components/pagination';
import DateRangeSelector from '../../components/dateRange/DateRangeSelector';
import usePermissions from '../../hooks/usePermissions';
import { useGetPartialInvoicesQuery, useDeleteInvoiceMutation } from '../../services/invoice';
import { getPartialInvoicesColumns } from './columns';
import './styles.scss';

/* ─── Constants ──────────────────────────────────────────────────────── */

const TYPE_OPTIONS = [
  { label: 'Personal Training', value: 'personal_training' },
  { label: 'Pilates',           value: 'pilates'           },
  { label: 'Therapy',           value: 'therapy'           },
  { label: 'EMS',               value: 'ems'               },
  { label: 'Paid Locker',       value: 'paid_locker'       },
  { label: 'MMA',               value: 'mma'               },
];

const SERVICE_FILTER_OPTIONS = [
  { label: 'All Service', value: 'all' },
  ...TYPE_OPTIONS,
];

/* ─── Component ──────────────────────────────────────────────────────── */

const PartialInvoice = () => {
  const navigate  = useNavigate();
  const branchId  = useSelector((state: any) => state.branch.selectedBranch);
  const { hasPermission } = usePermissions();

  const [page,              setPage]              = useState(1);
  const [limit,             setLimit]             = useState(10);
  const [searchText,        setSearchText]        = useState('');
  const [dateRange,         setDateRange]         = useState<any>(null);
  const sortOrder                                  = 'desc';
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [visibleColumns,    setVisibleColumns]    = useState<Record<string, boolean>>({
    branchName:     true,
    invoiceNumber:  true,
    invoiceDate:    true,
    paymentDate:    true,
    customerName:   true,
    customerMobile: true,
    serviceType:    true,
    packageName:    true,
    salesPersonName: true,
    trainerName:    true,
    status:         true,
    packagePrice:   true,
    itemsPrice:     true,
    discount:       true,
    totalAmount:    true,
    dueAmount:      true,
    paymentMode:    true,
    paymentType:    true,
    gstNumber:      true,
    startDate:      true,
    expiryDate:     true,
    view:           true,
    actions:        true,
  });

  const { data: invoicesData, isLoading, error } = useGetPartialInvoicesQuery({
    page,
    limit,
    search:      searchText,
    branchId:    branchId || '',
    startDate:   dateRange?.startDate || '',
    endDate:     dateRange?.endDate   || '',
    sortOrder,
    invoiceType: 'pending',
    serviceType: serviceTypeFilter !== 'all' ? serviceTypeFilter : '',
  } as any);

  const [deleteInvoice] = useDeleteInvoiceMutation();

  const filteredData = useMemo<any[]>(
    () => (invoicesData as any)?.data || [],
    [(invoicesData as any)?.data],
  );

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  const handleView = (record: any) => {
    console.log('View partial invoice:', record);
  };

  const handleEdit = (record: any) => {
    navigate(`/edit-invoice/${record._id}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title:      'Delete Partial Invoice',
      content:    `Are you sure you want to delete invoice "${record.invoiceNumber}"?`,
      okText:     'Delete',
      okType:     'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await (deleteInvoice as any)(record._id).unwrap();
          message.success('Partial invoice deleted successfully!');
        } catch {
          message.error('Failed to delete partial invoice');
        }
      },
    });
  };

  const allColumns: any[] = getPartialInvoicesColumns(
    handleEdit, handleDelete, handleView, 'dark',
    hasPermission('24-3-edit'),
    hasPermission('24-3-delete'),
  );
  const columns = allColumns.filter((col: any) => visibleColumns[col.key]);

  return (
    <div className="all-partial-invoices-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar value={searchText} onChange={setSearchText} placeholder="Search partial invoices..." />
          <DateRangeSelector onChange={setDateRange} />
        </div>
        <div className="right-col">
          <Select
            value={serviceTypeFilter}
            onChange={setServiceTypeFilter}
            className="status-filter"
            style={{ height: 41 }}
            options={SERVICE_FILTER_OPTIONS}
          />
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="partial-invoices-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          rowKey={(record: any) => record._id || record.invoiceNumber}
          scroll={{ x: 'max-content' }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={(invoicesData as any)?.pagination?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />

      {error && (
        <div className="error-state">
          <p>Error loading partial invoices: {(error as any)?.message || 'Something went wrong'}</p>
        </div>
      )}
    </div>
  );
};

export default PartialInvoice;
