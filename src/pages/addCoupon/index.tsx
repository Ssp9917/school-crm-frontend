import { useState } from "react";
import { Form, Input, Select, Button, InputNumber, notification } from "antd";
import { HomeOutlined, PercentageOutlined, DollarOutlined } from "@ant-design/icons";
import { useGetBranchesQuery } from "../../services/branches";
import { useAddCouponMutation } from "../../services/coupons";
import { useGetEmployeeQuery } from "../../services/employee";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllCouponsRoute, Home } from "../../routes/routepath";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

/* ─── Constants ──────────────────────────────────────────────────────── */

const couponTypeOptions = [
  { label: "Single Use", value: "single_use" },
  { label: "Regular",    value: "regular"    },
];

const discountTypeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Absolute",   value: "absolute"   },
];

const breadcrumbItems = [
  { label: <HomeOutlined />, to: Home },
  { label: "All Coupons", to: AllCouponsRoute },
  { label: "Add Coupon" },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddCoupon = () => {
  const navigate = useNavigate();
  const [form]   = Form.useForm();

  const { data: branchesData,  isLoading: branchesLoading  } = useGetBranchesQuery(undefined);
  const { data: employeeData,  isLoading: employeeLoading  } = useGetEmployeeQuery(undefined);
  const [addCoupon] = useAddCouponMutation();

  const [couponType,   setCouponType]   = useState<string | undefined>(undefined);
  const [discountType, setDiscountType] = useState<string | undefined>(undefined);

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

  const onFinish = async (values: Record<string, any>) => {
    const base = {
      value:        values.couponValue,
      discountType: values.discountType,
      couponType:   values.couponType,
      branchId:     values.branch,
      remark:       values.remark || '',
    };
    const payload = values.couponType === 'single_use'
      ? { ...base, employeeId: values.employeeId, code: '' }
      : { ...base, code: values.couponCode || '' };
    try {
      await (addCoupon as any)(payload).unwrap();
      form.resetFields();
      navigate(AllCouponsRoute);
    } catch (error) {
      console.error('Add coupon error:', error);
    }
  };

  return (
    <div className="add-coupon-page">
      <div className="form-header">
        <h2>Add Coupon</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item name="branch" label="Branch" rules={[{ required: true, message: 'Please select branch' }]}>
            <Select
              placeholder="Select branch"
              loading={branchesLoading}
              showSearch
              options={(branchesData as any)?.data?.map((b: any) => ({ label: b.name, value: b._id })) || []}
            />
          </Form.Item>

          <Form.Item name="couponType" label="Coupon Type" rules={[{ required: true, message: 'Please select coupon type' }]}>
            <Select
              placeholder="Select coupon type"
              options={couponTypeOptions}
              onChange={(v: string) => setCouponType(v)}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="discountType" label="Discount Type" rules={[{ required: true, message: 'Please select discount type' }]}>
            <Select
              placeholder="Select discount type"
              options={discountTypeOptions}
              onChange={(v: string) => setDiscountType(v)}
            />
          </Form.Item>

          <Form.Item name="couponValue" label="Coupon Value" rules={[{ required: true, message: 'Please enter coupon value' }]}>
            {discountType === 'percentage' ? (
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="Enter percentage value"
                formatter={(v) => `${v}%`}
                parser={((v: string) => v ? v.replace('%', '') : '') as any}
                prefix={<PercentageOutlined />}
              />
            ) : (
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Enter absolute value"
                formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={((v: string) => v ? v.replace(/₹\s?|(,*)/g, '') : '') as any}
                prefix={<DollarOutlined />}
              />
            )}
          </Form.Item>

          {couponType === 'single_use' ? (
            <Form.Item name="employeeId" label="Select Employee" rules={[{ required: true, message: 'Please select employee' }]}>
              <Select
                placeholder="Select employee"
                loading={employeeLoading}
                showSearch
                options={(employeeData as any)?.data?.map((emp: any) => ({ label: emp.user?.name, value: emp._id })) || []}
              />
            </Form.Item>
          ) : (
            <Form.Item name="couponCode" label="Coupon Code" rules={[{ required: true, message: 'Please enter coupon code' }]}>
              <Input placeholder="Enter coupon code" />
            </Form.Item>
          )}

          <Form.Item name="remark" label="Remark">
            <Input placeholder="Enter remark" />
          </Form.Item>
        </div>

        <div className="footer-buttons">
          <Button type="primary" htmlType="submit" className="save-btn">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddCoupon;
