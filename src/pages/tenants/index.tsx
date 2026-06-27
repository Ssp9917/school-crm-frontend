import { useState } from "react";
import { Button, Modal, Form, Input, Select, Space, Card, Tag, message } from "antd";
import { PlusOutlined, ApartmentOutlined, GlobalOutlined, SolutionOutlined } from "@ant-design/icons";
import { useGetTenantsQuery, useCreateTenantMutation, useDeleteTenantMutation } from "../../services/tenants";
import CommonTable from "../../components/commonTable";

const SchoolOnboarding = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const { data: tenantsData, isLoading } = useGetTenantsQuery();
  const [createTenant, { isLoading: isCreating }] = useCreateTenantMutation();
  const [deleteTenant] = useDeleteTenantMutation();

  const handleCreate = async (values: any) => {
    try {
      await createTenant(values).unwrap();
      message.success("School Onboarded successfully");
      setModalVisible(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to onboard school");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTenant(id).unwrap();
      message.success("School deleted successfully");
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete school");
    }
  };

  const columns = [
    {
      title: "School Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <strong style={{ color: "var(--accent)" }}>{text}</strong>,
    },
    {
      title: "Subdomain / Slug",
      dataIndex: "slug",
      key: "slug",
      render: (text: string) => <Tag color="blue">{text}.schoolcrm.com</Tag>,
    },
    {
      title: "Domain",
      dataIndex: "domain",
      key: "domain",
      render: (text: string) => text ? <span style={{ color: "#52c41a" }}><GlobalOutlined /> {text}</span> : "-",
    },
    {
      title: "Admin",
      dataIndex: "adminUser",
      key: "adminUser",
      render: (admin: any) => admin ? `${admin.name} (${admin.email})` : "-",
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string) => (
        <Tag color={plan === "enterprise" ? "purple" : plan === "professional" ? "orange" : "default"}>
          {plan ? plan.toUpperCase() : "STARTER"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status ? status.toUpperCase() : "ACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            danger
            onClick={() => {
              Modal.confirm({
                title: "Are you sure you want to delete this school?",
                content: "This will permanently delete the school and all its users. This action cannot be undone.",
                okText: "Yes, Delete",
                cancelText: "No",
                okButtonProps: { danger: true },
                onOk: () => handleDelete(record._id),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="school-onboarding-card" style={{ borderRadius: "12px", background: "var(--card-bg)", borderColor: "var(--muted)", color: "var(--sider-text)" }}>
      <div className="setup-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ color: "var(--sider-text)" }}>School Onboarding (Tenants)</h2>
          <p style={{ color: "var(--placeholder)" }}>Manage registered school tenants and their subscriptions</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ height: "40px", borderRadius: "6px" }}
          onClick={() => setModalVisible(true)}
        >
          Add School
        </Button>
      </div>

      <CommonTable
        dataSource={tenantsData?.data || []}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        style={{ marginTop: "10px" }}
      />

      <Modal
        title={<span><ApartmentOutlined /> Onboard New School Tenant</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ plan: "starter" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="name" label="School Name" rules={[{ required: true, message: "Enter school name" }]}>
              <Input placeholder="Greenwood High School" />
            </Form.Item>
            <Form.Item name="slug" label="Subdomain / Slug" rules={[{ required: true, message: "Enter subdomain slug" }]}>
              <Input placeholder="greenwood" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="domain" label="Custom Domain (Optional)">
              <Input placeholder="www.greenwood.com" />
            </Form.Item>
            <Form.Item name="plan" label="Subscription Plan" rules={[{ required: true }]}>
              <Select options={[
                { label: "Starter Plan", value: "starter" },
                { label: "Professional Plan", value: "professional" },
                { label: "Enterprise Plan", value: "enterprise" }
              ]} />
            </Form.Item>
          </div>

          <h3 style={{ borderBottom: "1px solid var(--muted)", color: "var(--sider-text)", paddingBottom: "8px", marginTop: "16px", marginBottom: "16px" }}>
            <SolutionOutlined /> School Admin Credentials
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="adminName" label="Admin Full Name" rules={[{ required: true, message: "Enter admin's name" }]}>
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item name="adminPhone" label="Admin Phone (Optional)">
              <Input placeholder="9876543210" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="adminEmail" label="Admin Email Address" rules={[{ required: true, type: "email", message: "Enter valid admin email" }]}>
              <Input placeholder="admin@greenwood.com" />
            </Form.Item>
            <Form.Item name="adminPassword" label="Admin Password" rules={[{ required: true, min: 6, message: "Enter password (min 6 chars)" }]}>
              <Input.Password placeholder="AdminSecurePassword123" />
            </Form.Item>
          </div>

          <Form.Item style={{ textAlign: "right", marginTop: "24px", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>Onboard School</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SchoolOnboarding;
