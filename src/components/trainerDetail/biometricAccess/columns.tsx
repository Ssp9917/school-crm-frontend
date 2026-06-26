// columns.js

import { Tag } from "antd";

const trainerBiometricAccessColumns = [
  {
    title: "Machine Id",
    dataIndex: "machineId",
    key: "machineId",
  },
  {
    title: "In / Out",
    dataIndex: "inOut",
    key: "inOut",
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
    dataIndex: "branchName",
    key: "branchName",
  },
  {
    title: "Branch Floor",
    dataIndex: "branchFloor",
    key: "branchFloor",
  },
];

export default trainerBiometricAccessColumns;