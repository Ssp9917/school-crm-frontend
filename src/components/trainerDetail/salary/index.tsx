import React, { useMemo, useState } from "react";
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import trainerSalaryColumns from "./columns";
import "./styles.scss";

const TrainerSalary = () => {
  const [searchText, setSearchText] = useState("");

  // 🔹 Keys MUST match columns.js
  const [visibleColumns, setVisibleColumns] = useState({
    salary: true,
    trainerName: true,
    trainerType: true,
    branchName: true,
  });

  // 🔹 Demo data (API ready)
  const salaryData = [
    {
      salary: "₹30,000",
      trainerName: "John Doe",
      trainerType: "Personal Training",
      branchName: "FitClub Main",
    },
    {
      salary: "₹35,000",
      trainerName: "Jane Smith",
      trainerType: "Pilates",
      branchName: "FitClub Branch",
    },
  ];

  const allColumns = trainerSalaryColumns;

  // 🔹 Column visibility
  const columns = useMemo(() => {
    if (!Array.isArray(allColumns)) return [];
    return allColumns.filter((col) => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  // 🔹 Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return salaryData;
    return salaryData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, salaryData]);

  // 🔹 Toggle column
  const handleColumnToggle = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="trainer-salary-section">
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
        rowKey={(record, index) => index}
        scroll={{ x: "max-content" }}
        pagination={false}
      />
    </div>
  );
};

export default TrainerSalary;