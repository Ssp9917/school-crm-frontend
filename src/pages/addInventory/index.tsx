import { Button, Form, Input, Select, InputNumber, notification } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetBranchesQuery } from "../../services/branches";
import { useCreateInventoryMutation } from "../../services/inventory";
import PageBreadcrumb from "../../components/breadcrumb";
import ImagePicker from "../../components/form/ImagePicker";
import { AllInventoryRoute, Home } from "../../routes/routepath";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface InventoryFormValues {
  productName: string;
  branch: string;
  quantity: number;
  warehouseName: string;
  productImage?: string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const warehouseOptions = [
  { label: "Main Warehouse",  value: "main_warehouse"  },
  { label: "Storage Room A",  value: "storage_a"       },
  { label: "Storage Room B",  value: "storage_b"       },
  { label: "Equipment Room",  value: "equipment_room"  },
  { label: "Maintenance Area", value: "maintenance_area" },
];

const breadcrumbItems = [
  { label: <HomeOutlined />, to: Home },
  { label: "All Inventory", to: AllInventoryRoute },
  { label: "Add Inventory" },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddInventory = () => {
  const [form]   = Form.useForm<InventoryFormValues>();
  const navigate = useNavigate();

  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery(undefined);
  const [createInventory, { isLoading: isCreating }]       = useCreateInventoryMutation();

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({
      message:     'Required Fields Missing',
      description: [...new Set(labels)].join(', '),
      placement:   'topRight',
      duration:    4,
    });
  };

  const onFinish = async (values: InventoryFormValues) => {
    try {
      const payload = {
        productName:   values.productName,
        branchId:      values.branch,
        quantity:      values.quantity,
        warehouseName: values.warehouseName,
        productImage:  values.productImage,
      };
      await (createInventory as any)(payload).unwrap();
      form.resetFields();
      navigate(AllInventoryRoute);
    } catch (error) {
      console.error('Error creating inventory:', error);
    }
  };

  return (
    <div className="add-inventory-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Add Inventory</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="add-director-form">
        <div className="row">
          <Form.Item name="productName" label="Product Name" rules={[{ required: true, message: "Please enter product name" }]}>
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item name="branch" label="Branch Name" rules={[{ required: true, message: "Please select branch" }]}>
            <Select
              placeholder="Select branch"
              loading={branchesLoading}
              showSearch
              options={(branchesData as any)?.data?.map((b: any) => ({ label: b.name, value: b._id })) || []}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: "Please enter quantity" }]}>
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter quantity" />
          </Form.Item>

          <Form.Item name="warehouseName" label="Warehouse Name" rules={[{ required: true, message: "Please select warehouse" }]}>
            <Select placeholder="Select warehouse" options={warehouseOptions} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            label="Product Image"
            name="productImage"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}
            extra="Upload product image (Max 5MB, JPG/PNG)"
            rules={[{ required: true, message: 'Please upload product image' }]}
          >
            <ImagePicker form={form} name="productImage" />
          </Form.Item>
        </div>

        <div className="footer-buttons">
          <Button type="default" onClick={() => navigate(AllInventoryRoute)}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" className="save-btn" loading={isCreating}>
            {isCreating ? 'Creating...' : 'Add Inventory'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddInventory;
