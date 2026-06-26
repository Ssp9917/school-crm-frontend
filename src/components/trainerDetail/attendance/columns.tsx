// columns.js

import { Tag } from "antd";

const trainerAttendanceColumns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Mobile No.",
    dataIndex: "mobile",
    key: "mobile",
  },
  {
    title: "Date & Time",
    dataIndex: "dateTime",
    key: "dateTime",
  },
  {
    title: "Biometric Id",
    dataIndex: "biometricId",
    key: "biometricId",
  },
  {
    title: "Record Purpose",
    dataIndex: "purpose",
    key: "purpose",
    align: 'center',
    render: (purpose) => (
      <Tag
        color={purpose === 'In' ? 'green' : purpose === 'Out' ? 'red' : 'default'}
      >
        {purpose}
      </Tag>
    ),
  },
  {
    title: "Branch Name",
    dataIndex: "branch",
    key: "branch",
  },
  {
    title: "Branch Floor",
    dataIndex: "floor",
    key: "floor",
  },
];

export default trainerAttendanceColumns;