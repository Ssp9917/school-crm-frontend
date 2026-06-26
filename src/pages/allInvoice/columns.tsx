import { Dropdown, Button, Tag, Tooltip, Modal, Image } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { InvoiceDetailRoute, EditInvoiceRoute } from '../../routes/routepath';
import BadgeCheck from '../../components/badgeCheck';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface Payment {
  modeOfPayment?: string;
  amount?:        number;
  receipt?:       string[];
  paymentDate?:   string;
}

export interface GstBreakdown {
  taxableAmount?: number;
  cgstAmount?:    number;
  sgstAmount?:    number;
}

export interface InvoiceRecord {
  _id?:              string;
  invoiceNumber?:    string;
  invoiceDate?:      string;
  paymentDate?:      string;
  branchId?:         { name?: string };
  branchName?:       string;
  userId?:           { name?: string; phoneNumber?: string };
  customerName?:     string;
  customerNumber?:   string;
  membershipId?:     { type?: string };
  serviceType?:      string;
  planId?:           { name?: string };
  packageName?:      string;
  salesPerson?:      { name?: string };
  salesPersonId?:    { name?: string };
  employeeId?:       { name?: string; user?: { name?: string } };
  trainerId?:        { name?: string };
  trainerName?:      string;
  invoiceTypeLabel?: string;
  invoiceType?:      string;
  status?:           string;
  planPrice?:        number;
  itemsPrice?:       number;
  discountAmount?:   number | string;
  gstBreakdown?:     GstBreakdown;
  totalAmount?:      number;
  dueAmount?:        number;
  payments?:         Payment[];
  paymentDetails?:   { paymentDate?: string }[];
  paymentType?:      string;
  payment_type?:     string;
  gstNumber?:        string;
  startDate?:        string;
  expiryDate?:       string;
  createdBy?:        { name?: string };
  isVerified?:       boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getStatusColor(status: string | undefined): string {
  switch (status?.toLowerCase()) {
    case 'paid':          return 'green';
    case 'pending':       return 'orange';
    case 'overdue':       return 'red';
    case 'cancelled':     return 'default';
    case 'partial':       return 'blue';
    case 'complete':      return 'green';
    case 'new client':    return 'cyan';
    case 'upgrade':       return 'purple';
    case 'balance clear': return 'green';
    default:              return 'blue';
  }
}

function formatDate(date: string | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN');
}

/* ─── Columns ────────────────────────────────────────────────────────── */

export const getInvoicesColumns = (
  handleEdit:   (record: InvoiceRecord) => void,
  handleDelete: (record: InvoiceRecord) => void,
  handleView:   (record: InvoiceRecord) => void,
  theme:        string,
  canEdit    = true,
  canDelete  = true,
  handleVerify?:   (record: InvoiceRecord) => void,
  canVerify      = false,
  handleUnverify?: (record: InvoiceRecord) => void,
  canUnverify    = false,
) => [
  {
    title:     'Branch Name',
    dataIndex: ['branchId', 'name'],
    key:       'branchName',
    width:     150,
    render:    (_: unknown, record: InvoiceRecord) => record.branchId?.name || record.branchName || '-',
  },
  {
    title:     'Invoice No.',
    dataIndex: 'invoiceNumber',
    key:       'invoiceNumber',
    width:     160,
    render:    (invoiceNumber: string, record: InvoiceRecord) => (
      <Link to={`${InvoiceDetailRoute}/${record._id}`} style={{ color: '#1890ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {invoiceNumber}
        <BadgeCheck size={16} verified={!!record.isVerified} />
      </Link>
    ),
  },
  {
    title:     'Invoice Date',
    dataIndex: 'invoiceDate',
    key:       'invoiceDate',
    width:     160,
    render:    (date: string) => {
      if (!date) return '-';
      const d       = new Date(date);
      const dateStr = d.toLocaleDateString('en-IN');
      const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} ${timeStr}`;
    },
  },
  {
    title:     'Payment Date',
    dataIndex: 'paymentDate',
    key:       'paymentDate',
    width:     110,
    render:    (date: string, record: InvoiceRecord) => {
      if (record.paymentDetails && record.paymentDetails.length > 0) {
        const first = record.paymentDetails[0].paymentDate;
        if (first) return formatDate(first);
      }
      return formatDate(date);
    },
  },
  {
    title:     'Name',
    dataIndex: ['userId', 'name'],
    key:       'customerName',
    width:     150,
    render:    (_: unknown, record: InvoiceRecord) => record.userId?.name || record.customerName || '-',
  },
  {
    title:     'Mobile No.',
    dataIndex: ['userId', 'phoneNumber'],
    key:       'customerMobile',
    width:     120,
    render:    (_: unknown, record: InvoiceRecord) => record.userId?.phoneNumber || record.customerNumber || '-',
  },
  {
    title:     'Service Type',
    dataIndex: ['membershipId', 'type'],
    key:       'serviceType',
    width:     120,
    render:    (_: unknown, record: InvoiceRecord) => {
      const type = record.membershipId?.type || record.serviceType;
      if (!type) return '-';
      if (type === 'addon' && record.serviceType) {
        return record.serviceType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      }
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
  },
  {
    title:     'Package Name',
    dataIndex: ['planId', 'name'],
    key:       'packageName',
    width:     150,
    render:    (_: unknown, record: InvoiceRecord) => record.planId?.name || record.packageName || '-',
  },
  {
    title:     'Sales Person',
    dataIndex: ['employeeId', 'name'],
    key:       'salesPersonName',
    width:     130,
    render:    (_: unknown, record: InvoiceRecord) => {
      if (record.membershipId?.type === 'addon') return '-';
      return record.salesPerson?.name || record.salesPersonId?.name || record.employeeId?.user?.name || record.employeeId?.name || '-';
    },
  },
  {
    title:     'Trainer Name',
    dataIndex: ['trainerId', 'name'],
    key:       'trainerName',
    width:     130,
    render:    (_: unknown, record: InvoiceRecord) => {
      if (record.membershipId?.type !== 'addon') return '-';
      return record.trainerName || record.trainerId?.name || '-';
    },
  },
  {
    title:     'Invoice Status',
    dataIndex: 'invoiceTypeLabel',
    key:       'status',
    width:     140,
    render:    (invoiceTypeLabel: string, record: InvoiceRecord) => {
      const status = invoiceTypeLabel || record.status;
      return (
        <Tag color={getStatusColor(status)}>
          {(status || 'pending').toUpperCase()}
        </Tag>
      );
    },
  },
  {
    title:     'Package Price(₹)',
    dataIndex: 'planPrice',
    key:       'packagePrice',
    width:     130,
    render:    (price: number) => price ? `₹${price.toLocaleString()}` : '₹0',
  },
  {
    title:     'Items Price(₹)',
    dataIndex: 'itemsPrice',
    key:       'itemsPrice',
    width:     120,
    render:    (price: number) => price ? `₹${price.toLocaleString()}` : '₹0',
  },
  {
    title:     'Discount',
    dataIndex: 'discountAmount',
    key:       'discount',
    width:     100,
    render:    (discount: number | string, record: InvoiceRecord) => {
      if (record.invoiceType === 'balance_clear') return '₹0';
      if (!discount) return '-';
      return typeof discount === 'number' ? `₹${discount.toLocaleString()}` : discount;
    },
  },
  {
    title:     'Taxable amount(₹)',
    dataIndex: 'gstBreakdown',
    key:       'taxableAmount',
    width:     140,
    render:    (gstBreakdown: GstBreakdown) => {
      const amt = gstBreakdown?.taxableAmount;
      return amt != null ? `₹${Number(amt).toLocaleString()}` : '₹0';
    },
  },
  {
    title:     'CGST',
    dataIndex: ['gstBreakdown', 'cgstAmount'],
    key:       'cgst',
    width:     100,
    render:    (_: unknown, record: InvoiceRecord) =>
      `₹${(record.gstBreakdown?.cgstAmount ?? 0).toLocaleString()}`,
  },
  {
    title:     'SGST',
    dataIndex: ['gstBreakdown', 'sgstAmount'],
    key:       'sgst',
    width:     100,
    render:    (_: unknown, record: InvoiceRecord) =>
      `₹${(record.gstBreakdown?.sgstAmount ?? 0).toLocaleString()}`,
  },
  {
    title:     'Invoice Amount(₹)',
    dataIndex: 'totalAmount',
    key:       'totalAmount',
    width:     140,
    render:    (amount: number) => amount ? `₹${amount.toLocaleString()}` : '₹0',
  },
  {
    title:     'Due Balance(₹)',
    dataIndex: 'dueAmount',
    key:       'dueAmount',
    width:     120,
    render:    (amount: number) => {
      if (!amount || amount === 0) return '₹0';
      return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>₹{amount.toLocaleString()}</span>;
    },
  },
  {
    title:     'Payment Mode',
    dataIndex: 'payments',
    key:       'paymentMode',
    width:     150,
    render:    (payments: Payment[], record: InvoiceRecord) => {
      if (!payments?.length) return '-';
      const createdByName = record.createdBy?.name;
      const modeColor: Record<string, string> = {
        cash: 'green', card: 'blue', upi: 'purple',
        netbanking: 'cyan', cheque: 'orange', creditnote: 'magenta',
      };
      const modeLabel: Record<string, string> = {
        cash: 'Cash', card: 'Card', upi: 'UPI',
        netbanking: 'Bank Transfer', cheque: 'Cheque', creditnote: 'Credit Note',
      };
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {payments.map((p, index) => {
            const mode    = p.modeOfPayment || '';
            const amount  = p.amount || 0;
            const receipt = p.receipt?.length ? p.receipt[0] : null;
            const color   = modeColor[mode] || 'default';
            const label   = modeLabel[mode] || mode;

            const tooltipContent = (
              <div>
                <div>Amount: ₹{amount.toLocaleString()}</div>
                {mode === 'cash' && createdByName && (
                  <div style={{ marginTop: '4px' }}>Received by: {createdByName}</div>
                )}
                {receipt && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ paddingRight: '8px', color: 'white' }}>{label} Receipt:</div>
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      style={{ padding: 0, color: '#fff' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        Modal.confirm({
                          title:   <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{label} Receipt</span>,
                          content: (
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                              <Image src={receipt} alt={`${label} receipt`} style={{ maxWidth: '100%' }} />
                            </div>
                          ),
                          width:               600,
                          okText:              'Close',
                          cancelButtonProps:   { style: { display: 'none' } },
                          className:           theme === 'dark' ? 'dark-modal' : '',
                          icon:                null,
                        });
                      }}
                    >
                      View
                    </Button>
                  </div>
                )}
              </div>
            );

            return (
              <Tooltip key={index} title={tooltipContent}>
                <Tag color={color}>{label}</Tag>
              </Tooltip>
            );
          })}
        </div>
      );
    },
  },
  {
    title:     'Payment Type',
    dataIndex: 'paymentType',
    key:       'paymentType',
    width:     130,
    render:    (type: string, record: InvoiceRecord) => {
      const paymentType = type || record.payment_type;
      if (!paymentType) return '-';
      if (paymentType === 'fullPayment' || paymentType === 'full')  return <Tag color="success">Full Payment</Tag>;
      if (paymentType === 'partial')     return <Tag color="warning">Partial Payment</Tag>;
      if (paymentType === 'upgrade')     return <Tag color="purple">Upgrade</Tag>;
      if (paymentType === 'balanceClear') return <Tag color="green">Balance Clear</Tag>;
      if (paymentType === 'newClient')   return <Tag color="cyan">New Client</Tag>;
      return <Tag>{paymentType}</Tag>;
    },
  },
  {
    title:     'GST Number',
    dataIndex: 'gstNumber',
    key:       'gstNumber',
    width:     160,
    render:    (gstNumber: string) => gstNumber || '-',
  },
  {
    title:     'Start Date',
    dataIndex: 'startDate',
    key:       'startDate',
    width:     110,
    render:    (date: string) => formatDate(date),
  },
  {
    title:     'Expiry Date',
    dataIndex: 'expiryDate',
    key:       'expiryDate',
    width:     110,
    render:    (date: string) => formatDate(date),
  },
  {
    title:  'Receipt',
    key:    'view',
    width:  80,
    render: (_: unknown, record: InvoiceRecord) => (
      <Link to={`${InvoiceDetailRoute}/${record._id}`} style={{ color: '#1890ff', textDecoration: 'none' }}>
        <Button
          type="text"
          icon={<EyeOutlined />}
          size="small"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </Link>
    ),
  },
  {
    title:  'Actions',
    key:    'actions',
    width:  100,
    fixed:  'right' as const,
    render: (_: unknown, record: InvoiceRecord) => {
      const items = [
        ...(canVerify && handleVerify && !record.isVerified ? [{
          key:     'verify',
          label:   (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BadgeCheck size={14} verified={true} />
              Verify
            </span>
          ),
          onClick: () => handleVerify(record),
        }] : []),
        ...(canUnverify && handleUnverify && record.isVerified ? [{
          key:     'unverify',
          label:   (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BadgeCheck size={14} verified={false} />
              Unverify
            </span>
          ),
          onClick: () => handleUnverify(record),
        }] : []),
        ...(canEdit ? [{
          key:   'edit',
          label: (
            <Link
              to={`${EditInvoiceRoute}/${record._id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}
            >
              <EditOutlined />
              Edit
            </Link>
          ),
        }] : []),
        ...(canDelete ? [{
          key:     'delete',
          label:   (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DeleteOutlined />
              Delete
            </span>
          ),
          onClick: () => handleDelete(record),
          danger:  true,
        }] : []),
      ];
      return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Dropdown>
      );
    },
  },
];
