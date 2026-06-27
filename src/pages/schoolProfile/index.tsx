import { useState, useEffect } from "react";
import { Card, Form, Input, Button, Upload, Space, message, Spin, Typography } from "antd";
import { UploadOutlined, FileImageOutlined, SaveOutlined } from "@ant-design/icons";
import { useGetTenantByIdQuery, useUpdateTenantMutation } from "../../services/tenants";

const { Title, Text } = Typography;

const SchoolProfile = () => {
  const [form] = Form.useForm();
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // 1. Fetch user & tenant ID from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const tenantId = user?.tenantId;

  const { data: tenantResponse, isLoading, refetch } = useGetTenantByIdQuery(tenantId, {
    skip: !tenantId,
  });
  const [updateTenant, { isLoading: isSaving }] = useUpdateTenantMutation();

  const tenant = tenantResponse?.data;

  useEffect(() => {
    if (tenant) {
      form.setFieldsValue({
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain || "",
        plan: tenant.plan || "starter",
        status: tenant.status || "active",
      });
      if (tenant.logo) {
        setLogoBase64(tenant.logo);
      }
    }
  }, [tenant, form]);

  const handleLogoUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      setLogoBase64(e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto-upload
  };

  const onFinish = async (values: any) => {
    if (!tenantId) {
      message.error("Tenant ID not found. Please log in again.");
      return;
    }

    try {
      await updateTenant({
        id: tenantId,
        body: {
          name: values.name,
          slug: values.slug,
          domain: values.domain || undefined,
          logo: logoBase64 || undefined,
        },
      }).unwrap();
      message.success("School profile updated successfully");
      refetch();
      // Update locally if needed, e.g. custom logo in sidebar
      if (logoBase64) {
        localStorage.setItem("school_logo", logoBase64);
        window.dispatchEvent(new Event("school_logo_updated"));
      }
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to update school profile");
    }
  };

  if (!tenantId) {
    return (
      <Card style={{ background: "var(--card-bg)", borderColor: "var(--muted)", borderRadius: "12px", textAlign: "center" }}>
        <Text type="danger">School Admin only. No school profile found for this account.</Text>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" tip="Loading school details..." />
      </div>
    );
  }

  return (
    <Card
      style={{
        borderRadius: "12px",
        background: "var(--card-bg)",
        borderColor: "var(--muted)",
        color: "var(--sider-text)",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div className="setup-header" style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ color: "var(--sider-text)", margin: 0 }}>School Profile Settings</Title>
        <Text style={{ color: "var(--placeholder)" }}>Update your school name, subdomain, custom domain, and customized school logo</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "32px", alignItems: "start" }}>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item name="name" label="School Name" rules={[{ required: true, message: "School name is required" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="slug" label="Subdomain Slug" rules={[{ required: true, message: "Subdomain slug is required" }]}>
                <Input placeholder="e.g. greenwood" />
              </Form.Item>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item name="domain" label="Custom Domain (Optional)">
                <Input placeholder="www.greenwood.com" />
              </Form.Item>
              <Form.Item name="plan" label="Subscription Plan">
                <Input disabled style={{ textTransform: "uppercase" }} />
              </Form.Item>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Form.Item name="status" label="School Account Status">
                <Input disabled style={{ textTransform: "uppercase" }} />
              </Form.Item>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Text style={{ fontWeight: 500, color: "var(--sider-text)", marginBottom: "8px" }}>School Logo</Text>
            {logoBase64 ? (
              <div style={{ position: "relative", width: "120px", height: "120px", border: "1px solid var(--muted)", borderRadius: "8px", overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <img src={logoBase64} alt="School Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
            ) : (
              <div style={{ width: "120px", height: "120px", border: "1px dashed var(--muted)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--placeholder)", marginBottom: "12px" }}>
                <FileImageOutlined style={{ fontSize: "28px", marginBottom: "4px" }} />
                <span style={{ fontSize: "12px" }}>No Logo</span>
              </div>
            )}
            <Upload beforeUpload={handleLogoUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} size="small">Choose Image</Button>
            </Upload>
          </div>
        </div>

        <Form.Item style={{ textAlign: "right", marginTop: "32px", marginBottom: 0 }}>
          <Space>
            {logoBase64 && (
              <Button danger onClick={() => { setLogoBase64(null); localStorage.removeItem("school_logo"); window.dispatchEvent(new Event("school_logo_updated")); }} disabled={isSaving}>
                Remove Logo
              </Button>
            )}
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSaving}>
              Save Profile Details
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SchoolProfile;
