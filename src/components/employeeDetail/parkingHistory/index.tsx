import React, { useMemo, useState } from 'react';
import './styles.scss';
import SearchBar from '../../searchBar';
import ColumnVisibility from '../../columnVisibility';
import CommonTable from '../../commonTable';
import { getParkingHistoryColumns } from './columns';

const ParkingHistorySection = () => {
  const [searchText, setSearchText] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    dateTime: true,
    punchType: true,
    entryExit: true,
    branchName: true,
    branchFloor: true,
  });

  // 🔹 demo parking data
  const parkingData = [
    {
      dateTime: '01-06-2024 09:10 AM',
      punchType: 'Auto',
      entryExit: 'Entry',
      branchName: 'Gurgaon',
      branchFloor: 'Basement',
    },
    {
      dateTime: '01-06-2024 06:45 PM',
      punchType: 'Auto',
      entryExit: 'Exit',
      branchName: 'Gurgaon',
      branchFloor: 'Basement',
    },
  ];

  const allColumns = getParkingHistoryColumns();

  const columns = useMemo(() => {
    return allColumns.filter(col => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  const filteredData = useMemo(() => {
    if (!searchText) return parkingData;
    return parkingData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, parkingData]);

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="table-controls">
        <div className="controls-left">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search parking history"
          />
        </div>

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

export default ParkingHistorySection;
