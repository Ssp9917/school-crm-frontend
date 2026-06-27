import { useState, useMemo } from "react";
import { Card, Select, Button, Space, Modal, Form, Input, DatePicker, Tag, message } from "antd";
import { CreditCardOutlined, DollarOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetPayrollQuery, useGeneratePayrollMutation, useUpdatePayrollStatusMutation } from "../../services/payroll";
import CommonTable from "../../components/commonTable";

const PayrollPage = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format("MMMM YYYY"));
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();

  // Query Hook
  const { data: payrollData, isLoading, refetch } = useGetPayrollQuery({ month: selectedMonth });
  const [generatePayroll, { isLoading: isGenerating }] = useGeneratePayrollMutation();
  const [updatePayrollStatus, { isLoading: isUpdating }] = useUpdatePayrollStatusMutation();

  const monthOptions = useMemo(() => {
    const list = [];
    for (let i = -6; i <= 2; i++) {
      const m = dayjs().add(i, "month").format("MMMM YYYY");
      list.push({ label: m, value: m });
    }
    return list;
  }, []);

  const handleGenerate = async () => {
    try {
      const res = await generatePayroll({ month: selectedMonth }).unwrap();
      message.success(res?.message || `Successfully generated payroll for ${selectedMonth}`);
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to generate payroll");
    }
  };

  const handleOpenEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      paymentStatus: record.paymentStatus || "Pending",
      basicSalary: record.basicSalary || 0,
      allowances: record.allowances || 0,
      deductions: record.deductions || 0,
      paymentDate: record.paymentDate ? dayjs(record.paymentDate) : dayjs(),
    });
    setModalVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingRecord) return;
    const body = {
      ...values,
      paymentDate: values.paymentStatus === "Paid" && values.paymentDate 
        ? values.paymentDate.format("YYYY-MM-DD") 
        : undefined,
    };

    try {
      await updatePayrollStatus({ id: editingRecord._id, body }).unwrap();
      message.success("Payroll record updated successfully");
      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to update payroll record");
    }
  };

  const columns = [
    {
      title: "Staff Name",
      dataIndex: ["userId", "name"],
      key: "name",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Email",
      dataIndex: ["userId", "email"],
      key: "email",
      render: (text: string) => text || "-",
    },
    {
      title: "Staff Type",
      dataIndex: ["userId", "userType"],
      key: "userType",
      render: (type: string) => (
        <Tag color={type === "TEACHER" ? "cyan" : type === "admin" ? "blue" : "purple"}>
          {type ? type.toUpperCase() : "STAFF"}
        </Tag>
      ),
    },
    {
      title: "Basic Salary",
      dataIndex: "basicSalary",
      key: "basicSalary",
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: "Allowances",
      dataIndex: "allowances",
      key: "allowances",
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: "Deductions",
      dataIndex: "deductions",
      key: "deductions",
      render: (val: number) => `₹${val.toLocaleString()}`,
    },
    {
      title: "Net Salary",
      dataIndex: "netSalary",
      key: "netSalary",
      render: (val: number) => <strong style={{ color: "#52c41a" }}>₹{val.toLocaleString()}</strong>,
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Paid" ? "green" : status === "Pending" ? "orange" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date: string) => date ? dayjs(date).format("YYYY-MM-DD") : "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
            disabled={record.paymentStatus === "Paid"}
          >
            Process/Payout
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="payroll-page-card" style={{ borderRadius: "12px", background: "var(--card-bg)", borderColor: "var(--muted)", color: "var(--sider-text)" }}>
      <div className="setup-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ color: "var(--sider-text)" }}>Staff Payroll & Salary Sheets</h2>
          <p style={{ color: "var(--placeholder)" }}>Manage salary structures, allowances, deductions, and payout statuses for school staff</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Select
            options={monthOptions}
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: "160px" }}
          />
          <Button
            type="primary"
            icon={<DollarOutlined />}
            onClick={handleGenerate}
            loading={isGenerating}
          >
            Generate Payroll
          </Button>
        </div>
      </div>

      <CommonTable
        dataSource={payrollData?.data || []}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        style={{ marginTop: "16px" }}
      />

      {/* Process Payout Modal */}
      <Modal
        title={<span><CreditCardOutlined /> Process Salary Payout</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="basicSalary" label="Basic Salary (₹)" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="paymentStatus" label="Payment Status" rules={[{ required: true }]}>
              <Select options={[
                { label: "Pending", value: "Pending" },
                { label: "Paid", value: "Paid" },
                { label: "Unpaid", value: "Unpaid" }
              ]} />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="allowances" label="Allowances (₹)">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="deductions" label="Deductions (₹)">
              <Input type="number" />
            </Form.Item>
          </div>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.paymentStatus !== curr.paymentStatus}>
            {({ getFieldValue }) => {
              const isPaid = getFieldValue("paymentStatus") === "Paid";
              return isPaid ? (
                <Form.Item name="paymentDate" label="Payout Date" rules={[{ required: true, message: "Select payout date" }]}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: "24px", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>Save & Update Slip</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PayrollPage;
