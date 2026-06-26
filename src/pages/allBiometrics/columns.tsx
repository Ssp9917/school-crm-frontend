import React from 'react';
import { Dropdown, Button, Tooltip } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface BiometricRecord {
  _id?:         string;
  machineId?:   string;
  branchId?: {
    name?:    string;
    address?: string;
  };
  floor?:         string;
  recordPurpose?: string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const PURPOSE_STYLE: Record<string, React.CSSProperties> = {
  in: {
    color:         '#52c41a',
    background:    '#f6ffed',
    border:        '1px solid #b7eb8f',
    padding:       '2px 8px',
    borderRadius:  '4px',
    textTransform: 'uppercase',
    fontWeight:    '500',
  },
  out: {
    color:         '#ff4d4f',
    background:    '#fff2f0',
    border:        '1px solid #ffccc7',
    padding:       '2px 8px',
    borderRadius:  '4px',
    textTransform: 'uppercase',
    fontWeight:    '500',
  },
};

/* ─── Columns ────────────────────────────────────────────────────────── */

export const getBiometricsColumns = (
  handleEdit:   (record: BiometricRecord) => void,
  handleDelete: (record: BiometricRecord) => void,
  canEdit   = true,
  canDelete = true,
) => [
  {
    title:     'Id',
    dataIndex: '_id',
    key:       'id',
    width:     100,
    render:    (_: unknown, __: unknown, index: number) => index + 1,
  },
  {
    title:     'Machine Id',
    dataIndex: 'machineId',
    key:       'machineId',
    width:     130,
  },
  {
    title:     'Branch Name',
    dataIndex: ['branchId', 'name'],
    key:       'branchName',
    width:     150,
    render:    (_: unknown, record: BiometricRecord) => record.branchId?.name || '-',
  },
  {
    title:     'Branch Address',
    dataIndex: ['branchId', 'address'],
    key:       'branchAddress',
    width:     200,
    render:    (_: unknown, record: BiometricRecord) => {
      const address = record.branchId?.address;
      if (!address) return '-';
      return (
        <Tooltip title={address}>
          <span style={{ display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address}
          </span>
        </Tooltip>
      );
    },
  },
  {
    title:     'Floor',
    dataIndex: 'floor',
    key:       'floor',
    width:     100,
    render:    (floor: string) => floor || '-',
  },
  {
    title:     'Record Purpose',
    dataIndex: 'recordPurpose',
    key:       'recordPurpose',
    width:     150,
    render:    (purpose: string) => {
      if (!purpose) return '-';
      return (
        <span style={PURPOSE_STYLE[purpose] ?? {}}>
          {purpose.toUpperCase()}
        </span>
      );
    },
  },
  {
    title:  'Actions',
    key:    'actions',
    width:  100,
    fixed:  'right' as const,
    render: (_: unknown, record: BiometricRecord) => {
      const items = [
        ...(canEdit ? [{
          key:     'edit',
          label:   (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EditOutlined />
              Edit
            </span>
          ),
          onClick: () => handleEdit(record),
        }] : []),
        ...(canDelete ? [{
          key:    'delete',
          label:  (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DeleteOutlined />
              Delete
            </span>
          ),
          onClick: () => handleDelete(record),
          danger:  true,
        }] : []),
      ];

      return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined />}
            size="small"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </Dropdown>
      );
    },
  },
];
