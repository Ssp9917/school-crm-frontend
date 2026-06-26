import React from 'react';
import { Dropdown, Button, Tag, Tooltip, Modal, Image } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { InvoiceDetailRoute, EditInvoiceRoute } from '../../routes/routepath';

const getModeLabel = (mode) => {
  switch (mode) {
    case 'cash': return { label: 'Cash', color: 'green' };
    case 'card': return { label: 'Card', color: 'blue' };
    case 'upi': return { label: 'UPI', color: 'purple' };
    case 'netbanking': return { label: 'Bank Transfer', color: 'cyan' };
    case 'cheque': return { label: 'Cheque', color: 'orange' };
    case 'creditnote': return { label: 'Credit Note', color: 'magenta' };
    case 'banktransfer': return { label: 'Bank Transfer', color: 'cyan' };
    default: return { label: mode || '-', color: 'default' };
  }
};

export const getPartialInvoicesColumns = (handleEdit, handleDelete, handleView, theme, canEdit = true, canDelete = true) => [
  // 1. Branch
  {
    title: 'Branch Name',
    key: 'branchName',
    width: 150,
    render: (_, record) => record.branch?.name || '-',
  },
  // 2. Invoice No.
  {
    title: 'Invoice No.',
    dataIndex: 'invoiceNumber',
    key: 'invoiceNumber',
    // fixed: 'left',
    width: 140,
    render: (invoiceNumber, record) => (
      <Link to={`${InvoiceDetailRoute}/${record._id}`} style={{ color: '#1890ff', textDecoration: 'none' }}>
        {invoiceNumber}
      </Link>
    ),
  },
  // 3. Invoice Date
  {
    title: 'Invoice Date',
    dataIndex: 'createdAt',
    key: 'invoiceDate',
    width: 160,
    render: (date) => {
      if (!date) return '-';
      const d = new Date(date);
      return `${d.toLocaleDateString('en-IN')} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    },
  },
  // 4. Payment Date
  {
    title: 'Payment Date',
    dataIndex: 'payments',
    key: 'paymentDate',
    width: 110,
    render: (payments) => {
      const date = payments?.[0]?.paymentDate;
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-IN');
    },
  },
  // 5. Name
  {
    title: 'Name',
    key: 'customerName',
    width: 150,
    render: (_, record) => record.user?.name || '-',
  },
  // 6. Mobile No.
  {
    title: 'Mobile No.',
    key: 'customerMobile',
    width: 120,
    render: (_, record) => record.user?.phoneNumber || '-',
  },
  // 7. Service Type
  {
    title: 'Service Type',
    key: 'serviceType',
    width: 140,
    render: (_, record) => {
      const addonType = record.plan?.addonType;
      const type = record.plan?.type;
      if (addonType) return addonType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (type) return type.charAt(0).toUpperCase() + type.slice(1);
      return '-';
    },
  },
  // 8. Package Name
  {
    title: 'Package Name',
    key: 'packageName',
    width: 150,
    render: (_, record) => record.plan?.name || '-',
  },
  // 9. Sales Person
  {
    title: 'Sales Person',
    key: 'salesPersonName',
    width: 130,
    render: (_, record) => {
      if (record.plan?.type === 'addon') return '-';
      return record.salesPerson?.name || '-';
    },
  },
  // 10. Trainer Name
  {
    title: 'Trainer Name',
    key: 'trainerName',
    width: 130,
    render: (_, record) => {
      if (record.plan?.type !== 'addon') return '-';
      return record.trainer?.name || '-';
    },
  },
  // 11. Invoice Status
  {
    title: 'Invoice Status',
    dataIndex: 'invoiceType',
    key: 'status',
    width: 140,
    render: (invoiceType) => {
      const labelMap = {
        new_client: 'New Client',
        renew: 'Renew',
        upgrade: 'Upgrade',
        balance_clear: 'Balance Clear',
        addon: 'Add-On',
      };
      const colorMap = {
        new_client: 'cyan',
        renew: 'blue',
        upgrade: 'purple',
        balance_clear: 'green',
        addon: 'orange',
      };
      const label = labelMap[invoiceType] || (invoiceType ? invoiceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Partial');
      const color = colorMap[invoiceType] || 'blue';
      return <Tag color={color}>{label.toUpperCase()}</Tag>;
    },
  },
  // 12. Package Price
  {
    title: 'Package Price(₹)',
    key: 'packagePrice',
    width: 130,
    render: (_, record) => {
      const price = record.plan?.pricing;
      return price ? `₹${price.toLocaleString()}` : '₹0';
    },
  },
  // 13. Items Price
  {
    title: 'Items Price(₹)',
    dataIndex: 'itemsPrice',
    key: 'itemsPrice',
    width: 120,
    render: (price) => price ? `₹${price.toLocaleString()}` : '₹0',
  },
  // 14. Discount
  {
    title: 'Discount',
    dataIndex: 'discountAmount',
    key: 'discount',
    width: 100,
    render: (discount) => {
      if (!discount) return '-';
      return `₹${discount.toLocaleString()}`;
    },
  },
  // 15. Invoice Amount
  {
    title: 'Invoice Amount(₹)',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    width: 140,
    render: (amount) => amount ? `₹${amount.toLocaleString()}` : '₹0',
  },
  // 19. Due Balance
  {
    title: 'Due Balance(₹)',
    dataIndex: 'dueAmount',
    key: 'dueAmount',
    width: 120,
    render: (amount) => {
      if (!amount || amount === 0) return '₹0';
      return <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>₹{amount.toLocaleString()}</span>;
    },
  },
  // 20. Payment Mode
  {
    title: 'Payment Mode',
    dataIndex: 'payments',
    key: 'paymentMode',
    width: 150,
    render: (payments, record) => {
      if (!payments || payments.length === 0) return '-';
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {payments.map((p, index) => {
            const { label, color } = getModeLabel(p.modeOfPayment);
            const amount = p.amount || 0;
            const receipt = p.receipt?.[0] || null;
            const tooltipContent = (
              <div>
                <div>Amount: ₹{amount.toLocaleString()}</div>
                {p.modeOfPayment === 'cash' && record.createdBy?.name && (
                  <div style={{ marginTop: '4px' }}>Received by: {record.createdBy.name}</div>
                )}
                {receipt && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ paddingRight: '8px', color: 'white' }}>{label} Receipt:</div>
                    <Button
                      type="link" size="small" icon={<EyeOutlined />}
                      style={{ padding: 0, color: '#fff' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        Modal.confirm({
                          title: `${label} Receipt`,
                          content: <div style={{ textAlign: 'center', marginTop: 16 }}><Image src={receipt} alt={`${label} receipt`} style={{ maxWidth: '100%' }} /></div>,
                          width: 600, okText: 'Close',
                          cancelButtonProps: { style: { display: 'none' } },
                          icon: null,
                        });
                      }}
                    >View</Button>
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
  // 21. Payment Type
  {
    title: 'Payment Type',
    dataIndex: 'paymentType',
    key: 'paymentType',
    width: 130,
    render: (type) => {
      if (!type) return '-';
      if (type === 'fullPayment' || type === 'full') return <Tag color="success">Full Payment</Tag>;
      if (type === 'partial') return <Tag color="warning">Partial Payment</Tag>;
      if (type === 'upgrade') return <Tag color="purple">Upgrade</Tag>;
      if (type === 'balanceClear') return <Tag color="green">Balance Clear</Tag>;
      return <Tag>{type}</Tag>;
    },
  },
  // 22. GST Number
  {
    title: 'GST Number',
    dataIndex: 'gstNumber',
    key: 'gstNumber',
    width: 160,
    render: (gstNumber) => gstNumber || '-',
  },
  // 23. Start Date
  {
    title: 'Start Date',
    key: 'startDate',
    width: 110,
    render: (_, record) => {
      const date = record.membership?.startDate;
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-IN');
    },
  },
  // 24. Expiry Date
  {
    title: 'Expiry Date',
    key: 'expiryDate',
    width: 110,
    render: (_, record) => {
      const date = record.membership?.expiryDate;
      if (!date) return '-';
      return new Date(date).toLocaleDateString('en-IN');
    },
  },
  // 25. Receipt
  {
    title: 'Receipt',
    key: 'view',
    width: 80,
    render: (_, record) => (
      <Link to={`${InvoiceDetailRoute}/${record._id}`} style={{ color: '#1890ff', textDecoration: 'none' }}>
        <Button type="text" icon={<EyeOutlined />} size="small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
      </Link>
    ),
  },
  // 26. Actions — only included if at least one action is permitted
  ...(canEdit || canDelete ? [{
    title: 'Actions',
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: (_, record) => {
      const items = [
        ...(canEdit ? [{
          key: 'edit',
          label: (
            <Link to={`${EditInvoiceRoute}/${record._id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}>
              <EditOutlined /> Edit
            </Link>
          ),
        }] : []),
        ...(canDelete ? [{
          key: 'delete',
          label: <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DeleteOutlined /> Delete</span>,
          onClick: () => handleDelete(record),
          danger: true,
        }] : []),
      ];
      return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} size="small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        </Dropdown>
      );
    },
  }] : []),
];
