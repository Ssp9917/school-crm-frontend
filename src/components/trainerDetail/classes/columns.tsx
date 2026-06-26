// columns.js

import { Tag } from "antd";

const classesColumns = [
  {
    title: "Class Name",
    dataIndex: "className",
    key: "className",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
  },
  {
    title: "Duration",
    dataIndex: "duration",
    key: "duration",
  },
  {
    title: "Participants",
    dataIndex: "participants",
    key: "participants",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: 'center',
    render: (status) => (
      <Tag
        color={status === 'Completed' ? 'green' : status === 'Scheduled' ? 'blue' : 'default'}
      >
        {status}
      </Tag>
    ),
  },
];

export default classesColumns;