import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import ImagePicker from '../../components/form/ImagePicker';
import { useGetBranchesQuery } from '../../services/branches';
import { useAddDirectorMutation } from '../../services/director';
import { useGetRolesQuery } from '../../services/role';
import PageBreadcrumb from '../../components/breadcrumb';
import { Home, AllDirectorsRoute } from '../../routes/routepath';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface DirectorFormValues {
  name: string;
  email: string;
  number: string;
  address: string;
  role: string;
  branches: string | string[];
  photo?: string;
}

/* ─── Validators ─────────────────────────────────────────────────────── */

const validatePhoneNumber = (_: unknown, value: string) => {
  if (!value) return Promise.reject(new Error('Please enter phone number'));
  if (!/^[0-9]{10,15}$/.test(value.replace(/\D/g, '')))
    return Promise.reject(new Error('Please enter a valid phone number (10-15 digits)'));
  return Promise.resolve();
};

/* ─── Component ──────────────────────────────────────────────────────── */

const AddDirector = () => {
  const navigate  = useNavigate();
  const [form]    = Form.useForm<DirectorFormValues>();
  const [loading, setLoading] = useState(false);

  const { data: branchesRaw }              = useGetBranchesQuery(undefined);
  const [addDirector, { isLoading: adding }] = useAddDirectorMutation();
  const { data: rolesData }                = useGetRolesQuery(undefined);

  const branches: any[] = (branchesRaw as any)?.branches || (branchesRaw as any)?.data || [];
  const roles:    any[] = (rolesData   as any)?.data      || (rolesData   as any)?.roles  || [];

  const branchOptions = branches.map((b: any) => ({ label: b.name, value: b.id || b._id }));
  const roleOptions   = roles.map((r: any)    => ({ label: r.name, value: r._id || r.id }));

  const onFinish = async (values: DirectorFormValues) => {
    setLoading(true);
    const payload = {
      name:    values.name,
      email:   values.email,
      number:  values.number,
      address: values.address,
      role:    values.role,
      branch:  Array.isArray(values.branches) ? values.branches[0] : values.branches,
      photo:   values.photo,
      image:   values.photo,
    };
    try {
      await (addDirector as any)(payload).unwrap();
      form.resetFields();
      navigate(AllDirectorsRoute);
    } catch (err) {
      console.error('Error adding director:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-director-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Add Director</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'DIRECTOR MANAGEMENT', to: AllDirectorsRoute },
            { label: 'Add Director' },
          ]}
        />
      </div>

      <Form form={form} layout="vertical" className="add-director-form" onFinish={onFinish}>
        <div className="row">
          <Form.Item label="Director Name" name="name" rules={[{ required: true, message: 'Please enter director name' }]}>
            <Input placeholder="Director Name" />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select role' }]}>
            <Select placeholder="Select role" showSearch options={roleOptions} />
          </Form.Item>

          <Form.Item label="Phone Number" name="number" rules={[{ required: true, message: 'Please enter phone number' }, { validator: validatePhoneNumber }]}>
            <Input placeholder="Phone Number" maxLength={15} />
          </Form.Item>

          <Form.Item
            label="Photo"
            name="photo"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => Array.isArray(e) ? e : e?.fileList}
          >
            <ImagePicker form={form} name="photo" aspectRatio={1} />
          </Form.Item>
        </div>

        <div className="row">
          <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please enter address' }]}>
            <Input.TextArea placeholder="Address" rows={2} />
          </Form.Item>

          <Form.Item label="Select Branches" name="branches" rules={[{ required: true, message: 'Please select at least one branch' }]}>
            <Select
              mode="multiple"
              placeholder="Select branches"
              showSearch
              options={branchOptions}
            />
          </Form.Item>
        </div>

        <div className="footer-buttons">
          <Button type="primary" htmlType="submit" loading={loading || adding} className="save-btn">
            Add Director
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddDirector;
