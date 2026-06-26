import { useState, useMemo, useEffect } from "react";
import { Button, Form, Input, Select, InputNumber, Checkbox, Row, Col, notification } from "antd";
import { HomeOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetBranchesQuery } from "../../services/branches";
import { useGetBranchResourcesQuery } from "../../services/biometric";
import { useAddPlanMutation } from "../../services/package";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllAddOnPackagesRoute, Home } from "../../routes/routepath";
import ImagePicker from "../../components/form/ImagePicker";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface BenefitPoint {
  id: number;
  value: string;
}

interface BiometricOption {
  label: string;
  value: string;
  disabled: boolean;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const typeOptions = [
  { label: "Personal Training", value: "Personal Training" },
  { label: "Pilates",           value: "Pilates"           },
  { label: "Therapy",           value: "Therapy"           },
  { label: "EMS",               value: "EMS"               },
  { label: "Paid Locker",       value: "Paid Locker"       },
  { label: "MMA",               value: "MMA"               },
];

const addonTypeMap: Record<string, string> = {
  "Personal Training": "personal_training",
  "Pilates":           "pilates",
  "Therapy":           "therapy",
  "EMS":               "ems",
  "Paid Locker":       "paid_locker",
  "MMA":               "mma",
};

const breadcrumbItems = [
  { label: <HomeOutlined />, to: Home },
  { label: "All Add On Packages", to: AllAddOnPackagesRoute },
  { label: "Add On's Package" },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddAddOnPackage = () => {
  const [form]     = Form.useForm();
  const navigate   = useNavigate();

  const [selectedPackageType, setSelectedPackageType] = useState('');
  const [benefitPoints, setBenefitPoints]             = useState<BenefitPoint[]>([{ id: 1, value: '' }]);

  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery(undefined);
  const [addPlan, { isLoading: isSubmitting }]              = useAddPlanMutation();

  const selectedBranch = Form.useWatch('branch', form);
  const hasBranch      = Array.isArray(selectedBranch) ? selectedBranch.length > 0 : !!selectedBranch;

  const { data: biometricData } = useGetBranchResourcesQuery(
    hasBranch ? (Array.isArray(selectedBranch) ? selectedBranch : [selectedBranch]) : undefined,
    { skip: !hasBranch },
  );

  useEffect(() => {
    if (!hasBranch) form.setFieldsValue({ selectedBiometric: undefined });
  }, [hasBranch, form]);

  const biometricMachineOptions = useMemo<BiometricOption[]>(() => {
    if (!hasBranch) return [];
    const machines = (biometricData as any)?.data?.machines;
    if (!Array.isArray(machines)) return [];
    const opts: BiometricOption[] = [];
    machines.forEach((branchData: any) => {
      if (Array.isArray(branchData.machines)) {
        branchData.machines.forEach((machine: any) => {
          opts.push({
            label:    `${machine.machineId} - ${branchData.branchInfo.name} (${machine.floor || 'N/A'})`,
            value:    machine._id,
            disabled: machine.deleted_at !== null,
          });
        });
      }
    });
    return opts;
  }, [biometricData, hasBranch]);

  const addBenefitPoint = () => {
    const newId = Math.max(...benefitPoints.map(p => p.id), 0) + 1;
    setBenefitPoints(prev => [...prev, { id: newId, value: '' }]);
  };

  const removeBenefitPoint = (id: number) => {
    if (benefitPoints.length > 1) setBenefitPoints(prev => prev.filter(p => p.id !== id));
  };

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
    try {
      const benefits = benefitPoints
        .map(point => {
          const val = values[`benefitPoint_${point.id}`];
          return val ? { type: val } : null;
        })
        .filter(Boolean);

      const payload = {
        name:              values.name,
        pricing:           values.price,
        numberOfDays:      values.numberOfValidDate,
        type:              'addon',
        addonType:         addonTypeMap[values.packageType] || 'personal_training',
        branchIds:         Array.isArray(values.branch) ? values.branch : [values.branch],
        hsnSac:            values.hsnSacCode || '',
        description:       values.benefitHeadline || '',
        numberOfSessions:  values.sessions || 0,
        upgradeLimit:      values.upgradeLimit || 0,
        advanceRenewDays:  values.advanceRenewDays || 0,
        benefits,
        photos:            values.photo ? [values.photo] : [],
        biometricMachines: values.selectedBiometric || [],
        machineIds:        values.selectedBiometric || [],
      };

      await (addPlan as any)(payload).unwrap();
      form.resetFields();
      setBenefitPoints([{ id: 1, value: '' }]);
      navigate(AllAddOnPackagesRoute);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="add-add-on-package-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Add On's Package</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed} className="custom-form">
        <div className="row">
          <Form.Item name="packageType" label="Package Type" rules={[{ required: true, message: 'Please select package type' }]}>
            <Select placeholder="Select package type" options={typeOptions} onChange={(v: string) => setSelectedPackageType(v)} />
          </Form.Item>
          <Form.Item name="name" label="Package Name" rules={[{ required: true, message: 'Please enter package name' }]}>
            <Input placeholder="Enter package name" />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item
            label="Photo" name="photo"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}
            extra="Upload photo (Max 5MB, JPG/PNG/PDF)"
            rules={[{ required: true, message: 'Please upload photo' }]}
          >
            <ImagePicker form={form} name="photo" />
          </Form.Item>

          <Form.Item name="branch" label="Branch" rules={[{ required: true, message: 'Please select at least one branch' }]}>
            <Select
              mode="multiple"
              placeholder="Select branch(es)"
              loading={branchesLoading}
              allowClear
              showSearch
              options={(branchesData as any)?.data?.map((b: any) => ({ label: b.name, value: b._id })) || []}
            />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please enter price' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter price" />
          </Form.Item>
          <Form.Item name="numberOfValidDate" label="Number of Valid Days" rules={[{ required: true, message: 'Please enter number of valid days' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter number of valid days" />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="upgradeLimit" label="Upgrade Limit">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter upgrade limit" />
          </Form.Item>
          <Form.Item name="advanceRenewDays" label="Advance Renew Days">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter advance renew days" />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item name="hsnSacCode" label="HSN/SAC Code">
            <Input placeholder="Enter HSN/SAC code" />
          </Form.Item>
          <Form.Item name="benefitHeadline" label="Benefit Headline">
            <Input placeholder="Enter benefit headline" />
          </Form.Item>
        </div>

        {selectedPackageType !== 'Paid Locker' && (
          <div className="row">
            <Form.Item name="sessions" label="Sessions" rules={[{ required: true, message: 'Please enter number of sessions' }]}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter number of sessions" />
            </Form.Item>
          </div>
        )}

        <div className="form-row-single">
          <Form.Item label="Select Biometric Machines" name="selectedBiometric">
            <Checkbox.Group>
              <Row>
                {biometricMachineOptions.map(option => (
                  <Col span={24} key={option.value} style={{ marginBottom: 8 }}>
                    <Checkbox value={option.value} disabled={option.disabled}>{option.label}</Checkbox>
                  </Col>
                ))}
                {biometricMachineOptions.length === 0 && (
                  <Col span={24}>
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      {selectedBranch ? 'No biometric machines available for selected branch' : 'Please select a branch first'}
                    </div>
                  </Col>
                )}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </div>

        <div className="benefit-points-section">
          <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Benefit Points</h3>
          {benefitPoints.map((point, index) => (
            <div key={point.id} className="row" style={{ alignItems: 'flex-end', marginBottom: '16px' }}>
              <Form.Item
                name={`benefitPoint_${point.id}`}
                label={index === 0 ? 'Point' : ''}
                rules={[{ required: true, message: 'Point is required' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="Enter benefit point" />
              </Form.Item>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                {index === benefitPoints.length - 1 && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={addBenefitPoint}>Add</Button>
                )}
                {benefitPoints.length > 1 && (
                  <Button danger icon={<DeleteOutlined />} onClick={() => removeBenefitPoint(point.id)}>Delete</Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="footer-buttons">
          <Button type="primary" htmlType="submit" className="save-btn" loading={isSubmitting}>
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddAddOnPackage;
