import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Home as HomePath, AllUsersRoute } from "../../routes/routepath";
import { HomeOutlined } from "@ant-design/icons";
import countryStateList from "../../data/countryStateList.json";
import {
  ConfigProvider,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  message,
} from "antd";
import type { Dayjs } from "dayjs";
import ImagePicker from "../../components/form/ImagePicker";
import PageBreadcrumb from "../../components/breadcrumb";
import "./styles.scss";
import { useTheme } from "../../context/ThemeContext";
import dayjs from "dayjs";
import { useAdduserMutation } from "../../services/user";
import { useGetUsersSimpleListQuery } from "../../services/usersList";
import { useGetBranchesQuery } from "../../services/branches";
import { useCountries } from "../../hooks/useCountries";

const { Title } = Typography;

/* ─── Types ──────────────────────────────────────────────────────────── */

interface PhoneRule {
  pattern: RegExp;
  message: string;
}

interface DlPattern {
  pattern:     RegExp;
  hint:        string;
  maxLength:   number;
  placeholder: string;
}

interface UserFormValues {
  name:                   string;
  email:                  string;
  gender:                 string;
  dob?:                   Dayjs | null;
  age?:                   number;
  maritalStatus?:         string;
  anniversaryDate?:       Dayjs | null;
  stateName:              string;
  address:                string;
  userMode?:              string;
  countryCode?:           string;
  phoneNumber?:           string;
  attachedToPhoneNumber?: string;
  alternativePhoneNumber?: string;
  branchId:               string;
  photo?:                 string;
  idType?:                string;
  idNumber?:              string;
  passportNumber?:        string;
  nationality?:           string;
  dlCountry?:             string;
  idFront?:               string;
  idBack?:                string;
  designation?:           string;
  companyName?:           string;
  heardFrom?:             string;
  referredBy?:            string;
  bmiMeasurement?:        string;
  height?:                string;
  weight?:                string;
  bmiNote?:               string;
  medicalHistory:         string;
  emergencyName:          string;
  emergencyCall:          string;
  emergencyRelation?:     string;
  bloodGroup?:            string;
  fitnessGoalPrimary?:    string;
  targetWeight?:          string;
  fitnessNotes?:          string;
  userType?:              string;
  password?:              string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

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

const DL_PATTERNS: Record<string, DlPattern> = {
  IN:      { pattern: /^[A-Z]{2}[0-9]{13}$/, hint: '2 letters + 13 digits (e.g., MH0120230012345)', maxLength: 15, placeholder: 'e.g., MH0120230012345' },
  OTHER:   { pattern: /^[A-Z0-9]{4,25}$/,    hint: 'Alphanumeric 4–25 characters',                  maxLength: 25, placeholder: 'Enter DL number' },
  DEFAULT: { pattern: /^[A-Z0-9]{4,25}$/,    hint: 'Alphanumeric 4–25 characters',                  maxLength: 25, placeholder: 'Enter DL number' },
};

const READABLE_FIELD_NAMES: Record<string, string> = {
  name:                 'Full Name',
  email:                'Email',
  gender:               'Gender',
  dob:                  'Date of Birth',
  stateName:            'State',
  address:              'Address',
  phoneNumber:          'Phone Number',
  branchId:             'Branch',
  idType:               'ID Type',
  idNumber:             'ID Number',
  passportNumber:       'Passport Number',
  nationality:          'Nationality',
  bmiMeasurement:       'BMI Measurement',
  medicalHistory:       'Medical History',
  emergencyName:        'Emergency Contact Name',
  emergencyCall:        'Emergency Contact Number',
  countryCode:          'Country Code',
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

const getCssVar = (name: string, fallback: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

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

const AddUser = () => {
  useTheme();
  const navigate = useNavigate();

  const tokens = {
    colorPrimary:        getCssVar("--accent",      "#A6FF4D"),
    colorBgContainer:    getCssVar("--card-bg",     "#252528"),
    colorBgLayout:       getCssVar("--bg",          "#181A20"),
    colorText:           getCssVar("--sider-text",  "#ffffff"),
    colorBorder:         getCssVar("--muted",       "#444"),
    colorTextPlaceholder: getCssVar("--placeholder", "#aaa"),
  };

  const [form] = Form.useForm<UserFormValues>();

  const { data: branchesData }   = useGetBranchesQuery(undefined);
  const [trigger]                = useAdduserMutation();
  const { countryOptions }       = useCountries();
  const { data: attachUsersData } = useGetUsersSimpleListQuery(undefined);

  const [attachMode,      setAttachMode]      = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    try { return (typeof window !== 'undefined' && window?.localStorage?.getItem('selectedCountry')) || 'IN'; }
    catch { return 'IN'; }
  });

  const attachUserOptions = useMemo(() => {
    const users = (attachUsersData as any)?.users;
    if (!Array.isArray(users)) return [];
    return users.map((u: any) => ({ label: `${u.name} - ${u.phoneNumber}`, value: u.phoneNumber }));
  }, [attachUsersData]);

  useEffect(() => {
    form.validateFields(['phoneNumber', 'alternativePhoneNumber']).catch(() => {});
  }, [selectedCountry, form]);

  const branchOptions = useMemo(() => {
    const data = (branchesData as any)?.data;
    if (!Array.isArray(data)) return [];
    return data.map((b: any) => ({
      label: `${b.name} — ${b.branchArea || ''} (${b.branchId ?? b._id})`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

  const onFinish = async (values: UserFormValues) => {
    const iso   = values.countryCode || selectedCountry;
    const found = countryOptions.find(c => c.value === iso);

    const payload: Record<string, unknown> = {
      name:                   values.name,
      email:                  values.email,
      phoneNumber:            values.phoneNumber,
      branchIds:              values.branchId ? [values.branchId] : [],
      dob:                    values.dob ? (values.dob as Dayjs).format('YYYY-MM-DD') : null,
      age:                    values.age || null,
      gender:                 values.gender,
      address:                values.address,
      stateName:              values.stateName,
      nationality:            values.nationality,
      maritalStatus:          values.maritalStatus,
      anniversaryDate:        values.anniversaryDate ? (values.anniversaryDate as Dayjs).format('YYYY-MM-DD') : null,
      countryCode:            found?.dial || iso,
      alternativePhoneNumber: values.alternativePhoneNumber,
      photo:                  values.photo,
      height:                 values.height,
      weight:                 values.weight,
      bmi:                    values.bmiNote || null,
      bmiMeasurement:         values.bmiMeasurement,
      medicalHistory:         values.medicalHistory,
      idType:                 values.idType,
      idNumber:               values.idNumber,
      idFront:                values.idFront,
      idBack:                 values.idBack,
      idCountry:              values.idType === 'Driving Licence' ? (values.dlCountry === 'IN' ? 'India' : 'Other') : undefined,
      emergencyContactName:   values.emergencyName,
      emergencyContactNumber: values.emergencyCall,
      work:                   values.designation || null,
      companyName:            values.companyName,
      hearAbout:              values.heardFrom,
      referred:               values.referredBy,
      canTransfer:            false,
      delivered:              'Undelivered',
      assessmentStatus:       'pending',
      assignedTrainer:        null,
      healthInfo: {
        bloodGroup:        values.bloodGroup || null,
        medicalConditions: values.medicalHistory ? [values.medicalHistory] : [],
        allergies:         [],
        emergencyContact: {
          name:        values.emergencyName   || null,
          relation:    values.emergencyRelation || null,
          phoneNumber: values.emergencyCall   || null,
        },
      },
      fitnessGoals: {
        primary:      values.fitnessGoalPrimary || null,
        targetWeight: values.targetWeight       || null,
        notes:        values.fitnessNotes       || null,
      },
      userType:                 values.userType || 'user',
      password:                 values.password,
      attachedToPhoneNumber:    values.attachedToPhoneNumber || null,
    };

    Object.keys(payload).forEach(k => {
      if (payload[k] === null || payload[k] === undefined || payload[k] === '') delete payload[k];
    });

    try {
      await (trigger as any)(payload).unwrap();
      form.resetFields();
      navigate(AllUsersRoute);
    } catch (err) {
      console.error('Add user failed', err);
    }
  };

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (errorFields?.length) {
      const first       = errorFields[0];
      const fieldName   = String(first.name[0]);
      const errorMsg    = first.errors[0];
      const displayName = READABLE_FIELD_NAMES[fieldName] || fieldName;
      message.error(`${displayName}: ${errorMsg}`);
    } else {
      message.error('Please fill all required fields correctly!');
    }
  };

  return (
    <ConfigProvider theme={{ token: tokens }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Add User</h2>
        <Space wrap>
          <PageBreadcrumb
            items={[
              { label: <HomeOutlined />, to: HomePath },
              { label: "User Management", to: HomePath },
              { label: "Add User" },
            ]}
          />
        </Space>
      </div>

      <div className="page-add-user">
        <Card style={{ border: "none", margin: "0 auto", background: "var(--card-bg)", color: "var(--sider-text)" }}>
          <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>

            {/* ── Personal Information ── */}
            <Title level={4} className="section-title">Personal Information</Title>
            <Divider />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter valid email' }]}>
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Please select gender' }]}>
                  <Select placeholder="Select gender" options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }]} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="dob" label="Date of birth" rules={[{ required: true, message: 'Please select date of birth' }]}>
                  <DatePicker
                    style={{ width: '100%' }}
                    onChange={(date: Dayjs | null) => {
                      if (date) form.setFieldsValue({ age: dayjs().diff(date, 'year') });
                      else form.setFieldsValue({ age: undefined });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="age" label="Age (auto)">
                  <Input placeholder="Calculated automatically" disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="maritalStatus" label="Marital Status" initialValue="unmarried">
                  <Select options={[{ label: 'Unmarried', value: 'unmarried' }, { label: 'Married', value: 'married' }]} />
                </Form.Item>
              </Col>
              <Form.Item noStyle shouldUpdate={(p, c) => p.maritalStatus !== c.maritalStatus}>
                {({ getFieldValue }) =>
                  getFieldValue('maritalStatus') === 'married' ? (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name="anniversaryDate" label="Anniversary Date" rules={[{ required: true, message: 'Please select anniversary date' }]}>
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  ) : null
                }
              </Form.Item>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="stateName" label="State" rules={[{ required: true, message: 'Please select state' }]}>
                  <Select
                    placeholder="Select state"
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={countryStateList as any}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please enter address' }]}>
                  <Input.TextArea rows={2} placeholder="Enter address" />
                </Form.Item>
              </Col>
            </Row>

            {/* ── Contact Details ── */}
            <Title level={4} className="section-title">Contact Details</Title>
            <Divider />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="userMode" label="User Mode" initialValue="fresh">
                  <Select
                    options={[{ label: 'Fresh User', value: 'fresh' }, { label: 'Attach User', value: 'attach' }]}
                    onChange={(val: string) => {
                      const isAttach = val === 'attach';
                      setAttachMode(isAttach);
                      if (isAttach) form.setFieldsValue({ phoneNumber: undefined });
                      else form.setFieldsValue({ attachedToPhoneNumber: undefined });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                {attachMode ? (
                  <Form.Item name="attachedToPhoneNumber" label="Attach existing user">
                    <Select showSearch placeholder="Search user" options={attachUserOptions} />
                  </Form.Item>
                ) : (
                  <Form.Item label="Phone Number">
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
                            dropdownClassName="country-code-dropdown"
                            bordered={false}
                            onChange={(val: string) => {
                              setSelectedCountry(val);
                              form.setFieldValue('countryCode', val);
                              try { window.localStorage.setItem('selectedCountry', val); } catch { /* ignore */ }
                            }}
                            filterOption={(input, option) => {
                              const val = (option?.value as string) || '';
                              return val.toLowerCase().includes(input.toLowerCase());
                            }}
                            style={{ width: 50, border: 'none', paddingInline: 0 }}
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
                      <Form.Item name="phoneNumber" noStyle rules={[{ required: true, message: 'Please enter phone number' }, { validator: getPhoneValidator(selectedCountry) }]}>
                        <Input bordered={false} className="cc-input" placeholder="Enter phone number" />
                      </Form.Item>
                    </div>
                  </Form.Item>
                )}
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="alternativePhoneNumber" label="Alternative Phone" rules={[{ validator: getPhoneValidator(selectedCountry) }]}>
                  <Input placeholder="Enter alternative phone" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="branchId" label="Branch" rules={[{ required: true, message: 'Please select branch' }]}>
                  <Select placeholder="Select branch" options={branchOptions} showSearch allowClear />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="photo" label="Photo">
                  <ImagePicker form={form} name="photo" />
                </Form.Item>
              </Col>
            </Row>

            {/* ── Identity Information ── */}
            <Title level={4} className="section-title">Identity Information</Title>
            <Divider />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="idType" label="ID Type" rules={[{ required: true, message: 'Please select ID type' }]}>
                  <Select
                    placeholder="Select ID type"
                    options={[
                      { label: 'Aadhar',          value: 'Aadhar'          },
                      { label: 'Driving Licence',  value: 'Driving Licence' },
                      { label: 'Passport',         value: 'Passport'        },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Form.Item noStyle shouldUpdate={(p, c) => p.idType !== c.idType || p.dlCountry !== c.dlCountry}>
                {({ getFieldValue }) => {
                  const idType = getFieldValue('idType') as string;
                  if (!idType) return null;

                  const idField = (() => {
                    if (idType === 'Passport') return (
                      <>
                        <Col xs={24} sm={12} md={8}>
                          <Form.Item name="passportNumber" label="Passport Number" rules={[{ required: true, message: 'Please enter passport number' }]}>
                            <Input placeholder="Enter passport number" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Please enter nationality' }]}>
                            <Input placeholder="Enter nationality" />
                          </Form.Item>
                        </Col>
                      </>
                    );
                    if (idType === 'Aadhar') return (
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="idNumber" label="Aadhar Number" normalize={(v) => (v ? String(v).replace(/\s+/g, '') : v)} rules={[{ required: true, message: 'Please enter Aadhar number' }, { pattern: /^[0-9]{12}$/, message: 'Aadhar number must be exactly 12 digits' }]}>
                          <Input placeholder="Enter 12 digit Aadhar number" maxLength={12} />
                        </Form.Item>
                      </Col>
                    );
                    if (idType === 'Driving Licence') {
                      const dlCountry = getFieldValue('dlCountry') as string;
                      const config    = DL_PATTERNS[dlCountry] || (dlCountry ? DL_PATTERNS.DEFAULT : null);
                      return (
                        <>
                          <Col xs={24} sm={12} md={8}>
                            <Form.Item name="dlCountry" label="Country" rules={[{ required: true, message: 'Please select country' }]}>
                              <Select placeholder="Select country" options={[{ value: 'IN', label: '🇮🇳 India' }, { value: 'OTHER', label: '🌐 Other' }]} />
                            </Form.Item>
                          </Col>
                          {dlCountry && config && (
                            <Col xs={24} sm={12} md={8}>
                              <Form.Item name="idNumber" label="Driving Licence Number" normalize={(v) => (v ? String(v).toUpperCase().replace(/\s+/g, '') : v)} rules={[{ required: true, message: 'Please enter driving licence number' }, ...(dlCountry !== 'OTHER' ? [{ pattern: config.pattern, message: `Format: ${config.hint}` }] : [])]}>
                                <Input placeholder={config.placeholder} maxLength={config.maxLength} style={{ textTransform: 'uppercase' }} />
                              </Form.Item>
                            </Col>
                          )}
                        </>
                      );
                    }
                    return (
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="idNumber" label="ID Number">
                          <Input placeholder="Enter ID number" />
                        </Form.Item>
                      </Col>
                    );
                  })();

                  return (
                    <>
                      {idField}
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="idFront" label="ID Front" rules={[{ required: true, message: 'Please upload ID front image' }]}>
                          <ImagePicker form={form} name="idFront" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="idBack" label="ID Back" rules={[{ required: true, message: 'Please upload ID back image' }]}>
                          <ImagePicker form={form} name="idBack" />
                        </Form.Item>
                      </Col>
                    </>
                  );
                }}
              </Form.Item>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="designation" label="Designation">
                  <Input placeholder="Enter designation" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="companyName" label="Company Name">
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="heardFrom" label="How did you hear about FitClub">
                  <Select placeholder="Select source" allowClear options={[
                    { label: 'Friend / Family', value: 'friend'  },
                    { label: 'Social Media',    value: 'social'  },
                    { label: 'Google / Search', value: 'google'  },
                    { label: 'Advertisement',   value: 'ad'      },
                    { label: 'Walk-in',         value: 'walkin'  },
                    { label: 'Other',           value: 'other'   },
                  ]} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="referredBy" label="Referred By">
                  <Input placeholder="Enter referrer name or code (optional)" />
                </Form.Item>
              </Col>
            </Row>

            {/* ── Health & Body Metrics ── */}
            <Title level={4} className="section-title">Health & Body Metrics</Title>
            <Divider />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="bmiMeasurement" label="BMI Measurement" initialValue="other" rules={[{ required: true, message: 'Please select BMI measurement' }]}>
                  <Select options={[
                    { label: 'Standard (ft/pound)', value: 'standardMeasure' },
                    { label: 'Metric (cm/kg)',       value: 'metricMeasure'  },
                  ]} />
                </Form.Item>
              </Col>
              <Form.Item noStyle shouldUpdate={(p, c) => p.bmiMeasurement !== c.bmiMeasurement}>
                {({ getFieldValue }) => {
                  const val = getFieldValue('bmiMeasurement') as string;
                  if (val !== 'standardMeasure' && val !== 'metricMeasure') return null;
                  return (
                    <>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="height" label={val === 'standardMeasure' ? 'Height (ft)' : 'Height (cm)'}>
                          <Input placeholder="Enter height" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="weight" label={val === 'standardMeasure' ? 'Weight (pound)' : 'Weight (kg)'}>
                          <Input placeholder="Enter weight" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item name="bmiNote" label="BMI Note">
                          <Input placeholder="BMI note" />
                        </Form.Item>
                      </Col>
                    </>
                  );
                }}
              </Form.Item>
              <Col span={24}>
                <Form.Item name="medicalHistory" label="Medical History" rules={[{ required: true, message: 'Please enter medical history' }]}>
                  <Input.TextArea rows={3} placeholder="Enter any relevant medical history (allergies, conditions, medications)" />
                </Form.Item>
              </Col>
            </Row>

            {/* ── Emergency Contact ── */}
            <Title level={4} className="section-title">Emergency Contact</Title>
            <Divider />
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="emergencyName" label="Contact Name" rules={[{ required: true, message: 'Please enter emergency contact name' }]}>
                  <Input placeholder="Enter emergency contact name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="emergencyCall" label="Contact Number" rules={[{ required: true, message: 'Please enter emergency contact number' }, { validator: getPhoneValidator(selectedCountry) }]}>
                  <Input placeholder="Enter emergency number" />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Space>
                <Button className="reset-btn" onClick={() => form.resetFields()}>Reset</Button>
                <Button className="save-btn" type="primary" htmlType="submit">Save</Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default AddUser;
