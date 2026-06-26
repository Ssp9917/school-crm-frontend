import React, { useMemo, useState } from 'react';
import './styles.scss';
import { getSalesHistoryColumns } from './columns';
import { user } from '../../../assets';
import SearchBar from '../../searchBar';
import ColumnVisibility from '../../columnVisibility';
import CommonTable from '../../commonTable';

const SalesHistorySection = () => {
  const [searchText, setSearchText] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    branch: true,
    profile: true,
    name: true,
    contact: true,
    planName: true,
    planPrice: true,
    gender: true,
    status: true,
    invoiceStatus: true,
    salesPerson: true,
    membershipForm: true,
    startDate: true,
    endDate: true,
  });

  // 🔹 demo sales data
  const salesData = [
    {
      branch: 'Gurgaon',
      profile: user,
      name: 'Shashank Kumar',
      contact: '7903602717',
      planName: 'Gold Membership',
      planPrice: 18000,
      gender: 'Male',
      status: 'Active',
      invoiceStatus: 'Paid',
      salesPerson: 'Rahul Verma',
      membershipForm: 'Offline',
      startDate: '01-06-2024',
      endDate: '01-06-2025',
    },
  ];

  const allColumns = getSalesHistoryColumns();

  const columns = useMemo(() => {
    return allColumns.filter(col => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  const filteredData = useMemo(() => {
    if (!searchText) return salesData;
    return salesData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, salesData]);

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="table-controls">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search sales history"
        />

        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
      </div>

    
        <CommonTable
          columns={columns}
          dataSource={filteredData}
          scroll={{ x: 'max-content' }}
          pagination={false}
        />
    </>
  );
};

export default SalesHistorySection;
