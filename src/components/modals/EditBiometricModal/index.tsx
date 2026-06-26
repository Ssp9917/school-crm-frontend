import { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, notification } from 'antd';
import { useUpdateBiometricLimitedMutation } from '../../../services/biometric';
import { useGetBranchesQuery } from '../../../services/branches';
import './styles.scss';


interface BiometricRecord {
  _id?: string;
  machineId?: string;
  model?: string;
  company?: string;
  branchId?: any;
  floor?: string;
  recordPurpose?: string;
  authToken?: string;
}

interface EditBiometricFormValues {
  machineId?: string;
  model?: string;
  company?: string;
  branchId?: string;
  floor: string;
  recordPurpose: string;
  authToken?: string;
}

interface EditBiometricModalProps {
  open: boolean;
  onClose: () => void;
  recordData?: BiometricRecord;
  onSuccess?: () => void;
}

const EditBiometricModal = ({ open, onClose, recordData, onSuccess }: EditBiometricModalProps) => {
  const [form] = Form.useForm<EditBiometricFormValues>();
  const [updateBiometric, { isLoading }]                         = useUpdateBiometricLimitedMutation();
  const { data: branchesData, isLoading: branchesLoading }       = useGetBranchesQuery(undefined);

  useEffect(() => {
    if (open && recordData) {
      form.setFieldsValue({
        machineId:     recordData.machineId     || '',
        model:         recordData.model         || '',
        company:       recordData.company       || '',
        branchId:      typeof recordData.branchId === 'object'
                         ? recordData.branchId?._id || ''
                         : recordData.branchId || '',
        floor:         recordData.floor         || '',
        recordPurpose: recordData.recordPurpose || '',
        authToken:     recordData.authToken     || '',
      });
    }
  }, [open, recordData, form]);

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

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

  const handleSubmit = async (values: EditBiometricFormValues) => {
    if (!recordData) return;
    try {
      await updateBiometric({
        id:            recordData._id || '',
        floor:         values.floor,
        recordPurpose: values.recordPurpose,
        branchId:      values.branchId,
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  return (
    <Modal
      title="Edit Biometric Machine"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      className="edit-biometric-modal"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        className="edit-biometric-form"
      >
        <div className="form-row">
          <Form.Item name="machineId" label="Machine ID" className="form-item">
            <Input placeholder="Machine ID" disabled />
          </Form.Item>
          <Form.Item name="model" label="Model" className="form-item">
            <Input placeholder="Model" disabled />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item name="company" label="Company" className="form-item">
            <Input placeholder="Company" disabled />
          </Form.Item>
          <Form.Item name="branchId" label="Branch" className="form-item">
            <Select
              placeholder="Select branch"
              showSearch
              loading={branchesLoading}
              options={(branchesData as any)?.data?.map((branch: { _id: string; name?: string }) => ({
                value: branch._id,
                label: branch.name,
              }))}
            />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item
            name="floor"
            label="Floor"
            rules={[{ required: true, message: 'Please enter floor' }]}
            className="form-item"
          >
            <Input placeholder="Enter floor" />
          </Form.Item>
          <Form.Item
            name="recordPurpose"
            label="Record Purpose"
            rules={[{ required: true, message: 'Please select record purpose' }]}
            className="form-item"
          >
            <Select
              placeholder="Select record purpose"
              options={[
                { value: 'in',  label: 'In'  },
                { value: 'out', label: 'Out' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item name="authToken" label="Auth Token" className="form-item">
          <Input.TextArea placeholder="Auth Token" rows={3} disabled />
        </Form.Item>

        <div className="form-actions">
          <Button onClick={onClose} className="cancel-btn">Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading} className="submit-btn">
            Update Machine
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditBiometricModal;
