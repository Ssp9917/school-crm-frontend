import React, { useMemo, useState } from 'react';
import './styles.scss';
import SearchBar from '../../searchBar';
import ColumnVisibility from '../../columnVisibility';
import CommonTable from '../../commonTable';
import { getSalaryColumns } from './columns';

const SalarySection = () => {
  const [searchText, setSearchText] = useState('');

  // ✅ salary-based column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    employeeName: true,
    employeeBranch: true,
    branchName: true,
    salary: true,
  });

  // ✅ salary demo data
  const salaryData = [
    {
      employeeName: 'Shashank Kumar',
      employeeBranch: 'Trainer',
      branchName: 'Gurgaon',
      salary: 35000,
    },
    {
      employeeName: 'Rahul Verma',
      employeeBranch: 'Manager',
      branchName: 'Delhi',
      salary: 42000,
    },
  ];

  const allColumns = getSalaryColumns();

  // ✅ visible columns logic
  const columns = useMemo(() => {
    if (!Array.isArray(allColumns)) return [];
    return allColumns.filter(col => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  // ✅ search filter
  const filteredData = useMemo(() => {
    if (!searchText) return salaryData;
    return salaryData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, salaryData]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  return (
    <>
      <div className="table-controls">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search salary"
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

export default SalarySection;
