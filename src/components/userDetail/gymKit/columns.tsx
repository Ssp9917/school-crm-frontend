const gymKitColumns = [
  {
    title: 'Sr No.',
    dataIndex: 'srNo',
    key: 'srNo',
    width: 80,
    render: (_: unknown, __: unknown, index: number) => index + 1,
  },
  {
    title: 'Product Name',
    dataIndex: 'productName',
    key: 'productName',
    render: (_: unknown, record: any) => record?.inventoryId?.productName || '-',
  },
  {
    title: 'Total Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 150,
    align: 'center' as const,
  },
  {
    title: 'Delivered',
    dataIndex: 'deliveredQuantity',
    key: 'deliveredQuantity',
    width: 150,
    align: 'center' as const,
    render: (text: number) => text || 0,
  },
  {
    title: 'Remaining',
    dataIndex: 'remaining',
    key: 'remaining',
    width: 150,
    align: 'center' as const,
    render: (_: unknown, record: any) => {
      const total     = record?.quantity || 0;
      const delivered = record?.deliveredQuantity || 0;
      return total - delivered;
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    align: 'center' as const,
    render: (_: unknown, record: any) => {
      const total     = record?.quantity || 0;
      const delivered = record?.deliveredQuantity || 0;
      const remaining = total - delivered;
      if (remaining === 0) {
        return <span className="status-badge delivered">Delivered</span>;
      } else if (delivered > 0) {
        return <span className="status-badge partial">Partial</span>;
      } else {
        return <span className="status-badge pending">Pending</span>;
      }
    },
  },
];

export default gymKitColumns;
