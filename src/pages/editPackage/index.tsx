import { useMemo, useEffect } from "react";
import { Form, Input, Select, Button, InputNumber, Spin, notification } from "antd";
import { HomeOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import "./styles.scss";
import { useGetBranchesQuery } from "../../services/branches";
import { useGetClassesQuery } from "../../services/class";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllPackagesRoute, Home } from "../../routes/routepath";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPlanDetailQuery, useUpdatePlanMutation } from "../../services/package";

/* ─── Constants ──────────────────────────────────────────────────────── */

const frequencyOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Half-Yearly', value: 'half-yearly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'One-Time', value: 'one-time' },
];

const breadcrumbItems = [
  { label: <HomeOutlined />, to: Home },
  { label: "Fee Structures", to: AllPackagesRoute },
  { label: "Edit Fee Structure" },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const EditPackage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data: branchesData } = useGetBranchesQuery(undefined);
  const { data: classesData } = useGetClassesQuery({ limit: 100 });
  const { data: packageData, isLoading: isLoadingPackage, error: packageError } = useGetPlanDetailQuery(id as any);
  const [updatePackage, { isLoading: updating }] = useUpdatePlanMutation();

  const branchOptions = useMemo(() => {
    const data = (branchesData as any)?.data;
    if (!Array.isArray(data)) return [];
    return data.map((b: any) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b._id,
    }));
  }, [branchesData]);

  const classOptions = useMemo(() => {
    const data = (classesData as any)?.data;
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      label: c.name,
      value: c._id,
    }));
  }, [classesData]);

  // Populate form with existing package details
  useEffect(() => {
    const pkg: any = (packageData as any)?.data;
    if (!pkg) return;

    const classIdVal = pkg.classId?._id || pkg.classId || undefined;
    const branchIdsVal = pkg.branchIds?.map((b: any) => b._id || b) || [];

    form.setFieldsValue({
      name: pkg.name,
      amount: pkg.amount,
      frequency: pkg.frequency,
      classId: classIdVal,
      branchIds: branchIdsVal,
      components: pkg.components || [],
    });
  }, [packageData, form]);

  // Watch components list to auto-calculate the total amount
  const components = Form.useWatch('components', form);

  useEffect(() => {
    if (Array.isArray(components)) {
      const total = components.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);
      form.setFieldsValue({ amount: total });
    }
  }, [components, form]);

  const handleUpdateFeeStructure = async (values: Record<string, any>) => {
    const payload = {
      name: values.name,
      amount: values.amount,
      frequency: values.frequency,
      classId: values.classId || null,
      branchIds: values.branchIds || [],
      components: values.components || [],
    };

    try {
      await (updatePackage as any)({ id, body: payload }).unwrap();
      notification.success({
        message: 'Fee Structure Updated',
        description: 'The fee structure has been successfully updated.',
        placement: 'topRight',
      });
      navigate(AllPackagesRoute);
    } catch (error: any) {
      console.error('Failed to update fee structure', error);
      notification.error({
        message: 'Update Failed',
        description: error?.data?.message || 'An error occurred while updating the fee structure.',
        placement: 'topRight',
      });
    }
  };

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[f.name.length - 1] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({
      message: 'Required Fields Missing',
      description: [...new Set(labels)].join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  if (isLoadingPackage) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading fee structure data...</p>
      </div>
    );
  }

  if (packageError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>Error loading fee structure data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="add-package-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Edit Fee Structure</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="form-container">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateFeeStructure}
          onFinishFailed={onFinishFailed}
          className="trainer-form"
        >
          {/* Row 1: Name + Frequency */}
          <div className="form-row">
            <Form.Item
              label="Fee Structure Name"
              name="name"
              rules={[{ required: true, message: 'Please enter fee structure name' }]}
            >
              <Input placeholder="Enter fee structure name" />
            </Form.Item>

            <Form.Item
              label="Frequency"
              name="frequency"
              rules={[{ required: true, message: 'Please select frequency' }]}
            >
              <Select placeholder="Select frequency" options={frequencyOptions} />
            </Form.Item>
          </div>

          {/* Row 2: Class + Branches */}
          <div className="form-row">
            <Form.Item
              label="Class"
              name="classId"
              rules={[{ required: false }]}
            >
              <Select placeholder="Select class (optional)" options={classOptions} allowClear />
            </Form.Item>

            <Form.Item
              label="Branches"
              name="branchIds"
              rules={[{ required: true, message: 'Please select at least one branch' }]}
            >
              <Select mode="multiple" placeholder="Select branches" options={branchOptions} />
            </Form.Item>
          </div>

          {/* Row 3: Total Amount (ReadOnly / Auto-Calculated) */}
          <div className="form-row-single">
            <Form.Item
              label="Total Amount (Auto-summed from components)"
              name="amount"
              rules={[{ required: true, message: 'Total amount is required' }]}
            >
              <InputNumber
                placeholder="Total amount"
                min={0}
                style={{ width: '100%' }}
                prefix="₹"
                readOnly
                disabled
              />
            </Form.Item>
          </div>

          {/* Fee Components list */}
          <div className="certificates-section">
            <h3 style={{ color: 'var(--sider-text)', marginBottom: 16, marginTop: 0 }}>Fee Components</h3>
            <Form.List name="components">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <div key={key} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <Form.Item
                          {...rest}
                          name={[name, 'name']}
                          label="Component Name"
                          rules={[{ required: true, message: 'Please enter component name' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="e.g. Tuition Fee, Exam Fee" />
                        </Form.Item>
                      </div>
                      <div style={{ width: 200 }}>
                        <Form.Item
                          {...rest}
                          name={[name, 'amount']}
                          label="Amount"
                          rules={[{ required: true, message: 'Please enter amount' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber placeholder="Amount" min={0} style={{ width: '100%' }} prefix="₹" />
                        </Form.Item>
                      </div>
                      <div style={{ paddingTop: 30 }}>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            style={{ fontSize: 18, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                    <Button type="dashed" onClick={() => add({ name: '', amount: 0 })} block icon={<PlusOutlined />}>
                      Add Fee Component
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <div className="form-actions">
            <Button onClick={() => navigate(AllPackagesRoute)} className="cancel-btn" size="large" style={{ marginRight: 12 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={updating} className="submit-btn" size="large">
              Update Fee Structure
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default EditPackage;
