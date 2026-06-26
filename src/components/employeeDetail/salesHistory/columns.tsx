import React from 'react';
import { Tag } from 'antd';

export const getSalesHistoryColumns = () => [
  {
    title: 'Branch',
    dataIndex: 'branch',
    key: 'branch',
    width: 140,
  },
  {
    title: 'Profile',
    dataIndex: 'profile',
    key: 'profile',
    width: 80,
    render: (img) => (
      <img
        src={img}
        alt="profile"
        style={{ width: 36, height: 36, borderRadius: '50%' }}
      />
    ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 160,
  },
  {
    title: 'Contact No.',
    dataIndex: 'contact',
    key: 'contact',
    width: 130,
  },
  {
    title: 'Plan Name',
    dataIndex: 'planName',
    key: 'planName',
    width: 150,
  },
  {
    title: 'Plan Price',
    dataIndex: 'planPrice',
    key: 'planPrice',
    width: 120,
    align: 'right',
    render: (price) => `₹${price.toLocaleString('en-IN')}`,
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    key: 'gender',
    width: 100,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (status) => (
      <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
    ),
  },
  {
    title: 'Invoice Status',
    dataIndex: 'invoiceStatus',
    key: 'invoiceStatus',
    width: 140,
    render: (status) => (
      <Tag color={status === 'Paid' ? 'blue' : 'orange'}>{status}</Tag>
    ),
  },
  {
    title: 'Sales Person',
    dataIndex: 'salesPerson',
    key: 'salesPerson',
    width: 150,
  },
  {
    title: 'Membership Form',
    dataIndex: 'membershipForm',
    key: 'membershipForm',
    width: 160,
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 120,
  },
  {
    title: 'End Date',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 120,
  },
];
