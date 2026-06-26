import { useState } from "react";
import { Form, Input, Select, Button, notification } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import PageBreadcrumb from "../../components/breadcrumb";
import { useAddBranchMutation } from "../../services/branches";
import { useNavigate } from "react-router-dom";
import { AllBranchesRoute, Home } from "../../routes/routepath";
import statesData from "../../data/countryStateList.json";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface BranchFormValues {
  branchName?: string;
  branchPhone?: string;
  registerAddress?: string;
  branchArea?: string;
  companyName?: string;
  companyEmail?: string;
  incorporationNumber?: string;
  placeOfSupply?: string;
  gstNumber?: string;
  companyAddress?: string;
  ownedBy?: string;
  gstCertificate?: any;
  incorporationCertification?: any;
  invoicePrefix?: string;
  creditNotePrefix?: string;
  invoiceMidfix?: string;
  invoiceNumber?: string;
  creditNoteInvoiceNumber?: string;
  branchPrefix?: string;
}

/* ─── Module-level options ───────────────────────────────────────────── */

const ownedByOptions = [
  { value: 'company',   label: 'Company'   },
  { value: 'franchise', label: 'Franchise' },
];

const stateOptions = statesData.map((s: { label: string }) => ({ label: s.label, value: s.label }));

/* ─── Validators ─────────────────────────────────────────────────────── */

const validatePhoneNumber = (_: unknown, value: string) => {
  if (!value) return Promise.reject(new Error('Please enter branch phone number'));
  if (!/^[6-9]\d{9}$/.test(value)) return Promise.reject(new Error('Please enter a valid 10-digit phone number'));
  return Promise.resolve();
};

const validateGSTNumber = (_: unknown, value: string) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!value) return Promise.reject(new Error('Please enter GST number'));
  if (!gstRegex.test(value)) return Promise.reject(new Error('Please enter a valid GST number'));
  return Promise.resolve();
};

const validateEmail = (_: unknown, value: string) => {
  if (!value) return Promise.reject(new Error('Please enter company email'));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return Promise.reject(new Error('Please enter a valid email address'));
  return Promise.resolve();
};

const validateNumeric = (_: unknown, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^\d+$/.test(value)) return Promise.reject(new Error('Please enter numbers only'));
  return Promise.resolve();
};

const validateAlphanumeric = (_: unknown, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^[A-Za-z0-9]+$/.test(value)) return Promise.reject(new Error('Only alphanumeric characters allowed'));
  return Promise.resolve();
};

/* ─── Component ──────────────────────────────────────────────────────── */

const AddBranch = () => {
  const [form]    = Form.useForm<BranchFormValues>();
  const navigate  = useNavigate();
  const [sameAddress, setSameAddress] = useState(false);
  const [addBranch, { isLoading: adding }] = useAddBranchMutation();

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

  const extractFile = (val: any): string => {
    if (Array.isArray(val) && val.length > 0)
      return val[0].url || val[0].response?.url || '';
    if (typeof val === 'string') return val;
    return '';
  };

  const handleAddBranch = async (values: BranchFormValues) => {
    const payload = {
      name:                    values.branchName,
      phoneNumber:             values.branchPhone,
      address:                 values.registerAddress,
      branchArea:              values.branchArea,
      companyName:             values.companyName,
      companyEmail:            values.companyEmail,
      incorporationNumber:     values.incorporationNumber,
      stateName:               values.placeOfSupply,
      gstNumber:               values.gstNumber,
      companyAddress:          values.companyAddress,
      ownedBy:                 values.ownedBy,
      gstCertificate:          extractFile(values.gstCertificate),
      incorporationCertificate: extractFile(values.incorporationCertification),
      invoicePrefix:           values.invoicePrefix,
      creditNoteInvoicePrefix: values.creditNotePrefix,
      invoiceMidfix:           values.invoiceMidfix,
      invoiceNumber:           values.invoiceNumber,
      creditNoteInvoiceNumber: values.creditNoteInvoiceNumber,
      placeOfSupply:           values.placeOfSupply,
      branchPrefix:            values.branchPrefix,
    };
    try {
      await (addBranch as any)(payload).unwrap();
      form.resetFields();
      navigate(AllBranchesRoute);
    } catch (err) {
      console.error('Add branch error:', err);
    }
  };

  return (
    <div className="add-branch-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Add Branch</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'BRANCH MANAGEMENT', to: AllBranchesRoute },
            { label: 'Add Branch' },
          ]}
        />
      </div>

      <Form form={form} layout="vertical" className="add-branch-form" onFinish={handleAddBranch} onFinishFailed={onFinishFailed}>
        <div className="row">
          <Form.Item label="Owned By" name="ownedBy" rules={[{ required: true, message: 'Please select owned by' }]}>
            <Select placeholder="Select owned by" options={ownedByOptions} />
          </Form.Item>

          <Form.Item label="Branch Name" name="branchName" rules={[{ required: true, message: 'Please enter branch name' }, { min: 3 }, { max: 100 }]}>
            <Input placeholder="Branch Name" maxLength={100} />
          </Form.Item>

          <Form.Item label="Branch Phone Number" name="branchPhone" rules={[{ validator: validatePhoneNumber }]}>
            <Input placeholder="Branch Phone Number" maxLength={10} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Branch Area" name="branchArea" rules={[{ required: true, message: 'Please enter branch area sq/ft' }, { min: 3 }]}>
            <Input placeholder="Branch Area (sq / ft)" />
          </Form.Item>

          <Form.Item label="Branch Prefix" name="branchPrefix" rules={[{ required: true, message: 'Please enter branch prefix' }, { validator: validateAlphanumeric }, { max: 10 }]}>
            <Input placeholder="Branch Prefix" maxLength={10} />
          </Form.Item>

          <Form.Item label="Invoice Prefix" name="invoicePrefix" rules={[{ required: true, message: 'Please enter invoice prefix' }, { validator: validateAlphanumeric }, { max: 10 }]}>
            <Input placeholder="Invoice Prefix" maxLength={10} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Credit Note Prefix" name="creditNotePrefix" rules={[{ required: true, message: 'Please enter credit note prefix' }, { validator: validateAlphanumeric }, { max: 10 }]}>
            <Input placeholder="Credit Note Prefix" maxLength={10} />
          </Form.Item>

          <Form.Item label="Financial Year" name="invoiceMidfix" rules={[{ required: true, message: 'Please enter financial year' }]}>
            <Input placeholder="Financial Year" maxLength={10} />
          </Form.Item>

          <Form.Item label="Invoice Number" name="invoiceNumber" rules={[{ required: true, message: 'Please enter invoice number' }, { validator: validateNumeric }, { min: 1 }, { max: 6 }]}>
            <Input placeholder="Invoice Number" maxLength={6} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Credit Note Invoice Number" name="creditNoteInvoiceNumber" rules={[{ required: true, message: 'Please enter credit note invoice number' }, { validator: validateNumeric }, { min: 1 }, { max: 6 }]}>
            <Input placeholder="Credit Note Invoice Number" maxLength={6} />
          </Form.Item>

          <Form.Item label="Place of Supply / State Name" name="placeOfSupply" rules={[{ required: true, message: 'Please select place of supply' }]}>
            <Select
              placeholder="Search and select state"
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={stateOptions}
            />
          </Form.Item>

          <Form.Item label="Company Name" name="companyName" rules={[{ required: true, message: 'Please enter company name' }, { min: 3 }, { max: 150 }]}>
            <Input placeholder="Company Name" maxLength={150} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Company Email" name="companyEmail" rules={[{ validator: validateEmail }]}>
            <Input placeholder="Company Email" type="email" />
          </Form.Item>

          <Form.Item label="Incorporation Number" name="incorporationNumber" rules={[{ required: true, message: 'Please enter incorporation number' }, { pattern: /^[A-Za-z0-9]+$/, message: 'Only alphanumeric characters allowed' }, { max: 30 }]}>
            <Input placeholder="Incorporation Number" maxLength={30} />
          </Form.Item>

          <Form.Item
            label="Incorporation Certificate"
            name="incorporationCertification"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}
            extra="Upload incorporation certificate (Max 5MB, JPG/PNG/PDF)"
            rules={[{ required: true, message: 'Please upload incorporation certificate' }]}
          >
            <ImagePicker form={form} name="incorporationCertification" />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="GST Number" name="gstNumber" rules={[{ validator: validateGSTNumber }]}>
            <Input placeholder="GST Number" />
          </Form.Item>

          <Form.Item
            label="GST Certificate"
            name="gstCertificate"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}
            extra="Upload GST certificate (Max 5MB, JPG/PNG/PDF)"
            rules={[{ required: true, message: 'Please upload GST certificate' }]}
          >
            <ImagePicker form={form} name="gstCertificate" />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            className="full-width-item"
            label="Register Address"
            name="registerAddress"
            rules={[{ required: true, message: 'Please enter register address' }, { min: 10 }, { max: 500 }]}
          >
            <Input.TextArea
              placeholder="Register Address"
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={500}
              showCount
              onChange={e => {
                if (sameAddress) form.setFieldsValue({ companyAddress: e.target.value });
              }}
            />
          </Form.Item>

          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 8 }}>
            <input
              type="checkbox"
              id="sameAddress"
              checked={sameAddress}
              style={{ marginRight: 8 }}
              onChange={e => {
                setSameAddress(e.target.checked);
                form.setFieldsValue({
                  companyAddress: e.target.checked ? form.getFieldValue('registerAddress') : '',
                });
              }}
            />
            <label htmlFor="sameAddress" style={{ cursor: 'pointer', userSelect: 'none' }}>
              Same as Register Address
            </label>
          </div>

          <Form.Item
            className="full-width-item"
            label="Branch Address"
            name="companyAddress"
            rules={[{ required: true, message: 'Please enter Branch address' }, { min: 10 }, { max: 500 }]}
          >
            <Input.TextArea
              placeholder="Branch Address"
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={500}
              showCount
              disabled={sameAddress}
            />
          </Form.Item>
        </div>

        <div className="footer-buttons">
          <Button className="save-btn" type="primary" htmlType="submit" loading={adding} disabled={adding}>
            Add Branch
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddBranch;
