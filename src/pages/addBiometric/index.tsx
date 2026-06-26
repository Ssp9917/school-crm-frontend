import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, message } from 'antd';
import { HomeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetBranchesQuery } from '../../services/branches';
import { useAddBiometricMutation } from '../../services/biometric';
import PageBreadcrumb from '../../components/breadcrumb';
import { Home, AllBiometricsRoute } from '../../routes/routepath';
import './styles.scss';

const { Option } = Select;

const AddBiometric = () => {
  const [loading, setLoading] = useState(false);
  const { data: branchesData } = useGetBranchesQuery();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [addBiometric, { isLoading: adding }] = useAddBiometricMutation();

  // Prepare branch options
  const branchOptions = useMemo(() => {
    if (!branchesData || !Array.isArray(branchesData.data)) return [];
    return branchesData.data.map((b) => ({
      label: `${b.name}${b.branchArea ? ` — ${b.branchArea}` : ''}`,
      value: b._id,
    }));
  }, [branchesData]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        machineId: values.machineId,
        authToken: values.authorizedMachineToken,
        branchId: values.branchId,
        floor: values.floor,
        recordPurpose: values.recordPurpose,
        model: values.biometricModelNo,
        company: values.biometricManufactureCompany,
      };

      await addBiometric(payload).unwrap();
      form.resetFields();
      navigate(AllBiometricsRoute);
    } catch (err) {
      console.error('Error adding biometric:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-biometric-page">
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 16, 
        flexWrap: "wrap" 
      }}>
        <h2 style={{ margin: 0 }}>Add Biometric Machine</h2>
        <PageBreadcrumb
          items={[
            { label: <HomeOutlined />, to: Home },
            { label: 'BIOMETRIC MANAGEMENT', to: AllBiometricsRoute },
            { label: 'Add Biometric Machine' }
          ]}
        />
      </div>
      
      <Form 
        form={form} 
        layout="vertical" 
        className="add-biometric-form" 
        onFinish={onFinish}
        onFinishFailed={(errorInfo) => {
          console.log('Form validation failed:', errorInfo);
        }}
      >
        <div className="row">
          <Form.Item 
            label="Machine ID" 
            name="machineId" 
            rules={[
              { required: true, message: 'Please enter machine ID' },
              { min: 3, message: 'Machine ID must be at least 3 characters' }
            ]}
          >
            <Input placeholder="Enter Machine ID" />
          </Form.Item>
          
          <Form.Item 
            label="Biometric Model No" 
            name="biometricModelNo" 
            rules={[
              { required: true, message: 'Please enter biometric model number' }
            ]}
          >
            <Input placeholder="Enter Model Number" />
          </Form.Item>
          
          <Form.Item 
            label="Biometric Manufacture Company" 
            name="biometricManufactureCompany" 
            rules={[
              { required: true, message: 'Please enter manufacture company' }
            ]}
          >
            <Input placeholder="Enter Manufacture Company" />
          </Form.Item>
          
          <Form.Item 
            label="Select Branch" 
            name="branchId" 
            rules={[{ required: true, message: 'Please select branch' }]}
          >
            <Select 
              placeholder="Select Branch"
              showSearch
              optionFilterProp="label"
              options={branchOptions}
            />
          </Form.Item>
        </div>
        
        <div className="row">
          <Form.Item 
            label="Floor" 
            name="floor" 
            rules={[{ required: true, message: 'Please enter floor' }]}
          >
            <Input placeholder="Enter Floor (e.g., Ground Floor, 1st Floor)" />
          </Form.Item>
          
          <Form.Item 
            label="Record Purpose" 
            name="recordPurpose" 
            rules={[{ required: true, message: 'Please select record purpose' }]}
          >
            <Select placeholder="Select Record Purpose">
              <Option value="in">Entry/Check-in</Option>
              <Option value="out">Exit/Check-out</Option>
              {/* <Option value="attendance">Attendance</Option>
              <Option value="access_control">Access Control</Option>
              <Option value="gym_access">Gym Access</Option>
              <Option value="staff_tracking">Staff Tracking</Option>
              <Option value="visitor_management">Visitor Management</Option> */}
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Authorized Machine Token" 
            name="authorizedMachineToken" 
            rules={[
              { required: true, message: 'Please enter authorized machine token' },
              { min: 8, message: 'Token must be at least 8 characters' }
            ]}
          >
            <Input.Password placeholder="Enter Authorized Machine Token" />
          </Form.Item>
        </div>
        
        <div className="footer-buttons">
          <Button 
            className="delete-btn" 
            onClick={() => form.resetFields()}
          >
            <DeleteOutlined /> RESET
          </Button>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading || adding} 
            className="save-btn"
          >
            SAVE
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddBiometric;