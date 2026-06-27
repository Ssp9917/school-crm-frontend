import { useState, useMemo } from "react";
import { Button, Modal, Form, Input, Select, Switch, message, Popconfirm, Space, Card, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useGetParentsQuery, useAddParentMutation, useUpdateParentMutation, useDeleteParentMutation } from "../../services/parent";
import { useGetStudentsQuery } from "../../services/student";
import { useGetBranchesQuery } from "../../services/branches";
import SearchBar from "../../components/searchBar";
import CommonTable from "../../components/commonTable";
import "./styles.scss";

const Parents = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState<any>(null);
  const [form] = Form.useForm();

  // Queries
  const { data: parentsData, isLoading, refetch } = useGetParentsQuery({
    page,
    limit,
    search: searchText || undefined,
  });

  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentsQuery({ limit: 200 });
  const studentsList = useMemo(() => {
    const list = (studentsData as any)?.data || [];
    return list.map((s: any) => ({
      label: `${s.user?.name || s.name || "Unknown"} (ID: ${s.studentId})`,
      value: s._id,
    }));
  }, [studentsData]);

  const { data: branchesData } = useGetBranchesQuery(undefined);
  const branchOptions = useMemo(() => {
    const data = (branchesData as any)?.data;
    if (!Array.isArray(data)) return [];
    return data.map((b: any) => ({
      label: b.name,
      value: b._id,
    }));
  }, [branchesData]);

  const [addParent, { isLoading: isAdding }] = useAddParentMutation();
  const [updateParent, { isLoading: isUpdating }] = useUpdateParentMutation();
  const [deleteParent] = useDeleteParentMutation();

  const handleStatusToggle = async (record: any, checked: boolean) => {
    try {
      await updateParent({
        id: record._id,
        body: { status: checked ? "ACTIVE" : "INACTIVE" }
      }).unwrap();
      message.success("Status updated successfully");
      refetch();
    } catch {
      message.error("Failed to update status");
    }
  };

  const handleEdit = (record: any) => {
    setEditingParent(record);
    form.setFieldsValue({
      name: record.user?.name,
      email: record.user?.email,
      phoneNumber: record.user?.phoneNumber,
      occupation: record.occupation,
      relation: record.relation,
      students: record.students?.map((s: any) => s._id || s),
      branchIds: record.user?.branchIds?.map((b: any) => b._id || b),
      status: record.status || "ACTIVE",
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteParent(id).unwrap();
      message.success("Parent deleted successfully");
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete parent");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        students: values.students || [],
        branchIds: values.branchIds || [],
      };
      if (editingParent) {
        await updateParent({ id: editingParent._id, body: payload }).unwrap();
        message.success("Parent updated successfully");
      } else {
        await addParent(payload).unwrap();
        message.success("Parent added successfully");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingParent(null);
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || "Operation failed");
    }
  };

  const columns = [
    { title: "Parent ID", dataIndex: "parentId", key: "parentId", render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: "Name", dataIndex: ["user", "name"], key: "name", render: (text: string) => <strong>{text || "-"}</strong> },
    { title: "Phone", dataIndex: ["user", "phoneNumber"], key: "phone", render: (text: string) => text || "-" },
    { title: "Email", dataIndex: ["user", "email"], key: "email", render: (text: string) => text || "-" },
    { title: "Relation", dataIndex: "relation", key: "relation" },
    { title: "Occupation", dataIndex: "occupation", key: "occupation", render: (text: string) => text || "-" },
    {
      title: "Students",
      dataIndex: "students",
      key: "students",
      render: (students: any[]) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {students?.map((s: any) => (
            <Tag color="green" key={s._id || s}>
              {s.user?.name || s.name || s.studentId || "Student"}
            </Tag>
          ))}
          {!students?.length && "-"}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => (
        <Switch
          checked={status === "ACTIVE"}
          size="small"
          onChange={(checked) => handleStatusToggle(record, checked)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Delete this parent and user account?" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const parentList = (parentsData as any)?.data || [];
  const total = (parentsData as any)?.total || 0;

  return (
    <Card className="parents-management-card" style={{ borderRadius: "12px", background: "var(--card-bg)", borderColor: "var(--muted)", color: "var(--sider-text)" }}>
      <div className="parents-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="title-section">
          <h2 style={{ color: "var(--sider-text)", margin: 0 }}>Parents Directory</h2>
          <p style={{ color: "var(--placeholder)", margin: 0 }}>Register and manage students' parent profiles</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingParent(null); form.resetFields(); setModalVisible(true); }}>
          Add Parent
        </Button>
      </div>

      <div className="filter-section" style={{ marginBottom: 16 }}>
        <SearchBar value={searchText} onChange={(val) => { setSearchText(val); setPage(1); }} placeholder="Search parents..." />
      </div>

      <CommonTable dataSource={parentList} columns={columns} rowKey="_id" loading={isLoading} pagination={{
        current: page,
        pageSize: limit,
        total,
        onChange: (p, l) => { setPage(p); setLimit(l); },
        showSizeChanger: true,
      }} />

      <Modal title={editingParent ? "Edit Parent" : "Add Parent"} visible={modalVisible} onCancel={() => setModalVisible(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ relation: "Father", status: "ACTIVE" }}>
          <Form.Item name="name" label="Parent Name" rules={[{ required: true, message: "Enter parent name" }]}>
            <Input placeholder="Enter parent name" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" placeholder="Enter email" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true, message: "Enter phone number" }]}>
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item name="relation" label="Relation" rules={[{ required: true }]}>
            <Select options={[{ label: "Father", value: "Father" }, { label: "Mother", value: "Mother" }, { label: "Guardian", value: "Guardian" }, { label: "Other", value: "Other" }]} />
          </Form.Item>
          <Form.Item name="occupation" label="Occupation">
            <Input placeholder="Enter occupation (e.g. Engineer)" />
          </Form.Item>
          <Form.Item name="students" label="Linked Students">
            <Select mode="multiple" placeholder="Select student(s)" options={studentsList} showSearch allowClear loading={isLoadingStudents} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
          </Form.Item>
          <Form.Item name="branchIds" label="Branches">
            <Select mode="multiple" placeholder="Select branches" options={branchOptions} showSearch />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[{ label: "Active", value: "ACTIVE" }, { label: "Inactive", value: "INACTIVE" }]} />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isAdding || isUpdating}>Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Parents;
