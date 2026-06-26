import React, { useMemo, useState } from "react";
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import classesColumns from "./columns";
import "./styles.scss";

const TrainerClasses = () => {
  const [searchText, setSearchText] = useState("");

  // 🔹 EXACT column keys (MUST MATCH columns.js)
  const [visibleColumns, setVisibleColumns] = useState({
    className: true,
    date: true,
    time: true,
    duration: true,
    participants: true,
    status: true,
  });

  // 🔹 Demo data (API ready)
  const classesData = [
    {
      className: "Yoga Basics",
      date: "2025-12-24",
      time: "10:00 AM",
      duration: "60 min",
      participants: 15,
      status: "Completed",
    },
    {
      className: "HIIT Training",
      date: "2025-12-24",
      time: "02:00 PM",
      duration: "45 min",
      participants: 20,
      status: "Scheduled",
    },
  ];

  const allColumns = classesColumns;

  // 🔹 Column visibility filter
  const columns = useMemo(() => {
    if (!Array.isArray(allColumns)) return [];
    return allColumns.filter((col) => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  // 🔹 Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return classesData;
    return classesData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, classesData]);

  // 🔹 Toggle columns
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  return (
    <div className="classes-container">
      <div className="table-controls">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search classes"
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
        rowKey={(record, index) => index}
        scroll={{ x: "max-content" }}
        pagination={false}
      />
    </div>
  );
};

export default TrainerClasses;