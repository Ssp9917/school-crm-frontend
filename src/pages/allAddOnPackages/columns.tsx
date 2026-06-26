import React from 'react';
import { Button, Tag, Dropdown, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';

const allColumns = (
  onEdit?:    (id: string) => void,
  onDelete?:  (id: string) => void,
  onToggle?:  (record: any) => void,
  canEdit    = true,
  canDelete  = true,
  canToggle  = true,
  togglingId?: string | null,
) => [
  {
    title: 'Branch Name',
    dataIndex: 'branch',
    key: 'branch',
    width: 150,
  },
  {
    title: 'Package Type',
    dataIndex: 'packageType',
    key: 'packageType',
    width: 150,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  {
    title: 'Session',
    dataIndex: 'session',
    key: 'session',
    width: 100,
  },
  {
    title: 'Pricing',
    dataIndex: 'pricing',
    key: 'pricing',
    width: 120,
  },
  {
    title: 'Number Of Days',
    dataIndex: 'numberOfDays',
    key: 'numberOfDays',
    width: 120,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    align: 'center' as const,
    render: (status: string) => (
      <Tag color={status === 'active' ? 'green' : 'red'}>
        {status === 'active' ? 'ACTIVE' : 'INACTIVE'}
      </Tag>
    ),
  },
  ...(canToggle ? [{
    title: 'Toggle',
    key: 'toggle',
    width: 80,
    align: 'center' as const,
    render: (_: any, record: any) => (
      <Switch
      size='small'
        checked={record.status === 'active'}
        loading={togglingId === record._id}
        onChange={() => onToggle?.(record)}
        style={{ backgroundColor: record.status === 'active' ? '#52c41a' : undefined }}
      />
    ),
  }] : []),
  ...(canEdit || canDelete ? [{
    title: 'Actions',
    key: 'actions',
    width: 80,
    align: 'center' as const,
    render: (_: any, record: any) => {
      const menuItems = [
        ...(canEdit ? [{
          key: 'edit',
          label: 'Edit',
          icon: <EditOutlined />,
          onClick: () => onEdit?.(record._id),
        }] : []),
        ...(canDelete ? [{
          key: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => onDelete?.(record._id),
        }] : []),
      ];
      if (menuItems.length === 0) return null;
      return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
        </Dropdown>
      );
    },
  }] : []),
];

export default allColumns;
