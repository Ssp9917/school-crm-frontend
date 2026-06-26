import React from 'react';
import { Tag } from 'antd';

export const getParkingHistoryColumns = () => [
  {
    title: 'Date & Time',
    dataIndex: 'dateTime',
    key: 'dateTime',
    width: 160,
  },
  {
    title: 'Punch Type',
    dataIndex: 'punchType',
    key: 'punchType',
    width: 120,
    render: (type) => (
      <Tag color={type === 'Manual' ? 'orange' : 'blue'}>
        {type}
      </Tag>
    ),
  },
  {
    title: 'Entry / Exit',
    dataIndex: 'entryExit',
    key: 'entryExit',
    width: 120,
    render: (value) => (
      <Tag color={value === 'Entry' ? 'green' : 'red'}>
        {value}
      </Tag>
    ),
  },
  {
    title: 'Branch Name',
    dataIndex: 'branchName',
    key: 'branchName',
    width: 150,
  },
  {
    title: 'Branch Floor',
    dataIndex: 'branchFloor',
    key: 'branchFloor',
    width: 130,
  },
];
