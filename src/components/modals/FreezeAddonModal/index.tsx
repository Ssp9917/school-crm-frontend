import React from 'react';
import { Modal, Form, DatePicker, Button, message, InputNumber, notification } from 'antd';
import dayjs from 'dayjs';
import './styles.scss';

const FreezeAddonModal = ({ visible, onCancel, selectedMembership }) => {
  const [form] = Form.useForm();

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

  const handleSubmit = async (values) => {
    try {
      const freezeDays = dayjs(values.endDate).diff(dayjs(values.startDate), 'days');
      
      console.log('Freeze values:', {
        membershipId: selectedMembership?._id,
        freezeDays: values.freezeDays,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        calculatedDays: freezeDays,
      });
      
      // TODO: Add API call here
      // await freezeMembershipMutation({ ... });
      
      message.success('Freeze request submitted successfully!');
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('Failed to submit freeze request');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleFreezeDaysChange = (days) => {
    const startDate = form.getFieldValue('startDate');
    if (startDate && days) {
      const endDate = dayjs(startDate).add(days, 'days');
      form.setFieldsValue({ endDate });
    }
  };

  return (
    <Modal
      title="Freeze Add-On Service"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="freeze-addon-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          name="freezeDays"
          label="Freeze Days"
          rules={[{ required: true, message: 'Please enter freeze days' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            placeholder="Enter number of days"
            onChange={handleFreezeDaysChange}
          />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select start date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            onChange={() => {
              const freezeDays = form.getFieldValue('freezeDays');
              const startDate = form.getFieldValue('startDate');
              if (freezeDays && startDate) {
                const endDate = dayjs(startDate).add(freezeDays, 'days');
                form.setFieldsValue({ endDate });
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="End Date"
          rules={[{ required: true, message: 'Please select end date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            disabled
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit Freeze Request
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FreezeAddonModal;
