import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Button, message, notification } from 'antd';
import { useUpdateInventoryMutation } from '../../../services/inventory';
import './styles.scss';

const AddQuantityModal = ({ open, onClose, recordData, onSuccess }) => {
  const [form] = Form.useForm();
  const [updateInventory, { isLoading }] = useUpdateInventoryMutation();

  // Pre-fill form when modal opens or recordData changes
  useEffect(() => {
    if (open && recordData) {
      form.setFieldsValue({
        addQuantity: 1,
        currentQuantity: recordData.quantity || 0,
        productName: recordData.productName || ''
      });
    }
  }, [open, recordData, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

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
      const newQuantity = recordData.quantity + values.addQuantity;
      
      await updateInventory({
        id: recordData._id,
        quantity: newQuantity
      }).unwrap();

      message.success(`Quantity updated successfully! Added ${values.addQuantity} items.`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      message.error(error?.data?.message || 'Failed to update quantity');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Add Quantity"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      className="add-quantity-modal"
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        className="add-quantity-form"
      >
        <div className="product-info">
          <Form.Item
            label="Product Name"
            name="productName"
          >
            <div className="product-name-display">
              {recordData?.productName || 'N/A'}
            </div>
          </Form.Item>

          <Form.Item
            label="Current Quantity"
            name="currentQuantity"
          >
            <div className="current-quantity-display">
              {recordData?.quantity || 0}
            </div>
          </Form.Item>
        </div>

        <Form.Item
          name="addQuantity"
          label="Quantity to Add"
          rules={[
            { required: true, message: "Please enter quantity to add" },
            { 
              type: 'number', 
              min: 1, 
              message: 'Quantity must be at least 1' 
            }
          ]}
        >
          <InputNumber
            min={1}
            max={9999}
            style={{ width: "100%" }}
            placeholder="Enter quantity to add"
            size="large"
          />
        </Form.Item>

        <Form.Item
          shouldUpdate={(prevValues, currentValues) => 
            prevValues.addQuantity !== currentValues.addQuantity
          }
          noStyle
        >
          {({ getFieldValue }) => {
            const addQuantity = getFieldValue('addQuantity') || 0;
            const currentQuantity = recordData?.quantity || 0;
            const newTotal = currentQuantity + addQuantity;
            
            return (
              <div className="quantity-preview">
                <span className="preview-text">
                  New Total: <strong>{currentQuantity} + {addQuantity} = {newTotal}</strong>
                </span>
              </div>
            );
          }}
        </Form.Item>

        <div className="modal-footer">
          <Button type="default" onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            className="add-btn"
          >
            {isLoading ? 'Adding...' : 'Add Quantity'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddQuantityModal;