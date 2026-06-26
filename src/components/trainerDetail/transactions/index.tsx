import React, { useMemo, useState } from "react";
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import transactionsColumns from "./columns";
import "./styles.scss";

const TrainerTransactions = () => {
  const [searchText, setSearchText] = useState("");

  // 🔹 EXACT column keys (MUST MATCH columns.js)
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    transactionId: true,
    amount: true,
    branchName: true,
    branchName2: true,
  });

  // 🔹 Demo data (API ready)
  const transactionsData = [
    {
      date: "2025-12-20",
      transactionId: "TXN001",
      amount: 50000,
      branchName: "FitClub Main",
      branchName2: "FitClub Main",
    },
    {
      date: "2025-12-15",
      transactionId: "TXN002",
      amount: 5000,
      branchName: "FitClub Branch",
      branchName2: "FitClub Branch",
    },
  ];

  const allColumns = transactionsColumns;

  // 🔹 Column visibility filter
  const columns = useMemo(() => {
    if (!Array.isArray(allColumns)) return [];
    return allColumns.filter((col) => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  // 🔹 Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return transactionsData;
    return transactionsData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, transactionsData]);

  // 🔹 Toggle columns
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  return (
    <div className="transactions-container">
      <div className="table-controls">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search transactions"
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

export default TrainerTransactions;