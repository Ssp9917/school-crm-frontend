import { Button, Dropdown, Switch } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface InventoryRecord {
  _id?:              string;
  id?:               string;
  key?:              string;
  branchId?:         { name?: string } | string;
  branchName?:       string;
  warehouseName?:    string;
  productName?:      string;
  quantity?:         number;
  quantityAvailable?: number;
  status?:           string;
}

/* ─── Base column definitions (template — actions overridden by getInventoryColumns) ── */

const allColumns = [
  {
    title:     'Branch Name',
    dataIndex: 'branchName',
    key:       'branchName',
    width:     150,
    render:    (text: string, record: InventoryRecord) => {
      if (record.branchId && typeof record.branchId === 'object') {
        return (record.branchId as { name?: string }).name || 'N/A';
      }
      return text || 'N/A';
    },
  },
  {
    title:     'Warehouse Name',
    dataIndex: 'warehouseName',
    key:       'warehouseName',
    width:     150,
    render:    (text: string) => text || 'N/A',
  },
  {
    title:     'Product Name',
    dataIndex: 'productName',
    key:       'productName',
    width:     200,
  },
  {
    title:     'Quantity',
    dataIndex: 'quantity',
    key:       'quantity',
    width:     100,
    align:     'center' as const,
  },
  {
    title:     'Quantity Available',
    dataIndex: 'quantity',
    key:       'quantityAvailable',
    width:     150,
    align:     'center' as const,
  },
  {
    title:     'Status',
    dataIndex: 'status',
    key:       'status',
    width:     120,
    align:     'center' as const,
  },
  {
    title:  'Actions',
    key:    'actions',
    width:  100,
    align:  'center' as const,
    render: () => null,
  },
];

/* ─── Columns factory ────────────────────────────────────────────────── */

export const getInventoryColumns = (
  handleEdit:          (record: InventoryRecord) => void,
  handleDelete:        (record: InventoryRecord) => void,
  handleStatusToggle:  (record: InventoryRecord, status: string) => void,
  handleAddQuantity:   (record: InventoryRecord) => void,
  canEdit   = true,
  canDelete = true,
) => {
  return allColumns.map(col => {
    if (col.key === 'status') {
      return {
        ...col,
        render: (status: string, record: InventoryRecord) => (
          <Switch
            checked={status === 'active'}
            onChange={(checked: boolean) => {
              handleStatusToggle(record, checked ? 'active' : 'inactive');
            }}
            checkedChildren="On"
            unCheckedChildren="Off"
            size="small"
          />
        ),
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (_: unknown, record: InventoryRecord) => {
          const menuItems = [
            ...(canEdit ? [{
              key:     'edit',
              label:   'Edit',
              icon:    <EditOutlined />,
              onClick: () => handleEdit(record),
            }] : []),
            ...(canEdit ? [{
              key:     'addQuantity',
              label:   'Add Quantity',
              icon:    <PlusOutlined />,
              onClick: () => handleAddQuantity(record),
            }] : []),
            ...(canDelete ? [{
              key:     'delete',
              label:   'Delete',
              icon:    <DeleteOutlined />,
              danger:  true,
              onClick: () => handleDelete(record),
            }] : []),
          ];
          return (
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
            </Dropdown>
          );
        },
      };
    }

    return col;
  });
};

export default allColumns;
