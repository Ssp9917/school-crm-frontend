import React, { useState } from 'react';
import CommonTable from '../../commonTable';
import SearchBar from '../../searchBar';
import ColumnVisibility from '../../columnVisibility';
import columns from './columns';

// Example data
const initialData = [
  {
    key: '1',
    creditDate: '2026-01-01',
    creditNo: 'CR123',
    creditor: 'John Doe',
    name: 'Bhumika',
    mobileNo: '9876543210',
    prevInvoiceAmount: '₹5,000',
    refundAmount: '₹1,000',
    remarks: 'Duplicate payment',
  },
  // ...more rows
];

const RefundHistory = () => {
  const [search, setSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const obj = {};
    columns.forEach(col => { obj[col.key] = true; });
    return obj;
  });

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = initialData.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const shownColumns = columns.filter(col => visibleColumns[col.key]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search refund history..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ColumnVisibility columns={columns} visibleColumns={visibleColumns} onColumnToggle={handleColumnToggle} />
        </div>
      </div>
      <CommonTable columns={shownColumns} dataSource={filteredData} />
    </div>
  );
};

export default RefundHistory;
