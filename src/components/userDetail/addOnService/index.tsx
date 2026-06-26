
import { useState } from 'react';
import { Button, Modal, Form, InputNumber, message, notification } from 'antd';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import MembershipCard from '../../card/memberShipCard';
import { useGetUserAddOnsQuery, useAddComplementarySessionMutation } from '../../../services/membership';
import usePermissions from '../../../hooks/usePermissions';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Branch {
  _id?: string;
  name?: string;
}

interface UserData {
  branchIds?: Branch[];
}

interface UserOutletContext {
  userData?: UserData;
}

interface AddOnMembership {
  _id?: string;
  addonType?: string;
}

interface AddSessionFormValues {
  membershipId?: string;
  numberOfSessions: number;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AddOnService = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userData } = useOutletContext<UserOutletContext>() ?? {};
  const userBranchName = userData?.branchIds?.[0]?.name ?? null;

  const [form] = Form.useForm<AddSessionFormValues>();
  const [isModalVisible, setIsModalVisible]     = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<AddOnMembership | null>(null);

  const { hasPermission } = usePermissions();

  const { data, isLoading } = useGetUserAddOnsQuery(id, { refetchOnMountOrArgChange: true });
  const [addComplementarySession] = useAddComplementarySessionMutation();

  const showModal = (membership: AddOnMembership | null = null) => {
    setIsModalVisible(true);
    setSelectedMembership(membership);
    if (membership) {
      form.setFieldsValue({ membershipId: membership._id });
    }
  };

  const handleAddSessionFromCard = (membership: AddOnMembership) => {
    showModal(membership);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedMembership(null);
    form.resetFields();
  };

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({
      message: 'Required Fields Missing',
      description: [...new Set(labels)].join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  const handleSubmit = async (values: AddSessionFormValues) => {
    setLoading(true);
    try {
      const membershipId = selectedMembership?._id || values.membershipId;
      if (!membershipId) {
        message.error('Please select a membership');
        setLoading(false);
        return;
      }
      await (addComplementarySession as any)({
        membershipId,
        serviceType: selectedMembership?.addonType,
        sessions:    values.numberOfSessions,
      }).unwrap();
      setIsModalVisible(false);
      setSelectedMembership(null);
      form.resetFields();
    } catch (error) {
      console.error('Error adding session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addon-service-container">
      <div className="table-header">
        <h3 className="section-title">Add-On Services</h3>
        <div className="header-actions">
          {hasPermission('9-ud-buy-addon') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/user-detail/${id}/select-addon-service`)}
            >
              Add On Service
            </Button>
          )}
        </div>
      </div>

      <MembershipCard
        membershipData={data}
        isLoading={isLoading}
        onAddSession={handleAddSessionFromCard}
        fallbackBranchName={userBranchName}
      />

      <Modal
        title="Add Session"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item name="membershipId" hidden>
            <input type="hidden" />
          </Form.Item>

          <Form.Item
            name="numberOfSessions"
            label="Number of Sessions"
            rules={[
              { required: true, message: 'Please enter number of sessions' },
              { type: 'number', min: 1, message: 'Must be at least 1' },
            ]}
          >
            <InputNumber
              placeholder="Enter number of sessions"
              size="large"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Session
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddOnService;
