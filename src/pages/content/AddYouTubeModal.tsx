import { Modal, Form, Input, Button, notification } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import './addYouTubeModal.scss';

const AddYouTubeModal = ({ open, onClose, onAdd }) => {
  const [form] = Form.useForm();
  const urlVal = Form.useWatch('url', form);
  const canAdd = !!(urlVal?.trim());

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
      className="ayt-modal"
    >
      <h2 className="ayt-title">Add YouTube Video</h2>

      <Form
        form={form}
        layout="vertical"
        className="ayt-form"
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="YouTube Link URL"
          name="url"
          rules={[{ required: true, message: 'This field is required' }]}
        >
          <Input
            placeholder="e.g. https://www.youtube.com/watch?v=XMxOf9tlA_k"
            size="large"
          />
        </Form.Item>

        <Button
          htmlType="submit"
          block
          size="large"
          className="ayt-add-btn"
          icon={<CheckOutlined />}
          disabled={!canAdd}
        >
          ADD TO PAGE
        </Button>
      </Form>
    </Modal>
  );
};

export default AddYouTubeModal;