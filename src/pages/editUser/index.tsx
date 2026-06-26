import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  notification,
  Spin,
} from "antd";
import ImagePicker from "../../components/form/ImagePicker";
import PageBreadcrumb from "../../components/breadcrumb";
import "./styles.scss";
import { useTheme } from "../../context/ThemeContext";
import dayjs from "dayjs";
import { useUserDetailDataQuery, useUpdateUserMutation, useGetAttachUserListQuery } from "../../services/user";
import { useGetBranchesQuery } from "../../services/branches";
import { useCountries } from "../../hooks/useCountries";

const { Title } = Typography;

/* ─── Helpers ────────────────────────────────────────────────────────── */

const getCssVar = (name: string, fallback: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const normalizeIdType = (val?: string): string | undefined => {
  if (!val) return undefined;
  const map: Record<string, string> = {
    'aadhar':          'Aadhar',
    'driving_license': 'Driving Licence',
    'passport':        'Passport',
  };
  return map[val.toLowerCase()] ?? val;
};

const DL_PATTERNS: Record<string, { pattern: RegExp; hint: string; maxLength: number; placeholder: string }> = {
  IN:      { pattern: /^[A-Z]{2}[0-9]{13}$/, hint: '2 letters + 13 digits (e.g., MH0120230012345)', maxLength: 15, placeholder: 'e.g., MH0120230012345' },
  OTHER:   { pattern: /^[A-Z0-9]{4,25}$/,    hint: 'Alphanumeric 4–25 characters',                  maxLength: 25, placeholder: 'Enter DL number' },
  DEFAULT: { pattern: /^[A-Z0-9]{4,25}$/,    hint: 'Alphanumeric 4–25 characters',                  maxLength: 25, placeholder: 'Enter DL number' },
};

/* ─── Component ──────────────────────────────────────────────────────── */

const EditUser = () => {
  const { theme }  = useTheme();
  const navigate   = useNavigate();
  const [form]     = Form.useForm();
  const { id }     = useParams<{ id: string }>();

  const [tokens,          setTokens]          = useState<Record<string, string>>({});
  const [attachMode,      setAttachMode]      = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    try {
      return (typeof window !== 'undefined' && window?.localStorage?.getItem('selectedCountry')) || 'IN';
    } catch {
      return 'IN';
    }
  });

  const { data: attachUsersData }                                       = useGetAttachUserListQuery(undefined);
  const { data: branchesData }                                          = useGetBranchesQuery(undefined);
  const { countryOptions }                                              = useCountries();
  const { data: userData, isLoading: isLoadingUser, error: userError }  = useUserDetailDataQuery(id as any, { refetchOnMountOrArgChange: true });
  const [updateUser, { isLoading: isUpdating }]                        = useUpdateUserMutation();

  const attachUserOptions = useMemo(() => {
    const users: any[] = (attachUsersData as any)?.users;
    if (!Array.isArray(users)) return [];
    return users.map((u: any) => ({ label: `${u.name} - ${u.phoneNumber}`, value: u.phoneNumber }));
  }, [attachUsersData]);

  const branchOptions = useMemo(() => {
    const list: any[] = (branchesData as any)?.data;
    if (!Array.isArray(list)) return [];
    return list.map((b: any) => ({
      label: `${b.name} — ${b.branchArea || ''} (${b.branchId ?? b._id})`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

  /* ── CSS token sync ── */

  useEffect(() => {
    setTokens({
      colorPrimary:          getCssVar('--accent',      '#A6FF4D'),
      colorBgContainer:      getCssVar('--card-bg',     '#252528'),
      colorBgLayout:         getCssVar('--bg',          '#181A20'),
      colorText:             getCssVar('--sider-text',  '#ffffff'),
      colorBorder:           getCssVar('--muted',       '#444'),
      colorTextPlaceholder:  getCssVar('--placeholder', '#aaa'),
    });
  }, [theme]);

  /* ── Populate form ── */

  useEffect(() => {
    const ud: any = userData;
    if (!ud?.user) return;
    const user:   any = ud.user;
    const member: any = user.member || {};

    if (user.attachedToPhoneNumber || user.isAttached) setAttachMode(true);

    if (member.countryCode) {
      const found = countryOptions.find(c => c.dial === member.countryCode);
      if (found) {
        setSelectedCountry(found.value);
        try { window.localStorage.setItem('selectedCountry', found.value); } catch { /* ignore */ }
      }
    }

    form.setFieldsValue({
      name:                   user.name,
      email:                  user.email,
      phoneNumber:            user.phoneNumber,
      countryCode:            member.countryCode || '+91',
      alternativePhoneNumber: member.alternativePhoneNumber,
      address:                member.address,
      age:                    member.age,
      dob:                    member.dob ? dayjs(member.dob) : null,
      idNumber:               member.idNumber,
      idFront:                member.idFront,
      idBack:                 member.idBack,
      photo:                  member.photo,
      gender:                 member.gender,
      work:                   member.work,
      stateName:              member.stateName,
      zipCode:                member.zipCode,
      nationality:            member.nationality,
      emergencyCall:          member.emergencyContactNumber,
      emergencyName:          member.emergencyContactName,
      emergencyRelation:      member.healthInfo?.emergencyContact?.relation,
      heardFrom:              member.hearAbout,
      referredBy:             member.referred,
      height:                 member.height,
      weight:                 member.weight,
      bmiMeasurement:         member.bmiMeasurement,
      bmiNote:                member.bmi,
      branchId:               user.branchIds?.length
        ? (user.branchIds[0].branchId ?? user.branchIds[0]._id)
        : null,
      medicalHistory:         member.medicalHistory,
      bloodGroup:             member.healthInfo?.bloodGroup,
      maritalStatus:          member.maritalStatus,
      anniversaryDate:        member.anniversaryDate ? dayjs(member.anniversaryDate) : null,
      idType:                 normalizeIdType(member.idType),
      dlCountry:              normalizeIdType(member.idType) === 'Driving Licence'
        ? (member.idCountry === 'Other' ? 'OTHER' : 'IN')
        : undefined,
      userType:               user.userType || 'user',
      attachedToPhoneNumber:  user.attachedToPhoneNumber,
      userMode:               (user.attachedToPhoneNumber || user.isAttached) ? 'attach' : 'fresh',
      passportNumber:         member.passportNumber,
      companyName:            member.companyName,
      fitnessGoalPrimary:     member.fitnessGoals?.primary,
      targetWeight:           member.fitnessGoals?.targetWeight,
      fitnessNotes:           member.fitnessGoals?.notes,
    });
  }, [userData, form, countryOptions]);

  /* ── Form handlers ── */

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
    const payload: Record<string, any> = {
      name:                   values.name,
      email:                  values.email,
      phoneNumber:            values.phoneNumber,
      branchIds:              values.branchId ? [values.branchId] : [],
      dob:                    values.dob ? values.dob.format('YYYY-MM-DD') : null,
      age:                    values.age || null,
      gender:                 values.gender,
      address:                values.address,
      stateName:              values.stateName,
      zipCode:                values.zipCode || null,
      nationality:            values.nationality,
      maritalStatus:          values.maritalStatus,
      anniversaryDate:        values.anniversaryDate ? values.anniversaryDate.format('YYYY-MM-DD') : null,
      countryCode:            values.countryCode || selectedCountry,
      alternativePhoneNumber: values.alternativePhoneNumber,
      photo:                  values.photo,
      height:                 values.height,
      weight:                 values.weight,
      bmi:                    values.bmiNote || null,
      bmiMeasurement:         values.bmiMeasurement,
      medicalHistory:         values.medicalHistory,
      idType:                 values.idType,
      idNumber:               values.idNumber,
      idCountry:              values.idType === 'Driving Licence' ? (values.dlCountry === 'IN' ? 'India' : 'Other') : undefined,
      idFront:                values.idFront,
      idBack:                 values.idBack,
      passportNumber:         values.passportNumber,
      emergencyContactName:   values.emergencyName,
      emergencyContactNumber: values.emergencyCall,
      work:                   values.work,
      companyName:            values.companyName,
      hearAbout:              values.heardFrom || values.hearAbout,
      referred:               values.referredBy || values.referred,
      canTransfer:            false,
      delivered:              'Undelivered',
      assessmentStatus:       'pending',
      assignedTrainer:        null,
      healthInfo: {
        bloodGroup:        values.bloodGroup || null,
        medicalConditions: values.medicalHistory ? [values.medicalHistory] : [],
        allergies:         [],
        emergencyContact:  {
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
      userType:               values.userType || 'user',
      attachedToPhoneNumber:  values.attachedToPhoneNumber || null,
    };

    Object.keys(payload).forEach(k => {
      if (payload[k] === null || payload[k] === undefined || payload[k] === '') delete payload[k];
    });

    try {
      await (updateUser as any)({ id, body: payload }).unwrap();
      navigate(AllUsersRoute);
    } catch (err) {
      console.error('Update user failed', err);
    }
  };

  /* ── Early returns ── */

  if (isLoadingUser) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading user data...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>Error loading user data. Please try again.</p>
      </div>
    );
  }

  /* ── Render ── */

  return (
    <ConfigProvider theme={{ token: tokens as any }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Edit User</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: HomePath },
            { label: 'User Management', to: HomePath },
            { label: 'Edit User' },
          ]}
        />
      </div>

      <div className="page-edit-user">
        <Card style={{ border: 'none', margin: '0 auto', color: 'var(--sider-text)' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed as any}
          >
            {/* PERSONAL INFORMATION */}
            <Title level={4} className="section-title">Personal Information</Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="gender" label="Gender">
                  <Select
                    placeholder="Select gender"
                    options={[
                      { label: 'Male',   value: 'male'   },
                      { label: 'Female', value: 'female' },
                      { label: 'Other',  value: 'other'  },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="dob" label="Date of birth">
                  <DatePicker
                    style={{ width: '100%' }}
                    onChange={date => {
                      if (date) form.setFieldsValue({ age: dayjs().diff(date, 'year') });
                      else      form.setFieldsValue({ age: undefined });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="age" label="Age (auto)">
                  <Input placeholder="Calculated automatically" disabled />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="maritalStatus" label="Marital Status" initialValue="unmarried">
                  <Select
                    options={[
                      { label: 'Unmarried', value: 'unmarried' },
                      { label: 'Married',   value: 'married'   },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Form.Item noStyle shouldUpdate={(p, c) => p.maritalStatus !== c.maritalStatus}>
                {({ getFieldValue }) =>
                  getFieldValue('maritalStatus') === 'married' ? (
                    <Col span={8}>
                      <Form.Item name="anniversaryDate" label="Anniversary Date" rules={[{ required: true, message: 'Please select anniversary date' }]}>
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  ) : null
                }
              </Form.Item>

              <Col span={8}>
                <Form.Item name="stateName" label="State">
                  <Select placeholder="Select state" options={countryStateList as any} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item name="address" label="Address">
                  <Input.TextArea rows={2} placeholder="Enter address" />
                </Form.Item>
              </Col>
            </Row>

            {/* CONTACT DETAILS */}
            <Title level={4} className="section-title">Contact Details</Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="userMode" label="User Mode" initialValue="fresh">
                  <Select
                    options={[
                      { label: 'Fresh User',  value: 'fresh'  },
                      { label: 'Attach User', value: 'attach' },
                    ]}
                    onChange={(val: string) => {
                      const isAttach = val === 'attach';
                      setAttachMode(isAttach);
                      if (isAttach) form.setFieldsValue({ phoneNumber: undefined });
                      else          form.setFieldsValue({ attachedToPhoneNumber: undefined });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                {attachMode ? (
                  <Form.Item name="attachedToPhoneNumber" label="Attach existing user">
                    <Select showSearch placeholder="Search user" options={attachUserOptions} />
                  </Form.Item>
                ) : (
                  <Form.Item label="Phone Number">
                    <div className="country-phone">
                      <Form.Item name="countryCode" noStyle rules={[{ required: true, message: 'Please select country code' }]}>
                        <div className="cc-selected-wrapper">
                          {(() => {
                            const found = countryOptions.find(c => c.value === selectedCountry);
                            if (found?.flag) {
                              return <img src={found.flag} alt={found.name} className="cc-flag" />;
                            }
                            return <div className="cc-flag-placeholder" />;
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
                            filterOption={(input: string, option: any) => {
                              const children = option?.children;
                              let txt = '';
                              if (typeof children === 'string') {
                                txt = children;
                              } else if (children?.props?.children) {
                                const kids = children.props.children;
                                if (Array.isArray(kids)) {
                                  txt = kids.map((k: any) =>
                                    typeof k === 'string' ? k
                                    : Array.isArray(k?.props?.children) ? k.props.children.join('')
                                    : (typeof k?.props?.children === 'string' ? k.props.children : '')
                                  ).join(' ');
                                } else if (typeof kids === 'string') {
                                  txt = kids;
                                }
                              }
                              return (txt + ' ' + (option?.value || '')).toLowerCase().includes(input.toLowerCase());
                            }}
                            style={{ width: 70, paddingInline: 0 }}
                          >
                            {countryOptions.map(co => (
                              <Select.Option key={co.value} value={co.value} data-code={co.value}>
                                <span className="cc-option">
                                  {co.flag && (
                                    <img src={co.flag} alt={co.name} style={{ width: 20, height: 14, objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }} />
                                  )}
                                  {co.labelText}
                                </span>
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </Form.Item>

                      <Form.Item name="phoneNumber" noStyle rules={[{ required: true, message: 'Please enter phone number' }]}>
                        <Input variant="borderless" className="cc-input" placeholder="Enter phone number" />
                      </Form.Item>
                    </div>
                  </Form.Item>
                )}
              </Col>

              <Col span={8}>
                <Form.Item name="alternativePhoneNumber" label="Alternative Phone">
                  <Input placeholder="Enter alternative phone" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="branchId" label="Branch">
                  <Select placeholder="Select branch" options={branchOptions} showSearch allowClear />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="photo" label="Photo">
                  <ImagePicker form={form} name="photo" initialImageUrl={(userData as any)?.user?.member?.photo} />
                </Form.Item>
              </Col>
            </Row>

            {/* IDENTITY INFORMATION */}
            <Title level={4} className="section-title">Identity Information</Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="idType" label="ID Type">
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
                  const idType: string = getFieldValue('idType');
                  if (!idType) return null;

                  const idField = (() => {
                    if (idType === 'Passport') {
                      return (
                        <>
                          <Col span={8}>
                            <Form.Item name="passportNumber" label="Passport Number" rules={[{ required: true, message: 'Please enter passport number' }]}>
                              <Input placeholder="Enter passport number" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Please enter nationality' }]}>
                              <Input placeholder="Enter nationality" />
                            </Form.Item>
                          </Col>
                        </>
                      );
                    }
                    if (idType === 'Aadhar') {
                      return (
                        <Col span={8}>
                          <Form.Item
                            name="idNumber"
                            label="Aadhar Number"
                            normalize={(v) => (v ? String(v).replace(/\s+/g, '') : v)}
                            rules={[
                              { required: true, message: 'Please enter Aadhar number' },
                              { pattern: /^[0-9]{12}$/, message: 'Aadhar number must be exactly 12 digits' },
                            ]}
                          >
                            <Input placeholder="Enter 12 digit Aadhar number" maxLength={12} />
                          </Form.Item>
                        </Col>
                      );
                    }
                    if (idType === 'Driving Licence') {
                      const dlCountry = getFieldValue('dlCountry') as string;
                      const config    = DL_PATTERNS[dlCountry] || (dlCountry ? DL_PATTERNS.DEFAULT : null);
                      return (
                        <>
                          <Col span={8}>
                            <Form.Item name="dlCountry" label="Country" rules={[{ required: true, message: 'Please select country' }]}>
                              <Select placeholder="Select country" options={[{ value: 'IN', label: '🇮🇳 India' }, { value: 'OTHER', label: '🌐 Other' }]} />
                            </Form.Item>
                          </Col>
                          {dlCountry && config && (
                            <Col span={8}>
                              <Form.Item
                                name="idNumber"
                                label="Driving Licence Number"
                                normalize={(v) => (v ? String(v).toUpperCase().replace(/\s+/g, '') : v)}
                                rules={[
                                  { required: true, message: 'Please enter driving licence number' },
                                  ...(dlCountry !== 'OTHER' ? [{ pattern: config.pattern, message: `Format: ${config.hint}` }] : []),
                                ]}
                              >
                                <Input placeholder={config.placeholder} maxLength={config.maxLength} style={{ textTransform: 'uppercase' }} />
                              </Form.Item>
                            </Col>
                          )}
                        </>
                      );
                    }
                    return (
                      <Col span={8}>
                        <Form.Item name="idNumber" label="ID Number">
                          <Input placeholder="Enter ID number" />
                        </Form.Item>
                      </Col>
                    );
                  })();

                  return (
                    <>
                      {idField}
                      <Col span={8}>
                        <Form.Item name="idFront" label="ID Front">
                          <ImagePicker form={form} name="idFront" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="idBack" label="ID Back">
                          <ImagePicker form={form} name="idBack" />
                        </Form.Item>
                      </Col>
                    </>
                  );
                }}
              </Form.Item>

              <Col span={8}>
                <Form.Item name="work" label="Designation">
                  <Input placeholder="Enter designation" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="companyName" label="Company Name">
                  <Input placeholder="Enter company name" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="heardFrom" label="How did you hear about FitClub">
                  <Select
                    placeholder="Select source"
                    options={[
                      { label: 'Friend / Family', value: 'friend'  },
                      { label: 'Social Media',    value: 'social'  },
                      { label: 'Google / Search', value: 'google'  },
                      { label: 'Advertisement',   value: 'ad'      },
                      { label: 'Walk-in',         value: 'walkin'  },
                      { label: 'Other',           value: 'other'   },
                    ]}
                    allowClear
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="referredBy" label="Referred By">
                  <Input placeholder="Enter referrer name or code (optional)" />
                </Form.Item>
              </Col>
            </Row>

            {/* HEALTH & BODY METRICS */}
            <Title level={4} className="section-title">Health & Body Metrics</Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="bmiMeasurement" label="BMI Measurement" initialValue="other">
                  <Select
                    options={[
                      { label: 'Standard (cm/kg)', value: 'standardMeasure' },
                      { label: 'Metric (m/kg)',     value: 'metricMeasure'  },
                      { label: 'Other',             value: 'other'          },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Form.Item noStyle shouldUpdate={(p, c) => p.bmiMeasurement !== c.bmiMeasurement}>
                {({ getFieldValue }) => {
                  const val: string = getFieldValue('bmiMeasurement');
                  if (val !== 'standardMeasure' && val !== 'metricMeasure') return null;
                  return (
                    <>
                      <Col span={8}>
                        <Form.Item name="height" label={val === 'metricMeasure' ? 'Height (m)' : 'Height (cm)'}>
                          <Input placeholder="Enter height" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="weight" label="Weight (kg)">
                          <Input placeholder="Enter weight" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="bmiNote" label="BMI Note">
                          <Input placeholder="BMI note" />
                        </Form.Item>
                      </Col>
                    </>
                  );
                }}
              </Form.Item>

              <Col span={24}>
                <Form.Item name="medicalHistory" label="Medical History">
                  <Input.TextArea rows={3} placeholder="Enter any relevant medical history (allergies, conditions, medications)" />
                </Form.Item>
              </Col>
            </Row>

            {/* EMERGENCY CONTACT */}
            <Title level={4} className="section-title">Emergency Contact</Title>
            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="emergencyName" label="Contact Name">
                  <Input placeholder="Enter emergency contact name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="emergencyCall" label="Contact Number">
                  <Input placeholder="Enter emergency number" />
                </Form.Item>
              </Col>
            </Row>

            {/* BUTTONS */}
            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Space>
                <Button className="reset-btn" onClick={() => form.resetFields()}>Reset</Button>
                <Button className="save-btn" type="primary" htmlType="submit" loading={isUpdating}>
                  Update
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default EditUser;
