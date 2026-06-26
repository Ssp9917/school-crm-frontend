import React from 'react';
import { Tag } from 'antd';

export const getSalaryColumns = () => [
  {
    title: 'Employee Name',
    dataIndex: 'employeeName',
    key: 'employeeName',
    width: 180,
  },
  {
    title: 'Employee Branch',
    dataIndex: 'employeeBranch',
    key: 'employeeBranch',
    width: 160,
  },
  {
    title: 'Branch Name',
    dataIndex: 'branchName',
    key: 'branchName',
    width: 160,
  },
  {
    title: 'Salary',
    dataIndex: 'salary',
    key: 'salary',
    width: 140,
    align: 'right',
    render: (salary) => (
      <span style={{ fontWeight: 600 }}>
        ₹{Number(salary).toLocaleString('en-IN')}
      </span>
    ),
  },
];
