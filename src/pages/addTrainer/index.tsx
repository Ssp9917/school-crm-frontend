import { useMemo } from "react";
import { Form, Input, Select, Button, Spin, notification } from "antd";
import { DeleteOutlined, HomeOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import CountryPhoneInput from "../../components/form/CountryPhoneInput";
import "./styles.scss";
import { useGetBranchesQuery } from "../../services/branches";
import { useGetRolesByLevelQuery } from "../../services/role";
import { useGetClassesQuery } from "../../services/class";
import { useGetSubjectsQuery } from "../../services/subject";
import PageBreadcrumb from "../../components/breadcrumb";
import { AllTrainersRoute, Home } from "../../routes/routepath";
import { useAddTrainersMutation } from "../../services/trainer";
import { useNavigate } from "react-router-dom";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface TeacherFormValues {
  teacherName:        string;
  teacherEmail:       string;
  teacherPhoneNumber: string;
  countryCode?:       string;
  yearsOfExperience:  string | number;
  branchId:           string[];
  role?:              string;
  photo?:             string;
  specialization?:    string[];
  assignedClasses?:   string[];
  assignedSubjects?:  string[];
  idType?:            string;
  idNumber?:          string;
  passportNumber?:    string;
  nationality?:       string;
  idFront?:           string;
  idBack?:            string;
  certificates?:      { title: string }[];
}

const idTypeOptions = [
  { label: 'Aadhar Card',     value: 'Aadhar'           },
  { label: 'Passport',        value: 'Passport'         },
  { label: 'Driving Licence', value: 'Driving Licence'  },
  { label: 'PAN Card',        value: 'pan'              },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddTrainer = () => {
  const nav  = useNavigate();
  const [form] = Form.useForm<TeacherFormValues>();

  const { data: branchesData }                       = useGetBranchesQuery(undefined);
  const { data: rolesData }                          = useGetRolesByLevelQuery(undefined);
  const { data: classesData, isLoading: loadingClasses } = useGetClassesQuery(undefined);
  const { data: subjectsData, isLoading: loadingSubjects } = useGetSubjectsQuery(undefined);
  const [triggerAddTeacher, { isLoading }]           = useAddTrainersMutation();

  const branchOptions = useMemo(() => {
    const data = (branchesData as any)?.data;
    if (!Array.isArray(data)) return [];
    return data.map((b: any) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

  const rolesOptions = useMemo(() => {
    const data = (rolesData as any)?.data;
    if (!Array.isArray(data) || !data.length) return [];
    return data.map((r: any) => ({ label: r.name, value: r._id }));
  }, [rolesData]);

  const classOptions = useMemo(() => {
    const list = (classesData as any)?.data || [];
    return list.map((c: any) => ({ label: c.name, value: c._id }));
  }, [classesData]);

  const subjectOptions = useMemo(() => {
    const list = (subjectsData as any)?.data || [];
    return list.map((s: any) => ({ label: `${s.name} (${s.code || ''})`, value: s._id }));
  }, [subjectsData]);

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

  const handleAddTeacher = async (values: TeacherFormValues) => {
    const payload: Record<string, unknown> = {
      name:           values.teacherName,
      email:          values.teacherEmail,
      phoneNumber:    values.teacherPhoneNumber,
      countryCode:    values.countryCode,
      experience:     values.yearsOfExperience ? Number(values.yearsOfExperience) : 0,
      specialization: values.specialization || [],
      roleId:         values.role || null,
      branchIds:      Array.isArray(values.branchId) ? values.branchId : [values.branchId],
      photo:          values.photo,
      assignedClasses: values.assignedClasses || [],
      assignedSubjects: values.assignedSubjects || [],
      userType:       'TEACHER',
      idType:         values.idType,
      idNumber:       values.idNumber,
      idFront:        values.idFront,
      idBack:         values.idBack,
      certificates:   values.certificates ? values.certificates.map(c => ({ name: c.title })) : [],
    };

    if (values.passportNumber) payload.passportNumber = values.passportNumber;
    if (values.nationality)    payload.nationality    = values.nationality;

    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });

    try {
      await (triggerAddTeacher as any)(payload).unwrap();
      nav(AllTrainersRoute);
      form.resetFields();
    } catch (error) {
      console.error('Error adding teacher:', error);
    }
  };

  return (
    <div className="add-trainer-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Add Teacher</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: "Teacher Management", to: Home },
            { label: "Add Teacher" },
          ]}
        />
      </div>

      <Spin spinning={isLoading} tip="Adding teacher...">
        <Form form={form} layout="vertical" className="trainer-form" onFinish={handleAddTeacher} onFinishFailed={onFinishFailed}>
          <div className="row">
            <Form.Item label="Teacher Name" name="teacherName" rules={[{ required: true, message: 'Please enter teacher name' }]}>
              <Input placeholder="Enter teacher name" />
            </Form.Item>

            <Form.Item label="Teacher Email" name="teacherEmail" rules={[{ type: 'email', required: true, message: 'Please enter valid email' }]}>
              <Input placeholder="Enter teacher email" />
            </Form.Item>

            <CountryPhoneInput form={form} name="teacherPhoneNumber" label="Teacher Phone Number" />

            <Form.Item label="Years Of Experience" name="yearsOfExperience" rules={[{ required: true, message: 'Please enter years of experience' }]}>
              <Input type="number" placeholder="Enter years of experience" />
            </Form.Item>

            <Form.Item label="Select Branch" name="branchId" rules={[{ required: true, message: 'Please select at least one branch' }]}>
              <Select mode="multiple" placeholder="Select branch(es)" options={branchOptions} showSearch allowClear />
            </Form.Item>

            <Form.Item label="Role" name="role">
              <Select placeholder="Select" showSearch options={rolesOptions} />
            </Form.Item>

            <Form.Item label="Assigned Classes" name="assignedClasses">
              <Select mode="multiple" placeholder="Select classes" options={classOptions} loading={loadingClasses} showSearch allowClear />
            </Form.Item>

            <Form.Item label="Assigned Subjects" name="assignedSubjects">
              <Select mode="multiple" placeholder="Select subjects" options={subjectOptions} loading={loadingSubjects} showSearch allowClear />
            </Form.Item>

            <Form.Item label="Specialization / Subjects Taught" name="specialization">
              <Select mode="tags" placeholder="Enter teacher specializations (e.g. Mathematics, English)" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Upload Photo" name="photo">
              <ImagePicker form={form} name="photo" />
            </Form.Item>
          </div>

          <div className="row">
            <Form.Item name="idType" label="ID Type">
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
                    <Form.Item name="idNumber" label="Aadhar Number" normalize={(v) => (v ? String(v).replace(/\s+/g, '') : v)} rules={[{ required: true, message: 'Please enter Aadhar number' }, { pattern: /^[0-9]{12}$/, message: 'Aadhar number must be exactly 12 digits' }]}>
                      <Input placeholder="Enter 12 digit Aadhar number" maxLength={12} />
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
                      <Form.Item name="idFront" label="ID Front">
                        <ImagePicker form={form} name="idFront" />
                      </Form.Item>
                      <Form.Item name="idBack" label="ID Back">
                        <ImagePicker form={form} name="idBack" />
                      </Form.Item>
                    </div>
                  </>
                );
              }}
            </Form.Item>
          </div>

          <div className="certificates-section">
            <h3 style={{ color: 'var(--sider-text)', marginBottom: 16 }}>Certificates</h3>
            <Form.List name="certificates">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="certificate-item">
                      <div className="row">
                        <Form.Item {...restField} name={[name, 'title']} label="Certificate Name" rules={[{ required: true, message: 'Please enter certificate name' }]}>
                          <Input placeholder="Enter certificate name" />
                        </Form.Item>
                        <Button type="link" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} style={{ marginTop: 30 }}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Certificate
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <div className="footer-buttons">
            <Button className="delete-btn" onClick={() => form.resetFields()}>
              <DeleteOutlined /> RESET
            </Button>
            <Button className="save-btn" type="primary" htmlType="submit" loading={isLoading}>
              SAVE
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
};

export default AddTrainer;
