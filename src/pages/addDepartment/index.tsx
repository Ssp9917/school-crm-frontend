import React from "react";
import { Form, Input, Button, message, notification } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import "./styles.scss";
import { useAddDepartmentMutation } from "../../services/departments";
import { AllDepartmentsRoute, Home } from "../../routes/routepath";
import PageBreadcrumb from "../../components/breadcrumb";
import { useNavigate } from "react-router-dom";

const AddDepartment = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [triggerAddDepartment, { isLoading: adding }] = useAddDepartmentMutation();

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

  const handleAddDepartment = async (values) => {
    try {
      await triggerAddDepartment(values).unwrap();
      message.success("Department added successfully");
      form.resetFields();
      navigate(AllDepartmentsRoute);
    } catch (error) {
      message.error(error?.data?.message || "Failed to add department");
    }
  };

  const breadcrumbItems = [
    {
      icon: <HomeOutlined />,
      label: "Home",
      path: Home,
    },
    {
      label: "All Departments",
      path: AllDepartmentsRoute,
    },
    {
      label: "Add Department",
    },
  ];

  return (
    <div className="add-department-container">
      <PageBreadcrumb items={breadcrumbItems} />
      
      <div className="form-section">
        <h2>Add Department</h2>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddDepartment}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Department Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter department name' },
              { min: 2, message: 'Department name must be at least 2 characters' },
              { max: 100, message: 'Department name cannot exceed 100 characters' }
            ]}
          >
            <Input 
              placeholder="Enter department name" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={adding}
              size="large"
            >
              Add Department
            </Button>
            <Button 
              style={{ marginLeft: 8 }} 
              onClick={() => navigate(AllDepartmentsRoute)}
              size="large"
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddDepartment;
