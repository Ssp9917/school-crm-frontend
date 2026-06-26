import { Tag, Button, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface AddOnSlotRecord {
  _id?:          string;
  date?:         string;
  planType?:     string;
  className?:    string;
  timeFrom?:     string;
  timeTo?:       string;
  packageName?:  string;
  status?:       string;
}

/* ─── Columns ────────────────────────────────────────────────────────── */

export const getAddOnSlotColumns = (
  handleEdit:   (record: AddOnSlotRecord) => void,
  handleDelete: (record: AddOnSlotRecord) => void,
) => [
  {
    title:     'Date',
    dataIndex: 'date',
    key:       'date',
    width:     120,
    render:    (date: string) => date || '-',
  },
  {
    title:     'Plan Type',
    dataIndex: 'planType',
    key:       'planType',
    width:     150,
  },
  {
    title:     'Class Type',
    dataIndex: 'className',
    key:       'className',
    width:     150,
  },
  {
    title:     'From',
    dataIndex: 'timeFrom',
    key:       'timeFrom',
    width:     100,
    render:    (time: string) => time || '-',
  },
  {
    title:     'To',
    dataIndex: 'timeTo',
    key:       'timeTo',
    width:     100,
    render:    (time: string) => time || '-',
  },
  {
    title:  'View History',
    key:    'viewHistory',
    width:  120,
    align:  'center' as const,
    render: () => (
      <Button type="link" size="small">History</Button>
    ),
  },
  {
    title:  'Actions',
    key:    'actions',
    width:  80,
    align:  'center' as const,
    render: (_: unknown, record: AddOnSlotRecord) => {
      const menuItems = [
        { key: 'edit',   label: 'Edit',   icon: <EditOutlined />,   onClick: () => handleEdit(record)   },
        { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(record) },
      ];
      return (
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
        </Dropdown>
      );
    },
  },
];
