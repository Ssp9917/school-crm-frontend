import { useMemo, useState } from "react";
import { Form, Input, Select, Button, Modal, notification } from "antd";
import { DeleteOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons";
import ImagePicker from "../../components/form/ImagePicker";
import CountryPhoneInput from "../../components/form/CountryPhoneInput";
import { useGetRolesByLevelQuery } from "../../services/role";
import { useAddGeneralStaffMutation, useGetStaffTypesQuery, useAddStaffTypeMutation } from "../../services/generalStaff";
import { useGetBranchesQuery } from "../../services/branches";
import PageBreadcrumb from "../../components/breadcrumb";
import { Home, AllGeneralStaffRoute } from "../../routes/routepath";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface StaffFormValues {
  name: string;
  phone: string;
  countryCode?: string;
  address: string;
  role?: string;
  photo?: string;
  idType?: string;
  idNumber?: string;
  passportNumber?: string;
  nationality?: string;
  idFront?: string;
  idBack?: string;
  branchId?: string[];
}

interface StaffTypeFormValues {
  name: string;
  description?: string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const idTypeOptions = [
  { label: 'Aadhar Card',     value: 'Aadhar'           },
  { label: 'Passport',        value: 'Passport'         },
  { label: 'Driving Licence', value: 'Driving Licence'  },
  { label: 'PAN Card',        value: 'pan'              },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const AddGeneralStaff = () => {
  const navigate = useNavigate();
  const [form]          = Form.useForm<StaffFormValues>();
  const [staffTypeForm] = Form.useForm<StaffTypeFormValues>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: rolesData    } = useGetRolesByLevelQuery(undefined);
  const { data: branchesData } = useGetBranchesQuery(undefined);
  const { data: staffTypesData } = useGetStaffTypesQuery(undefined);
  const [addGeneralStaff, { isLoading: adding }]      = useAddGeneralStaffMutation();
  const [addStaffType,    { isLoading: addingStaffType }] = useAddStaffTypeMutation();

  const rolesOptions = useMemo(() => {
    const data = (rolesData as any)?.data;
    return Array.isArray(data) ? data.map((r: any) => ({ label: r.name, value: r._id })) : [];
  }, [rolesData]);

  const staffTypeOptions = useMemo(() => {
    const data = (staffTypesData as any)?.data;
    if (!Array.isArray(data)) return [];
    return data.map((t: any) => ({ label: t.name, value: t._id ?? t.name }));
  }, [staffTypesData]);

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

  const handleAddStaffType = async (values: StaffTypeFormValues) => {
    const res = await (addStaffType as any)({ name: values.name, description: values.description }).unwrap();
    if (res?.success) { staffTypeForm.resetFields(); setIsModalOpen(false); }
  };

  const handleAddGeneralStaff = async (values: StaffFormValues) => {
    const payload: Record<string, unknown> = {
      name:         values.name,
      phoneNumber:  values.phone,
      countryCode:  values.countryCode,
      roleId:       values.role || null,
      employeeType: 'general-staff',
      address:      values.address,
      idType:       values.idType,
      idNumber:     values.idNumber,
      idFront:      values.idFront,
      idBack:       values.idBack,
      branchIds:    values.branchId,
      photo:        values.photo,
    };
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
    });
    const res = await (addGeneralStaff as any)(payload).unwrap();
    if (res?.success) { form.resetFields(); navigate(AllGeneralStaffRoute); }
  };

  return (
    <div className="general-staff-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Add General Staff</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'EMPLOYEE MANAGEMENT', to: Home },
            { label: 'Add General Staff' },
          ]}
        />
      </div>

      <Form form={form} layout="vertical" className="general-staff-form" onFinish={handleAddGeneralStaff} onFinishFailed={onFinishFailed}>
        <div className="row">
          <Form.Item label="Staff Name" name="name" rules={[{ required: true, message: 'Please enter staff name' }]}>
            <Input placeholder="Staff Name" />
          </Form.Item>

          <CountryPhoneInput form={form} name="phone" label="Phone No." />

          <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please enter address' }]}>
            <Input placeholder="Address" />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Select 
                Designation
                <Button size="small" icon={<PlusOutlined />} className="add-role-btn" onClick={() => setIsModalOpen(true)}>
                  Add Designation
                </Button>
              </span>
            }
            name="role"
            rules={[{ required: true, message: 'Please select designation' }]}
          >
            <Select placeholder="Select Designation" showSearch options={staffTypeOptions} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Upload Your Photo" name="photo" rules={[{ required: true, message: 'Please upload photo' }]}>
            <ImagePicker form={form} name="photo" />
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
            <Select mode="multiple" placeholder="Select Branch(es)" showSearch allowClear options={branchOptions} />
          </Form.Item>
        </div>

        <div className="footer-buttons">
          <Button className="delete-btn" onClick={() => form.resetFields()}>
            <DeleteOutlined /> RESET
          </Button>
          <Button className="save-btn" type="primary" htmlType="submit" loading={adding}>SAVE</Button>
        </div>
      </Form>

      <Modal
        title="Add Staff Designation"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); staffTypeForm.resetFields(); }}
        onOk={() => staffTypeForm.submit()}
        okText="Add"
        confirmLoading={addingStaffType}
        destroyOnHidden
      >
        <Form form={staffTypeForm} layout="vertical" onFinish={handleAddStaffType} onFinishFailed={onFinishFailed}>
          <Form.Item label="Designation Name" name="name" rules={[{ required: true, message: 'Please enter role name' }]}>
            <Input placeholder="e.g. Housekeeping" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea placeholder="Brief description (optional)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddGeneralStaff;
