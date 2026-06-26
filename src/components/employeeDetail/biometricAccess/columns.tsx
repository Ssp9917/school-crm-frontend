import React from 'react';
import { Tag } from 'antd';

export const getBiometricAccessColumns = () => [
  {
    title: 'Machine Name',
    dataIndex: 'machineName',
    key: 'machineName',
    width: 160,
    render: (_: any, record: any) => record.machineName || record.name || record.machine || '-',
  },
  {
    title: 'Branch',
    dataIndex: 'branchName',
    key: 'branchName',
    width: 150,
    render: (_: any, record: any) =>
      record.branchName || record.branch?.name || record.branchId?.name || '-',
  },
  {
    title: 'Device ID',
    dataIndex: 'deviceId',
    key: 'deviceId',
    width: 140,
    render: (_: any, record: any) => record.deviceId || record.device_id || '-',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 110,
    render: (status: string) => {
      const s = (status || '').toLowerCase();
      const color = s === 'active' ? 'green' : s === 'inactive' ? 'red' : 'default';
      return <Tag color={color}>{(status || '-').toUpperCase()}</Tag>;
    },
  },
];
