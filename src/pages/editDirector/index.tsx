import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Select, notification } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import ImagePicker from '../../components/form/ImagePicker';
import { useGetBranchesQuery } from '../../services/branches';
import { useGetDirectorDetailQuery, useUpdateDirectorMutation } from '../../services/director';
import { useGetRolesQuery } from '../../services/role';
import PageBreadcrumb from '../../components/breadcrumb';
import { Home, AllDirectorsRoute } from '../../routes/routepath';
import './styles.scss';

/* ─── Validators ─────────────────────────────────────────────────────── */

const validatePhoneNumber = (_: unknown, value: string) => {
  if (!value)                      return Promise.reject(new Error('Phone number is required'));
  if (!/^[0-9]{10}$/.test(value))  return Promise.reject(new Error('Please enter a valid 10-digit phone number'));
  return Promise.resolve();
};

const validateEmail = (_: unknown, value: string) => {
  if (!value)                                      return Promise.reject(new Error('Email is required'));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))  return Promise.reject(new Error('Please enter a valid email address'));
  return Promise.resolve();
};

/* ─── Component ──────────────────────────────────────────────────────── */

const EditDirector = () => {
  const [form]   = Form.useForm();
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const { data: directorData, isLoading: directorLoading } =
    useGetDirectorDetailQuery(id as any);
  const { data: branchesData, isLoading: branchesLoading } = useGetBranchesQuery(undefined);
  const [updateDirector, { isLoading: updating }]          = useUpdateDirectorMutation();
  const { data: rolesData }                                = useGetRolesQuery(undefined);

  const branches: any[] = (branchesData as any)?.branches || (branchesData as any)?.data || [];
  const roles:    any[] = (rolesData    as any)?.data      || (rolesData    as any)?.roles  || [];

  useEffect(() => {
    const director: any = (directorData as any)?.data;
    if (!director || directorLoading) return;

    form.setFieldsValue({
      name:     director.name,
      email:    director.email,
      number:   director.number,
      address:  director.address,
      role:     director.role?._id,
      branches: director.branchIds
        ? director.branchIds.map((b: any) => b._id || b)
        : director.branch?._id ? [director.branch._id] : [],
      photo: director.photo || director.image,
    });
  }, [directorData, directorLoading, form]);

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
    setLoading(true);
    const photoUrl = values.photo;
    const payload = {
      name:      values.name,
      email:     values.email,
      phone:     values.number,
      address:   values.address,
      role:      values.role,
      branchIds: Array.isArray(values.branches) ? values.branches : [values.branches],
      photo:     photoUrl,
      image:     photoUrl,
    };
    try {
      await (updateDirector as any)({ id, ...payload }).unwrap();
      navigate(AllDirectorsRoute);
    } catch (err) {
      console.error('Error updating director:', err);
    }
    setLoading(false);
  };

  const breadcrumbItems = [
    { label: <HomeOutlined />, to: Home },
    { label: 'All Directors',  to: AllDirectorsRoute },
    { label: 'Edit Director' },
  ];

  return (
    <div className="add-director-page">
      <div className="page-header">
        <h2>Edit Director</h2>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="form-container">
        {directorLoading ? (
          <div className="loading-container">
            <div className="loading-text">Loading director data...</div>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed as any}
            className="director-form"
          >
            <div className="form-row">
              <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter director name' }]}>
                <Input placeholder="Enter director name" />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ validator: validateEmail }]}>
                <Input placeholder="Enter email address" />
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item label="Phone Number" name="number" rules={[{ validator: validatePhoneNumber }]}>
                <Input placeholder="Enter phone number" />
              </Form.Item>
              <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please enter address' }]}>
                <Input placeholder="Enter address" />
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select a role' }]}>
                <Select
                  placeholder="Select role"
                  loading={branchesLoading}
                  disabled
                  options={roles.map((r: any) => ({ value: r._id, label: r.name }))}
                />
              </Form.Item>
              <Form.Item label="Branch" name="branches" rules={[{ required: true, message: 'Please select at least one branch' }]}>
                <Select
                  mode="multiple"
                  placeholder="Select branches"
                  loading={branchesLoading}
                  options={branches.map((b: any) => ({ value: b._id, label: b.name }))}
                />
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item label="Photo" name="photo" rules={[{ required: true, message: 'Please upload a photo' }]}>
                <ImagePicker
                  form={form}
                  initialImageUrl={(directorData as any)?.data?.photo || (directorData as any)?.data?.image}
                />
              </Form.Item>
            </div>

            <div className="form-actions">
              <Button type="default" onClick={() => navigate(AllDirectorsRoute)} className="cancel-btn">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading || updating} className="submit-btn">
                Update Director
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default EditDirector;
