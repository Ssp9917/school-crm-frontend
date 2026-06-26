import { useMemo, useEffect } from "react";
import { Form, Input, Select, Button, Spin, notification } from "antd";
import { DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import "./styles.scss";
import { useGetRolesByLevelQuery } from "../../services/role";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { Home, AllEmployeesRoute } from "../../routes/routepath";
import { useGetEmployeeDetailQuery, useUpdateEmployeeMutation } from "../../services/employee";
import { useNavigate, useParams } from "react-router-dom";

/* ─── Helpers ────────────────────────────────────────────────────────── */

const normalizeIdType = (val?: string): string | undefined => {
  if (!val) return undefined;
  const map: Record<string, string> = {
    'aadhar':          'Aadhar',
    'driving_license': 'Driving Licence',
    'passport':        'Passport',
  };
  return map[val.toLowerCase()] ?? val;
};

/* ─── Component ──────────────────────────────────────────────────────── */

const EditEmployee = () => {
  const [form]   = Form.useForm();
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: rolesData }    = useGetRolesByLevelQuery(undefined);
  const { data: branchesData } = useGetBranchesQuery(undefined);
  const {
    data:      employeeData,
    isLoading: isLoadingEmployee,
    error:     employeeError,
  } = useGetEmployeeDetailQuery(id as any);
  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();

  const rolesOptions = useMemo(() => {
    const list: any[] = (rolesData as any)?.data;
    if (!Array.isArray(list) || !list.length) return [];
    return list.map((r: any) => ({ label: r.name, value: r._id }));
  }, [rolesData]);

  const branchOptions = useMemo(() => {
    const list: any[] = (branchesData as any)?.data;
    if (!Array.isArray(list)) return [];
    return list.map((b: any) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b.branchId ?? b._id,
    }));
  }, [branchesData]);

  useEffect(() => {
    const emp: any = (employeeData as any)?.data;
    if (!emp) return;
    const userInfo: any = emp.user || {};
    form.setFieldsValue({
      name:           userInfo.name,
      email:          userInfo.email,
      phone:          userInfo.phoneNumber,
      role:           userInfo.roleId?._id,
      gender:         emp.gender,
      address:        emp.address,
      nationality:    emp.nationality,
      idType:         normalizeIdType(emp.idType),
      idNumber:       emp.idNumber,
      passportNumber: emp.passportNumber,
      idFront:        emp.idFront,
      idBack:         emp.idBack,
      height:         emp.height,
      weight:         emp.weight,
      branchId:       userInfo.branchIds
        ? userInfo.branchIds.map((b: any) => b.branchId || b._id)
        : [],
      photo: emp.photo,
    });
  }, [employeeData, form]);

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

  const handleUpdateEmployee = async (values: Record<string, any>) => {
    const payload: Record<string, any> = {
      name:         values.name,
      email:        values.email,
      phoneNumber:  values.phone,
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

    if (values.passportNumber) payload.passportNumber = values.passportNumber;

    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });

    try {
      const res = await (updateEmployee as any)({ id, body: payload }).unwrap();
      if (res?.success) navigate(AllEmployeesRoute);
    } catch (err) {
      console.error('Update employee failed', err);
    }
  };

  if (isLoadingEmployee) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading employee data...</p>
      </div>
    );
  }

  if (employeeError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>Error loading employee data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="employee-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Edit Employee</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'EMPLOYEE MANAGEMENT', to: Home },
            { label: 'Edit Employee' },
          ]}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        className="employee-form"
        onFinish={handleUpdateEmployee}
        onFinishFailed={onFinishFailed as any}
      >
        <div className="row">
          <Form.Item label="Employee Name"  name="name">
            <Input placeholder="Employee Name" />
          </Form.Item>
          <Form.Item label="Employee Email" name="email">
            <Input placeholder="Employee Email" />
          </Form.Item>
          <Form.Item label="Phone No."      name="phone">
            <Input placeholder="Phone No." />
          </Form.Item>
          <Form.Item label="Address"        name="address">
            <Input placeholder="Address" />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Upload Your Photo" name="photo">
            <ImagePicker form={form} name="photo" />
          </Form.Item>

          <Form.Item label="Role" name="role">
            <Select placeholder="Select" showSearch options={rolesOptions} />
          </Form.Item>

          <Form.Item name="idType" label="ID Type">
            <Select
              placeholder="Select ID Type"
              options={[
                { label: 'Aadhar Card',      value: 'aadhar'          },
                { label: 'Passport',          value: 'passport'        },
                { label: 'Driving Licence',   value: 'driving_license' },
                { label: 'PAN Card',          value: 'pan'             },
              ]}
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.idType !== cur.idType}>
            {({ getFieldValue }) => {
              const idType: string = getFieldValue('idType');
              if (!idType) return null;

              const idField = (() => {
                if (idType === 'Passport') {
                  return (
                    <>
                      <Form.Item name="passportNumber" label="Passport Number" rules={[{ required: true, message: 'Please enter passport number' }]}>
                        <Input placeholder="Enter passport number" />
                      </Form.Item>
                      <Form.Item name="nationality" label="Nationality" rules={[{ required: true, message: 'Please enter nationality' }]}>
                        <Input placeholder="Enter nationality" />
                      </Form.Item>
                    </>
                  );
                }
                if (idType === 'Aadhar') {
                  return (
                    <Form.Item
                      name="idNumber" label="Aadhar Number"
                      normalize={(v) => (v ? String(v).replace(/\s+/g, '') : v)}
                      rules={[
                        { required: true, message: 'Please enter Aadhar number' },
                        { pattern: /^[0-9]{12}$/, message: 'Aadhar number must be exactly 12 digits' },
                      ]}
                    >
                      <Input placeholder="Enter 12 digit Aadhar number" maxLength={12} />
                    </Form.Item>
                  );
                }
                if (idType === 'Driving Licence') {
                  return (
                    <Form.Item
                      name="idNumber" label="Driving Licence Number"
                      normalize={(v) => (v ? String(v).toUpperCase().replace(/\s+/g, '') : v)}
                      rules={[
                        { required: true, message: 'Please enter driving licence number' },
                        { pattern: /^[A-Z]{2}[0-9]{13}$/, message: 'DL format: 2 letters + 13 digits (e.g., MH1420110012345)' },
                      ]}
                    >
                      <Input placeholder="Enter DL number (e.g., MH1420110012345)" maxLength={15} style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                  );
                }
                if (idType === 'pan') {
                  return (
                    <Form.Item
                      name="idNumber" label="PAN Number"
                      normalize={(v) => (v ? String(v).toUpperCase().replace(/\s+/g, '') : v)}
                      rules={[
                        { required: true, message: 'Please enter PAN number' },
                        { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)' },
                      ]}
                    >
                      <Input placeholder="Enter PAN number (e.g., ABCDE1234F)" maxLength={10} style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                  );
                }
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

        <div className="branch-row">
          <Form.Item label="Select Branch(es)" name="branchId" className="branch-select">
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
          <Button className="save-btn" type="primary" htmlType="submit" loading={updating}>
            UPDATE
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditEmployee;
