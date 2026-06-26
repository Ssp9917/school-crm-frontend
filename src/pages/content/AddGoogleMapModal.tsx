import { Modal, Form, Input, Button, notification } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import './addGoogleMapModal.scss';

const AddGoogleMapModal = ({ open, onClose, onAdd }) => {
  const [form] = Form.useForm();
  const addressVal = Form.useWatch('address', form);
  const canAdd = !!(addressVal?.trim());

  const onFinishFailed = ({ errorFields }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    const unique = [...new Set(labels)];
    notification.error({
      message: 'Required Fields Missing',
      description: unique.join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  const handleFinish = (values) => {
    onAdd?.(values);
    handleClose();
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={540}
      centered
      className="agm-modal"
    >
      <h2 className="agm-title">Add Google Map</h2>
      <p className="agm-subtitle">Show a specific location or address on a Google Map</p>

      <Form
        form={form}
        layout="vertical"
        className="agm-form"
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item name="address">
          <Input placeholder="Type address here..." size="large" />
        </Form.Item>

        <Button
          htmlType="submit"
          block
          size="large"
          className="agm-add-btn"
          icon={<CheckOutlined />}
          disabled={!canAdd}
        >
          ADD TO PAGE
        </Button>
      </Form>
    </Modal>
  );
};

export default AddGoogleMapModal;