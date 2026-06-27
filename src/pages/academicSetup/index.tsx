import { useState, useMemo } from "react";
import { Tabs, Button, Modal, Form, Input, Select, Switch, message, Popconfirm, Space, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, AppstoreOutlined, TeamOutlined } from "@ant-design/icons";
import { useGetClassesQuery, useAddClassMutation, useUpdateClassMutation, useDeleteClassMutation } from "../../services/class";
import { useGetSectionsQuery, useAddSectionMutation, useUpdateSectionMutation, useDeleteSectionMutation } from "../../services/section";
import { useGetSubjectsQuery, useAddSubjectMutation, useUpdateSubjectMutation, useDeleteSubjectMutation } from "../../services/subject";
import { useGetTrainersQuery } from "../../services/trainer";
import CommonTable from "../../components/commonTable";
import "./styles.scss";

const { TabPane } = Tabs;

const AcademicSetup = () => {
  const [activeTab, setActiveTab] = useState("classes");

  // Modals visibility state
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  // Edit states
  const [editingClass, setEditingClass] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingSubject, setEditingSubject] = useState<any>(null);

  // Forms
  const [classForm] = Form.useForm();
  const [sectionForm] = Form.useForm();
  const [subjectForm] = Form.useForm();

  // API hooks
  const { data: teachersData, isLoading: isLoadingTeachers } = useGetTrainersQuery({ limit: 100 });
  const teachersList = useMemo(() => {
    const list = (teachersData as any)?.data || [];
    return list.map((t: any) => ({
      label: t.user?.name || t.name || "Unknown Teacher",
      value: t._id,
    }));
  }, [teachersData]);

  // --- Classes CRUD ---
  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery({});
  const [addClass, { isLoading: isAddingClass }] = useAddClassMutation();
  const [updateClass, { isLoading: isUpdatingClass }] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();

  const handleClassSubmit = async (values: any) => {
    try {
      if (editingClass) {
        await updateClass({ id: editingClass._id, body: values }).unwrap();
        message.success("Class updated successfully");
      } else {
        await addClass(values).unwrap();
        message.success("Class created successfully");
      }
      setClassModalVisible(false);
      classForm.resetFields();
      setEditingClass(null);
    } catch (err: any) {
      message.error(err?.data?.message || "Operation failed");
    }
  };

  const handleEditClass = (record: any) => {
    setEditingClass(record);
    classForm.setFieldsValue({
      name: record.name,
      classTeacher: record.classTeacher?._id || record.classTeacher,
      status: record.status || "active",
    });
    setClassModalVisible(true);
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteClass(id).unwrap();
      message.success("Class deleted successfully");
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete class");
    }
  };

  // --- Sections CRUD ---
  const { data: sectionsData, isLoading: isLoadingSections } = useGetSectionsQuery({});
  const [addSection, { isLoading: isAddingSection }] = useAddSectionMutation();
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();

  const handleSectionSubmit = async (values: any) => {
    try {
      if (editingSection) {
        await updateSection({ id: editingSection._id, body: values }).unwrap();
        message.success("Section updated successfully");
      } else {
        await addSection(values).unwrap();
        message.success("Section created successfully");
      }
      setSectionModalVisible(false);
      sectionForm.resetFields();
      setEditingSection(null);
    } catch (err: any) {
      message.error(err?.data?.message || "Operation failed");
    }
  };

  const handleEditSection = (record: any) => {
    setEditingSection(record);
    sectionForm.setFieldsValue({
      name: record.name,
      classId: record.classId?._id || record.classId,
      classTeacher: record.classTeacher?._id || record.classTeacher,
      status: record.status || "active",
    });
    setSectionModalVisible(true);
  };

  const handleDeleteSection = async (id: string) => {
    try {
      await deleteSection(id).unwrap();
      message.success("Section deleted successfully");
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete section");
    }
  };

  // --- Subjects CRUD ---
  const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjectsQuery({});
  const [addSubject, { isLoading: isAddingSubject }] = useAddSubjectMutation();
  const [updateSubject, { isLoading: isUpdatingSubject }] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const handleSubjectSubmit = async (values: any) => {
    try {
      if (editingSubject) {
        await updateSubject({ id: editingSubject._id, body: values }).unwrap();
        message.success("Subject updated successfully");
      } else {
        await addSubject(values).unwrap();
        message.success("Subject created successfully");
      }
      setSubjectModalVisible(false);
      subjectForm.resetFields();
      setEditingSubject(null);
    } catch (err: any) {
      message.error(err?.data?.message || "Operation failed");
    }
  };

  const handleEditSubject = (record: any) => {
    setEditingSubject(record);
    subjectForm.setFieldsValue({
      name: record.name,
      code: record.code,
      classId: record.classId?._id || record.classId,
      teacherId: record.teacherId?._id || record.teacherId,
      status: record.status || "active",
    });
    setSubjectModalVisible(true);
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id).unwrap();
      message.success("Subject deleted successfully");
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete subject");
    }
  };

  // --- Table Columns ---
  const classColumns = [
    { title: "Class Name", dataIndex: "name", key: "name", render: (text: string) => <strong>{text}</strong> },
    { title: "Class Teacher", dataIndex: ["classTeacher", "user", "name"], key: "classTeacher", render: (text: string, r: any) => text || r.classTeacher?.name || "-" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => (
        <Switch
          checked={status === "active"}
          size="small"
          onChange={async (checked) => {
            try {
              await updateClass({ id: record._id, body: { name: record.name, status: checked ? "active" : "inactive" } }).unwrap();
              message.success("Status updated");
            } catch {
              message.error("Failed to update status");
            }
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClass(record)} />
          <Popconfirm title="Delete this class?" onConfirm={() => handleDeleteClass(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const sectionColumns = [
    { title: "Section Name", dataIndex: "name", key: "name", render: (text: string) => <strong>{text}</strong> },
    { title: "Class", dataIndex: ["classId", "name"], key: "class", render: (text: string, r: any) => text || r.classId?.name || "-" },
    { title: "Class Teacher", dataIndex: ["classTeacher", "user", "name"], key: "classTeacher", render: (text: string, r: any) => text || r.classTeacher?.name || "-" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => (
        <Switch
          checked={status === "active"}
          size="small"
          onChange={async (checked) => {
            try {
              await updateSection({ id: record._id, body: { name: record.name, classId: record.classId?._id || record.classId, status: checked ? "active" : "inactive" } }).unwrap();
              message.success("Status updated");
            } catch {
              message.error("Failed to update status");
            }
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditSection(record)} />
          <Popconfirm title="Delete this section?" onConfirm={() => handleDeleteSection(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subjectColumns = [
    { title: "Subject Name", dataIndex: "name", key: "name", render: (text: string) => <strong>{text}</strong> },
    { title: "Subject Code", dataIndex: "code", key: "code", render: (text: string) => text || "-" },
    { title: "Class", dataIndex: ["classId", "name"], key: "class", render: (text: string, r: any) => text || r.classId?.name || "-" },
    { title: "Assigned Teacher", dataIndex: ["teacherId", "user", "name"], key: "teacher", render: (text: string, r: any) => text || r.teacherId?.name || "-" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => (
        <Switch
          checked={status === "active"}
          size="small"
          onChange={async (checked) => {
            try {
              await updateSubject({ id: record._id, body: { name: record.name, classId: record.classId?._id || record.classId, status: checked ? "active" : "inactive" } }).unwrap();
              message.success("Status updated");
            } catch {
              message.error("Failed to update status");
            }
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditSubject(record)} />
          <Popconfirm title="Delete this subject?" onConfirm={() => handleDeleteSubject(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const classesList = useMemo(() => {
    const list = (classesData as any)?.data || [];
    return list.map((c: any) => ({ label: c.name, value: c._id }));
  }, [classesData]);

  return (
    <Card className="academic-setup-card" style={{ borderRadius: "12px", background: "var(--card-bg)", borderColor: "var(--muted)", color: "var(--sider-text)" }}>
      <div className="setup-header" style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "var(--sider-text)" }}>Academic Setup</h2>
        <p style={{ color: "var(--placeholder)" }}>Manage Classes, Sections, and Subjects allocations</p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab={<span><TeamOutlined /> Classes</span>} key="classes">
          <div className="tab-actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingClass(null); classForm.resetFields(); setClassModalVisible(true); }}>
              Add Class
            </Button>
          </div>
          <CommonTable dataSource={(classesData as any)?.data || []} columns={classColumns} rowKey="_id" loading={isLoadingClasses} pagination={{ pageSize: 10 }} />
        </TabPane>

        <TabPane tab={<span><AppstoreOutlined /> Sections</span>} key="sections">
          <div className="tab-actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSection(null); sectionForm.resetFields(); setSectionModalVisible(true); }}>
              Add Section
            </Button>
          </div>
          <CommonTable dataSource={(sectionsData as any)?.data || []} columns={sectionColumns} rowKey="_id" loading={isLoadingSections} pagination={{ pageSize: 10 }} />
        </TabPane>

        <TabPane tab={<span><BookOutlined /> Subjects</span>} key="subjects">
          <div className="tab-actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSubject(null); subjectForm.resetFields(); setSubjectModalVisible(true); }}>
              Add Subject
            </Button>
          </div>
          <CommonTable dataSource={(subjectsData as any)?.data || []} columns={subjectColumns} rowKey="_id" loading={isLoadingSubjects} pagination={{ pageSize: 10 }} />
        </TabPane>
      </Tabs>

      {/* Class Modal */}
      <Modal title={editingClass ? "Edit Class" : "Add Class"} visible={classModalVisible} onCancel={() => setClassModalVisible(false)} footer={null} destroyOnClose>
        <Form form={classForm} layout="vertical" onFinish={handleClassSubmit} initialValues={{ status: "active" }}>
          <Form.Item name="name" label="Class Name" rules={[{ required: true, message: "Enter class name (e.g. Class 10)" }]}>
            <Input placeholder="Enter class name" />
          </Form.Item>
          <Form.Item name="classTeacher" label="Class Teacher">
            <Select placeholder="Select Class Teacher" options={teachersList} showSearch allowClear loading={isLoadingTeachers} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setClassModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isAddingClass || isUpdatingClass}>Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Section Modal */}
      <Modal title={editingSection ? "Edit Section" : "Add Section"} visible={sectionModalVisible} onCancel={() => setSectionModalVisible(false)} footer={null} destroyOnClose>
        <Form form={sectionForm} layout="vertical" onFinish={handleSectionSubmit} initialValues={{ status: "active" }}>
          <Form.Item name="name" label="Section Name" rules={[{ required: true, message: "Enter section name (e.g. A, B)" }]}>
            <Input placeholder="Enter section name" />
          </Form.Item>
          <Form.Item name="classId" label="Class" rules={[{ required: true, message: "Please select a class" }]}>
            <Select placeholder="Select Class" options={classesList} showSearch />
          </Form.Item>
          <Form.Item name="classTeacher" label="Class Teacher">
            <Select placeholder="Select Class Teacher" options={teachersList} showSearch allowClear loading={isLoadingTeachers} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setSectionModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isAddingSection || isUpdatingSection}>Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Subject Modal */}
      <Modal title={editingSubject ? "Edit Subject" : "Add Subject"} visible={subjectModalVisible} onCancel={() => setSubjectModalVisible(false)} footer={null} destroyOnClose>
        <Form form={subjectForm} layout="vertical" onFinish={handleSubjectSubmit} initialValues={{ status: "active" }}>
          <Form.Item name="name" label="Subject Name" rules={[{ required: true, message: "Enter subject name" }]}>
            <Input placeholder="Enter subject name" />
          </Form.Item>
          <Form.Item name="code" label="Subject Code">
            <Input placeholder="Enter subject code (e.g. MATH101)" />
          </Form.Item>
          <Form.Item name="classId" label="Class" rules={[{ required: true, message: "Please select a class" }]}>
            <Select placeholder="Select Class" options={classesList} showSearch />
          </Form.Item>
          <Form.Item name="teacherId" label="Teacher">
            <Select placeholder="Select Teacher" options={teachersList} showSearch allowClear loading={isLoadingTeachers} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setSubjectModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isAddingSubject || isUpdatingSubject}>Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AcademicSetup;
