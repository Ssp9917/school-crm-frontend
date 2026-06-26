import React from 'react';
import { Tag } from 'antd';

export const getAttendanceColumns = () => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 120,
  },
  {
    title: 'Mobile No.',
    dataIndex: 'mobile',
    key: 'mobile',
    width: 120,
  },
  {
    title: 'Date & Time',
    dataIndex: 'dateTime',
    key: 'dateTime',
    width: 120,
  },
  {
    title: 'Biometric ID',
    dataIndex: 'biometricId',
    key: 'biometricId',
    width: 120,
  },
  {
    title: 'Record Purpose',
    dataIndex: 'purpose',
    key: 'purpose',
    width: 100,
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
    title: 'Branch Name',
    dataIndex: 'branch',
    key: 'branch',
    width: 150,
  },
  {
    title: 'Branch Floor',
    dataIndex: 'floor',
    key: 'floor',
    width: 120,
  },
];
