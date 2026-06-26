import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, message, Select } from 'antd';
import { useTheme } from '../../context/ThemeContext';
import { useSelector } from 'react-redux';
import CommonTable from '../../components/commonTable';
import SearchBar from '../../components/searchBar';
import ColumnVisibility from '../../components/columnVisibility';
import CustomPagination from '../../components/pagination';
import DateRangeSelector from '../../components/dateRange/DateRangeSelector';
import { useGetInvoicesQuery, useDeleteInvoiceMutation, useVerifyInvoiceMutation, useUnverifyInvoiceMutation } from '../../services/invoice';
import { useGetUsersByRoleQuery } from '../../services/user';
import { useGetOpenTrainersQuery } from '../../services/trainer';
import usePermissions from '../../hooks/usePermissions';
import { getInvoicesColumns, InvoiceRecord } from './columns';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface DateRange {
  startDate?: string;
  endDate?:   string;
}

interface VisibleColumns {
  invoiceNumber:   boolean;
  invoiceDate:     boolean;
  paymentDate:     boolean;
  branchName:      boolean;
  customerName:    boolean;
  customerMobile:  boolean;
  serviceType:     boolean;
  trainerName:     boolean;
  salesPersonName: boolean;
  status:          boolean;
  packageName:     boolean;
  startDate:       boolean;
  expiryDate:      boolean;
  gstNumber:       boolean;
  packagePrice:    boolean;
  itemsPrice:      boolean;
  discount:        boolean;
  taxableAmount:   boolean;
  cgst:            boolean;
  sgst:            boolean;
  totalAmount:     boolean;
  dueAmount:       boolean;
  paymentMode:     boolean;
  view:            boolean;
  actions:         boolean;
  paymentType:     boolean;
}

/* ─── Module-level constants ─────────────────────────────────────────── */

const typeOptions = [
  { label: 'Personal Training', value: 'personal_training' },
  { label: 'Pilates',           value: 'pilates'           },
  { label: 'Therapy',           value: 'therapy'           },
  { label: 'EMS',               value: 'ems'               },
  { label: 'Paid Locker',       value: 'paid_locker'       },
  { label: 'MMA',               value: 'mma'               },
];

const invoiceTypeOptions = [
  { value: 'all',           label: 'All Status'    },
  { value: 'new_client',    label: 'New Client'    },
  { value: 'balance_clear', label: 'Balance Clear' },
  { value: 'renew',         label: 'Renew'         },
  { value: 'upgrade',       label: 'Upgrade'       },
];

const serviceTypeOptions = [
  { value: 'all', label: 'All Service' },
  ...typeOptions,
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AllInvoice = () => {
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const branchId  = useSelector((state: any) => state.branch.selectedBranch);

  const [page,               setPage]               = useState(1);
  const [limit,              setLimit]              = useState(10);
  const [searchText,         setSearchText]         = useState("");
  const [dateRange,          setDateRange]          = useState<DateRange | null>(null);
  const [statusFilter,       setStatusFilter]       = useState("all");
  const [invoiceTypeFilter,  setInvoiceTypeFilter]  = useState("all");
  const [salesPersonFilter,  setSalesPersonFilter]  = useState("all");
  const [trainerFilter,      setTrainerFilter]      = useState("all");
  const [verifyModal,        setVerifyModal]        = useState(false);
  const [unverifyModal,      setUnverifyModal]      = useState(false);
  const [actionInvoice,      setActionInvoice]      = useState<InvoiceRecord | null>(null);

  const { data: invoicesData, isLoading } = useGetInvoicesQuery({
    page,
    limit,
    search:        searchText,
    status:        statusFilter,
    invoiceType:   invoiceTypeFilter,
    startDate:     dateRange?.startDate || '',
    endDate:       dateRange?.endDate   || '',
    branchId:      branchId             || '',
    salesPerson:   salesPersonFilter,
    trainer:       trainerFilter,
  } as any);

  const { data: salesPersonsData } = useGetUsersByRoleQuery({ role: 'sales_representative', branchId: branchId || undefined } as any);
  const { data: trainersData }     = useGetOpenTrainersQuery({ page: 1, limit: 100, branchId: branchId || undefined } as any);

  const salesPersonOptions = [
    { value: 'all', label: 'All Sales Persons' },
    ...(((salesPersonsData as any)?.data ?? []) as any[]).map((p: any) => ({
      value: p.name || '',
      label: p.name || 'Unknown',
    })),
  ];

  const trainerOptions = [
    { value: 'all', label: 'All Trainers' },
    ...(((trainersData as any)?.data ?? []) as any[]).map((t: any) => ({
      value: t.user?.name || t.name || '',
      label: t.user?.name || t.name || 'Unknown',
    })),
  ];

  const [deleteInvoice]   = useDeleteInvoiceMutation();
  const [verifyInvoice]   = useVerifyInvoiceMutation();
  const [unverifyInvoice] = useUnverifyInvoiceMutation();
  const { hasPermission } = usePermissions();

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    invoiceNumber:   true,
    invoiceDate:     true,
    paymentDate:     true,
    branchName:      true,
    customerName:    true,
    customerMobile:  true,
    serviceType:     true,
    trainerName:     true,
    salesPersonName: true,
    status:          true,
    packageName:     true,
    startDate:       true,
    expiryDate:      true,
    gstNumber:       true,
    packagePrice:    true,
    itemsPrice:      true,
    discount:        true,
    taxableAmount:   true,
    cgst:            true,
    sgst:            true,
    totalAmount:     true,
    dueAmount:       true,
    paymentMode:     true,
    view:            true,
    actions:         true,
    paymentType:     true,
  });

  const invoices: InvoiceRecord[] = (invoicesData as any)?.data || [];

  const handleSearchChange = (value: string) => { setSearchText(value); setPage(1); };
  const handleStatusChange = (value: string) => { setStatusFilter(value); setPage(1); };
  const handleDateRangeChange = (range: DateRange | null) => { setDateRange(range); setPage(1); };

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof VisibleColumns],
    }));
  };

  const handleView = (_record: InvoiceRecord) => {
    // navigate(`/view-invoice/${record._id}`);
  };

  const handleEdit = (record: InvoiceRecord) => {
    navigate(`/edit-invoice/${record._id}`);
  };

  const handleDelete = (record: InvoiceRecord) => {
    Modal.confirm({
      title:      'Delete Invoice',
      content:    `Are you sure you want to delete invoice "${record.invoiceNumber}"?`,
      okText:     'Delete',
      okType:     'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await (deleteInvoice as any)(record._id).unwrap();
          message.success('Invoice deleted successfully!');
        } catch {
          message.error('Failed to delete invoice');
        }
      },
    });
  };

  const handleVerify = (record: InvoiceRecord) => {
    setActionInvoice(record);
    setVerifyModal(true);
  };

  const handleVerifyConfirm = async () => {
    try {
      await verifyInvoice(actionInvoice!._id!).unwrap();
      // message.success('Invoice verified');
      setVerifyModal(false);
      setActionInvoice(null);
    } catch {
      message.error('Failed to verify invoice');
    }
  };

  const handleUnverify = (record: InvoiceRecord) => {
    setActionInvoice(record);
    setUnverifyModal(true);
  };

  const handleUnverifyConfirm = async () => {
    try {
      await unverifyInvoice(actionInvoice!._id!).unwrap();
      // message.success('Invoice unverified');
      setUnverifyModal(false);
      setActionInvoice(null);
    } catch {
      message.error('Failed to unverify invoice');
    }
  };

  const allColumns = getInvoicesColumns(
    handleEdit,
    handleDelete,
    handleView,
    theme,
    hasPermission('INVOICE_UPDATE'),
    hasPermission('INVOICE_DELETE'),
    handleVerify,
    hasPermission('INVOICE_VERIFY'),
    handleUnverify,
    hasPermission('INVOICE_UNVERIFY'),
  );
  const columns = allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  return (
    <div className="all-invoices-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search invoices..."
          />
          <DateRangeSelector onChange={handleDateRangeChange} />
        </div>
        <div className="right-col">
          <Select
            value={invoiceTypeFilter}
            onChange={(val: string) => { setInvoiceTypeFilter(val); setPage(1); }}
            className="status-filter"
            style={{ height: 41 }}
            options={invoiceTypeOptions}
          />
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            className="status-filter"
            style={{ height: 41 }}
            options={serviceTypeOptions}
          />
          <Select
            value={salesPersonFilter}
            onChange={(val: string) => { setSalesPersonFilter(val); setPage(1); }}
            className="status-filter"
            style={{ height: 41, minWidth: 170 }}
            showSearch
            optionFilterProp="label"
            options={salesPersonOptions}
          />
          <Select
            value={trainerFilter}
            onChange={(val: string) => { setTrainerFilter(val); setPage(1); }}
            className="status-filter"
            style={{ height: 41, minWidth: 150 }}
            showSearch
            optionFilterProp="label"
            options={trainerOptions}
          />
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="invoices-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={invoices}
          loading={isLoading}
          rowKey={(record: InvoiceRecord) => record._id || record.invoiceNumber || ''}
          scroll={{ x: 3500 }}
          sticky={{ offsetHeader: 0 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={(invoicesData as any)?.pagination?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />

      <Modal
        open={verifyModal}
        title="Verify Invoice"
        okText="Verify"
        cancelText="Cancel"
        onOk={handleVerifyConfirm}
        onCancel={() => { setVerifyModal(false); setActionInvoice(null); }}
      >
        <p>Verify invoice <strong>{actionInvoice?.invoiceNumber}</strong>?</p>
      </Modal>

      <Modal
        open={unverifyModal}
        title="Unverify Invoice"
        okText="Unverify"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        onOk={handleUnverifyConfirm}
        onCancel={() => { setUnverifyModal(false); setActionInvoice(null); }}
      >
        <p>Remove verification for invoice <strong>{actionInvoice?.invoiceNumber}</strong>?</p>
      </Modal>
    </div>
  );
};

export default AllInvoice;
