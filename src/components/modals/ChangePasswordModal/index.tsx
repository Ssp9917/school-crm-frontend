import React from 'react';
import { Modal, Form, Input, Button, message, notification } from 'antd';
import './styles.scss';
import { useChangePasswordMutation } from '../../../services/auth';

const ChangePasswordModal = ({ 
  visible, 
  onCancel, 
  selectedUser, 
  userType = 'user' // 'user', 'director', 'employee' 
}) => {
  const [form] = Form.useForm();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();


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

  const handlePasswordSubmit = async (values) => {
    try {
      await changePassword({
        userId: selectedUser?.userId?._id || selectedUser?._id,
        newPassword: values.newPassword,
        sendEmail: true
      }).unwrap();
      
      onCancel();
      form.resetFields();
    } catch (error) {
      message.error(error?.data?.message);
      console.error('Password change error:', error);
    }
  };

  const handleCancel = () => {
    onCancel();
    form.resetFields();
  };

  // Password validation
  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('newPassword') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Passwords do not match!'));
    }
  });
  return (
    <Modal
      title="Change Password"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="change-password-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handlePasswordSubmit}
        onFinishFailed={onFinishFailed}
        className="password-form"
      >
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: 'Please enter new password' },
            { min: 6, message: 'Password must be at least 6 characters' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            }
          ]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm new password' },
            validateConfirmPassword(form)
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <div className="modal-actions">
          <Button 
            type="default" 
            onClick={handleCancel}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="submit-btn"
            loading={changingPassword}
          >
            Change Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;