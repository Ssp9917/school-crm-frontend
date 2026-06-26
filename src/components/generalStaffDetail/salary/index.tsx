import React, { useMemo, useState } from "react";
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import generalStaffSalaryColumns from "./columns";
import "./styles.scss";

const GeneralStaffSalary = () => {
  const [searchText, setSearchText] = useState("");

  // 🔹 Keys MUST match columns.js
  const [visibleColumns, setVisibleColumns] = useState({
    salary: true,
    employeeName: true,
    employeeBranch: true,
    branchName: true,
  });

  // 🔹 Demo data (API ready)
  const salaryData = [
    {
      salary: "₹20,000",
      employeeName: "Karan",
      employeeBranch: "General Staff",
      branchName: "FitClub GC",
    },
    {
      salary: "₹22,000",
      employeeName: "Rohit",
      employeeBranch: "General Staff",
      branchName: "FitClub Andheri",
    },
  ];

  const allColumns = generalStaffSalaryColumns;

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
    <div className="general-staff-salary-section">
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

export default GeneralStaffSalary;
