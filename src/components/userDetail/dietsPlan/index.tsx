import React, { useState } from 'react';
import CommonTable from '../../commonTable';
import SearchBar from '../../searchBar';
import ColumnVisibility from '../../columnVisibility';
import columns from './columns';

const initialData = [
  {
    key: '1',
    date: '2026-01-01',
    plan: 'Weight Loss',
    meal: 'Breakfast',
    foodItems: 'Oats, Banana',
    calories: '250',
  },
  // ...more rows
];

const DietsPlan = () => {
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
          <SearchBar value={search} onChange={setSearch} placeholder="Search diets plan..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ColumnVisibility columns={columns} visibleColumns={visibleColumns} onColumnToggle={handleColumnToggle} />
        </div>
      </div>
      <CommonTable columns={shownColumns} dataSource={filteredData} />
    </div>
  );
};

export default DietsPlan;
