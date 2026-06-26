import { useMemo, useState } from "react";
import ColumnVisibility from "../../columnVisibility";
import CommonTable from "../../commonTable";
import SearchBar from "../../searchBar";
import parkingHistoryColumns from "./columns";
import "./styles.scss";

const TrainerParkingHistory = () => {
  const [searchText, setSearchText] = useState("");

  // 🔹 EXACT column keys (MUST MATCH columns.js)
  const [visibleColumns, setVisibleColumns] = useState({
    vehicleId: true,
    entryTime: true,
    exitTime: true,
    parkingLot: true,
  });

  // 🔹 Demo data (API ready)
  const parkingData = [
    {
      vehicleId: "MH12AB1234",
      entryTime: "09:00 AM",
      exitTime: "06:00 PM",
      parkingLot: "Lot A",
    },
    {
      vehicleId: "MH12AB5678",
      entryTime: "08:30 AM",
      exitTime: "05:30 PM",
      parkingLot: "Lot B",
    },
  ];

  const allColumns = parkingHistoryColumns;

  // 🔹 Column visibility filter
  const columns = useMemo(() => {
    if (!Array.isArray(allColumns)) return [];
    return allColumns.filter((col) => visibleColumns[col.key]);
  }, [visibleColumns, allColumns]);

  // 🔹 Search filter
  const filteredData = useMemo(() => {
    if (!searchText) return parkingData;
    return parkingData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, parkingData]);

  // 🔹 Toggle columns
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  return (
    <div className="parking-history-container">
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
        rowKey={(record, index) => index}
        scroll={{ x: "max-content" }}
        pagination={false}
      />
    </div>
  );
};

export default TrainerParkingHistory;