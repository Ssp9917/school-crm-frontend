import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, notification } from 'antd';
import { useGetBranchesQuery } from '../../../services/branches';
import { useUpdateInventoryMutation } from '../../../services/inventory';
import ImagePicker from '../../form/ImagePicker';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface InventoryRecord {
  _id: string;
  productName?: string;
  branchId?: { _id?: string } | string;
  quantity?: number;
  warehouseName?: string;
  warehouseId?: { name?: string };
  productImage?: string;
}

interface InventoryFormValues {
  productName: string;
  branch: string;
  quantity: number;
  warehouseName: string;
  productImage?: string;
}

interface EditInventoryModalProps {
  open: boolean;
  onClose: () => void;
  recordData?: InventoryRecord;
  onSuccess?: () => void;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const warehouseOptions = [
  { label: 'Main Warehouse',   value: 'main_warehouse'   },
  { label: 'Storage Room A',   value: 'storage_a'        },
  { label: 'Storage Room B',   value: 'storage_b'        },
  { label: 'Equipment Room',   value: 'equipment_room'   },
  { label: 'Maintenance Area', value: 'maintenance_area' },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const EditInventoryModal = ({ open, onClose, recordData, onSuccess }: EditInventoryModalProps) => {
  const [form] = Form.useForm<InventoryFormValues>();
  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery(undefined);
  const [updateInventory, { isLoading }]                   = useUpdateInventoryMutation();

  useEffect(() => {
    if (open && recordData) {
      form.setFieldsValue({
        productName:   recordData.productName || '',
        branch:        typeof recordData.branchId === 'object'
                         ? recordData.branchId?._id || ''
                         : recordData.branchId || '',
        quantity:      recordData.quantity || 0,
        warehouseName: recordData.warehouseName || recordData.warehouseId?.name || '',
        productImage:  recordData.productImage || undefined,
      });
    }
  }, [open, recordData, form]);

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({
      message: 'Required Fields Missing',
      description: [...new Set(labels)].join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  const handleSubmit = async (values: InventoryFormValues) => {
    if (!recordData) return;
    try {
      await (updateInventory as any)({
        id:            recordData._id,
        productName:   values.productName,
        branchId:      values.branch,
        quantity:      values.quantity,
        warehouseName: values.warehouseName,
        productImage:  values.productImage,
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const branchOptions = (branchesData as any)?.data?.map(
    (b: { _id: string; name?: string }) => ({ label: b.name, value: b._id })
  ) ?? [];

  return (
    <Modal
      title="Edit Inventory"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className="edit-inventory-modal"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        className="edit-inventory-form"
      >
        <div className="row">
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
            className="form-item-half"
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="branch"
            label="Branch Name"
            rules={[{ required: true, message: 'Please select branch' }]}
            className="form-item-half"
          >
            <Select placeholder="Select branch" loading={branchesLoading} options={branchOptions} showSearch />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
            className="form-item-half"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter quantity" />
          </Form.Item>

          <Form.Item
            name="warehouseName"
            label="Warehouse Name"
            rules={[{ required: true, message: 'Please select warehouse' }]}
            className="form-item-half"
          >
            <Select placeholder="Select warehouse" options={warehouseOptions} />
          </Form.Item>
        </div>

        <Form.Item
          label="Product Image"
          name="productImage"
          extra="Upload product image (Max 5MB, JPG/PNG)"
        >
          <ImagePicker form={form} name="productImage" />
        </Form.Item>

        <div className="modal-footer">
          <Button type="default" onClick={handleCancel} style={{ marginRight: 8 }}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading} className="save-btn">
            {isLoading ? 'Updating...' : 'Update Inventory'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditInventoryModal;
