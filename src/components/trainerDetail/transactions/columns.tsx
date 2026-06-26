// columns.js

import { Tag } from "antd";

const transactionsColumns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Transaction Id",
    dataIndex: "transactionId",
    key: "transactionId",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (amount) => `₹${amount}`,
  },
  {
    title: "Branch Name",
    dataIndex: "branchName",
    key: "branchName",
  },
  {
    title: "Branch Name",
    dataIndex: "branchName2",
    key: "branchName2",
  },
];

export default transactionsColumns;