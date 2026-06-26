import { useMemo, useState, useEffect } from "react";
import { Form, Input, Select, Button, notification } from "antd";
import { DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import { useGetRolesByLevelQuery } from "../../services/role";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { Home, AllEmployeesRoute } from "../../routes/routepath";
import { useAddEmployeeMutation } from "../../services/employee";
import { useCountries } from "../../hooks/useCountries";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  address: string;
  photo?: string;
  role?: string;
  idType?: string;
  idNumber?: string;
  passportNumber?: string;
  nationality?: string;
  idFront?: string;
  idBack?: string;
  height?: number;
  weight?: number;
  branchId?: string[];
  gender?: string;
}

interface PhoneRule {
  pattern: RegExp;
  message: string;
}

/* ─── ID type options ────────────────────────────────────────────────── */

const idTypeOptions = [
  { label: 'Aadhar Card',      value: 'Aadhar'           },
  { label: 'Passport',         value: 'Passport'         },
  { label: 'Driving Licence',  value: 'Driving Licence'  },
  { label: 'PAN Card',         value: 'pan'              },
];

/* ─── Country-wise phone validation ──────────────────────────────────── */

const PHONE_RULES: Record<string, PhoneRule> = {
  IN: { pattern: /^[6-9]\d{9}$/,      message: 'Valid 10-digit Indian mobile required (starts with 6-9)' },
  US: { pattern: /^\d{10}$/,          message: 'Valid 10-digit US phone number required' },
  CA: { pattern: /^\d{10}$/,          message: 'Valid 10-digit Canadian phone number required' },
  GB: { pattern: /^\d{10,11}$/,       message: 'Valid UK phone number required (10-11 digits)' },
  AE: { pattern: /^[05]\d{8}$/,       message: 'Valid 9-digit UAE number required (starts with 0 or 5)' },
  SA: { pattern: /^[05]\d{8}$/,       message: 'Valid 9-digit Saudi number required (starts with 0 or 5)' },
  PK: { pattern: /^0?3\d{9}$/,        message: 'Valid Pakistani mobile required (e.g. 03001234567)' },
  BD: { pattern: /^0?1[3-9]\d{8}$/,   message: 'Valid Bangladeshi mobile required (e.g. 01712345678)' },
  SG: { pattern: /^[6-9]\d{7}$/,      message: 'Valid 8-digit Singapore phone number required' },
  AU: { pattern: /^0?[2-578]\d{8}$/,  message: 'Valid Australian phone number required (9-10 digits)' },
  NZ: { pattern: /^0?[2-9]\d{7,9}$/,  message: 'Valid New Zealand phone number required' },
  ZA: { pattern: /^0?\d{9}$/,         message: 'Valid South African phone number required (9-10 digits)' },
  NG: { pattern: /^0?[789]\d{9}$/,    message: 'Valid Nigerian phone number required (10-11 digits)' },
  DE: { pattern: /^0?\d{5,14}$/,      message: 'Valid German phone number required' },
  FR: { pattern: /^0?[1-9]\d{8}$/,    message: 'Valid 10-digit French phone number required' },
  JP: { pattern: /^0?\d{9,10}$/,      message: 'Valid Japanese phone number required (10-11 digits)' },
  CN: { pattern: /^1[3-9]\d{9}$/,     message: 'Valid 11-digit Chinese mobile required (starts with 1)' },
  MY: { pattern: /^0?[1-9]\d{7,9}$/,  message: 'Valid Malaysian phone number required' },
  ID: { pattern: /^0?[2-9]\d{7,10}$/, message: 'Valid Indonesian phone number required' },
  PH: { pattern: /^0?[89]\d{9}$/,     message: 'Valid Philippine phone number required (10-11 digits)' },
  TH: { pattern: /^0?[2-9]\d{7,8}$/,  message: 'Valid Thai phone number required (9-10 digits)' },
  LK: { pattern: /^0?[1-9]\d{8}$/,    message: 'Valid Sri Lankan phone number required (9-10 digits)' },
  NP: { pattern: /^0?[9]\d{9}$/,      message: 'Valid Nepali mobile required (starts with 9, 10 digits)' },
  QA: { pattern: /^[3-7]\d{7}$/,      message: 'Valid 8-digit Qatar phone number required' },
  KW: { pattern: /^[569]\d{7}$/,      message: 'Valid 8-digit Kuwait phone number required' },
  BH: { pattern: /^[136]\d{7}$/,      message: 'Valid 8-digit Bahrain phone number required' },
  OM: { pattern: /^[279]\d{7}$/,      message: 'Valid 8-digit Oman phone number required' },
};

const getPhoneValidator = (countryCode: string) => (_: unknown, value: string) => {
  if (!value) return Promise.resolve();
  const digits = value.replace(/[\s\-().+]/g, '');
  const rule = PHONE_RULES[countryCode];
  if (rule) {
    return rule.pattern.test(digits)
      ? Promise.resolve()
      : Promise.reject(new Error(rule.message));
  }
  return /^\d{6,15}$/.test(digits)
    ? Promise.resolve()
    : Promise.reject(new Error('Enter a valid phone number (6–15 digits)'));
};

/* ─── Component ──────────────────────────────────────────────────────── */

const AddEmployee = () => {
  const navigate = useNavigate();
  const [form]   = Form.useForm<EmployeeFormValues>();

  const { data: rolesData   } = useGetRolesByLevelQuery(undefined);
  const { data: branchesData } = useGetBranchesQuery(undefined);
  const { countryOptions }     = useCountries();
  const [triggerAddEmployee, { isLoading: adding }] = useAddEmployeeMutation();

  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    try { return (typeof window !== 'undefined' && window?.localStorage?.getItem('selectedCountry')) || 'IN'; }
    catch { return 'IN'; }
  });

  useEffect(() => {
    form.validateFields(['phone']).catch(() => {});
  }, [selectedCountry, form]);

  const rolesOptions = useMemo(() => {
    const data = (rolesData as any)?.data;
    return Array.isArray(data) ? data.map((r: any) => ({ label: r.name, value: r._id })) : [];
  }, [rolesData]);

  const branchOptions = useMemo(() => {
    const data = (branchesData as any)?.data;
    if (!Array.isArray(data)) return [];
    return data.map((b: any) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

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

  const handleAddEmployee = async (values: EmployeeFormValues) => {
    const iso   = values.countryCode || selectedCountry;
    const found = countryOptions.find(c => c.value === iso);
    const payload: Record<string, unknown> = {
      name:         values.name,
      email:        values.email,
      phoneNumber:  values.phone,
      countryCode:  found?.dial || iso,
      roleId:       values.role || null,
      employeeType: 'employee',
      gender:       values.gender,
      address:      values.address,
      nationality:  values.nationality,
      idType:       values.idType,
      idNumber:     values.idNumber,
      idFront:      values.idFront,
      idBack:       values.idBack,
      height:       values.height,
      weight:       values.weight,
      branchIds:    values.branchId,
      photo:        values.photo,
    };
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });
    const res = await (triggerAddEmployee as any)(payload).unwrap();
    if (res?.success) {
      form.resetFields();
      navigate(AllEmployeesRoute);
    }
  };

  return (
    <div className="employee-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Add Employee</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'EMPLOYEE MANAGEMENT', to: Home },
            { label: 'Add Employee' },
          ]}
        />
      </div>

      <Form form={form} layout="vertical" className="employee-form" onFinish={handleAddEmployee} onFinishFailed={onFinishFailed}>
        <div className="row">
          <Form.Item label="Employee Name" name="name" rules={[{ required: true, message: 'Please enter employee name' }]}>
            <Input placeholder="Employee Name" />
          </Form.Item>

          <Form.Item label="Employee Email" name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter valid email' }]}>
            <Input placeholder="Employee Email" />
          </Form.Item>

          <Form.Item label="Phone No.">
            <div className="country-phone">
              <Form.Item name="countryCode" noStyle initialValue="IN" rules={[{ required: true, message: 'Please select country code' }]}>
                <div className="cc-selected-wrapper">
                  {(() => {
                    const found = countryOptions.find(c => c.value === selectedCountry);
                    return found?.flag
                      ? <img src={found.flag} alt={found.name} className="cc-flag" />
                      : <div className="cc-flag-placeholder" />;
                  })()}
                  <Select
                    showSearch
                    value={selectedCountry}
                    placeholder="+91"
                    optionLabelProp="data-code"
                    popupClassName="country-code-dropdown"
                    variant="borderless"
                    onChange={(val: string) => {
                      setSelectedCountry(val);
                      form.setFieldValue('countryCode', val);
                      try { window.localStorage.setItem('selectedCountry', val); } catch { /* ignore */ }
                    }}
                    filterOption={(input, option) => {
                      const val = (option?.value as string) || '';
                      return val.toLowerCase().includes(input.toLowerCase());
                    }}
                    style={{ width: 64, border: 'none', paddingInline: 0 }}
                  >
                    {countryOptions.map(co => (
                      <Select.Option key={co.value} value={co.value} data-code={co.value}>
                        <span className="cc-option">
                          {co.flag && <img src={co.flag} alt={co.name} style={{ width: 20, height: 14, objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }} />}
                          {co.labelText}
                        </span>
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Form.Item>
              <Form.Item name="phone" noStyle rules={[{ required: true, message: 'Please enter phone number' }, { validator: getPhoneValidator(selectedCountry) }]}>
                <Input variant="borderless" className="cc-input" placeholder="Enter phone number" />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please enter address' }]}>
            <Input placeholder="Address" />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Upload Your Photo" name="photo" rules={[{ required: true, message: 'Please upload photo' }]}>
            <ImagePicker form={form} name="photo" />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select role' }]}>
            <Select placeholder="Select" showSearch options={rolesOptions} />
          </Form.Item>

          <Form.Item name="idType" label="ID Type" rules={[{ required: true, message: 'Please select ID type' }]}>
            <Select placeholder="Select ID Type" options={idTypeOptions} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.idType !== cur.idType}>
            {({ getFieldValue }) => {
              const idType = getFieldValue('idType') as string;
              if (!idType) return null;

              const idField = (() => {
                if (idType === 'Passport') return (
                  <>
                    <Form.Item name="passportNumber" label="Passport Number" rules={[{ required: true, message: 'Please enter passport number' }]}>
                      <Input placeholder="Enter passport number" />
                    </Form.Item>
                    <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Please enter nationality' }]}>
                      <Input placeholder="Enter nationality" />
                    </Form.Item>
                  </>
                );
                if (idType === 'Aadhar') return (
                  <Form.Item name="idNumber" label="Aadhar Number" normalize={(v) => (v ? String(v).replace(/\s+/g, '') : v)} rules={[{ required: true, message: 'Please enter Aadhar number' }, { pattern: /^[0-9]{12}$/, message: 'Aadhar number must be 12 digits' }]}>
                    <Input placeholder="Enter Aadhar number" maxLength={12} />
                  </Form.Item>
                );
                if (idType === 'Driving Licence') return (
                  <Form.Item name="idNumber" label="Driving Licence Number" normalize={(v) => (v ? String(v).toUpperCase().replace(/\s+/g, '') : v)} rules={[{ required: true, message: 'Please enter driving licence number' }, { pattern: /^[A-Z]{2}[0-9]{13}$/, message: 'DL format: 2 letters + 13 digits' }]}>
                    <Input placeholder="Enter DL number (e.g., MH1420110012345)" maxLength={15} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                );
                if (idType === 'pan') return (
                  <Form.Item name="idNumber" label="PAN Number" normalize={(v) => (v ? String(v).toUpperCase().replace(/\s+/g, '') : v)} rules={[{ required: true, message: 'Please enter PAN number' }, { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'PAN format: 5 letters + 4 digits + 1 letter' }]}>
                    <Input placeholder="Enter PAN number (e.g., ABCDE1234F)" maxLength={10} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                );
                return (
                  <Form.Item name="idNumber" label="ID Number">
                    <Input placeholder="Enter ID number" />
                  </Form.Item>
                );
              })();

              return (
                <>
                  {idField}
                  <div className="row id-images-row">
                    <Form.Item name="idFront" label="ID Front" rules={[{ required: true, message: 'Please upload ID front image' }]}>
                      <ImagePicker form={form} name="idFront" />
                    </Form.Item>
                    <Form.Item name="idBack" label="ID Back" rules={[{ required: true, message: 'Please upload ID back image' }]}>
                      <ImagePicker form={form} name="idBack" />
                    </Form.Item>
                  </div>
                </>
              );
            }}
          </Form.Item>
        </div>

        <div className="branch-row">
          <Form.Item label="Select Branch(es)" name="branchId" className="branch-select" rules={[{ required: true, message: 'Please select at least one branch' }]}>
            <Select
              mode="multiple"
              placeholder="Select Branch(es)"
              showSearch
              allowClear
              options={branchOptions}
            />
          </Form.Item>
        </div>

        <div className="footer-buttons">
          <Button className="delete-btn" onClick={() => form.resetFields()}>
            <DeleteOutlined /> RESET
          </Button>
          <Button className="save-btn" type="primary" htmlType="submit" loading={adding}>SAVE</Button>
        </div>
      </Form>
    </div>
  );
};

export default AddEmployee;
