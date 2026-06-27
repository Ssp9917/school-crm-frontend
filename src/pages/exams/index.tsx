import { useState, useMemo } from "react";
import { Tabs, Card, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, CalendarOutlined, FileDoneOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetClassesQuery } from "../../services/class";
import { useGetSubjectsQuery } from "../../services/subject";
import { useGetStudentsQuery } from "../../services/student";
import {
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useSubmitMarksMutation,
  useGetMarksListQuery
} from "../../services/exams";
import CommonTable from "../../components/commonTable";

const { TabPane } = Tabs;

const ExamsPage = () => {
  const [activeTab, setActiveTab] = useState("schedules");

  // Modals visibility state
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [examForm] = Form.useForm();

  // Marks entry filters
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [localMarks, setLocalMarks] = useState<Record<string, { marksObtained: number; grade: string; remarks: string }>>({});

  // Query Hooks
  const { data: classesData } = useGetClassesQuery({});
  const { data: subjectsData } = useGetSubjectsQuery({});
  const { data: examsData, isLoading: isLoadingExams, refetch: refetchExams } = useGetExamsQuery({});

  const [createExam, { isLoading: isCreatingExam }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdatingExam }] = useUpdateExamMutation();
  const [deleteExam] = useDeleteExamMutation();
  const [submitMarks, { isLoading: isSubmittingMarks }] = useSubmitMarksMutation();

  // Resolve filters & class ID for marks entry
  const examsList = useMemo(() => {
    return (examsData as any)?.data || [];
  }, [examsData]);

  const classesOptions = useMemo(() => {
    const list = (classesData as any)?.data || [];
    return list.map((c: any) => ({ label: c.name, value: c._id }));
  }, [classesData]);

  const examOptions = useMemo(() => {
    return examsList.map((e: any) => ({ label: `${e.name} (${e.classId?.name || "Class"})`, value: e._id }));
  }, [examsList]);

  // Find classId associated with the selected exam
  const selectedExamClassId = useMemo(() => {
    const exam = examsList.find((e: any) => e._id === selectedExam);
    return exam ? exam.classId?._id || exam.classId : "";
  }, [selectedExam, examsList]);

  const subjectsOptions = useMemo(() => {
    const list = (subjectsData as any)?.data || [];
    return list
      .filter((s: any) => !selectedExamClassId || s.classId?._id === selectedExamClassId || s.classId === selectedExamClassId)
      .map((s: any) => ({ label: `${s.name} (${s.code || "No Code"})`, value: s._id }));
  }, [subjectsData, selectedExamClassId]);

  // Load students for marks entry class scope
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentsQuery(
    { classId: selectedExamClassId, limit: 100 },
    { skip: !selectedExamClassId }
  );

  // Load already submitted marks list
  const { data: marksListData, refetch: refetchMarksList } = useGetMarksListQuery(
    { examId: selectedExam, subjectId: selectedSubject },
    { skip: !selectedExam || !selectedSubject }
  );

  const handleExamSubmit = async (values: any) => {
    const body = {
      ...values,
      startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : undefined,
      endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : undefined,
    };
    try {
      if (editingExam) {
        await updateExam({ id: editingExam._id, body }).unwrap();
        message.success("Exam schedule updated successfully");
      } else {
        await createExam(body).unwrap();
        message.success("Exam schedule created successfully");
      }
      setExamModalVisible(false);
      examForm.resetFields();
      setEditingExam(null);
      refetchExams();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to save exam schedule");
    }
  };

  const handleEditExam = (record: any) => {
    setEditingExam(record);
    examForm.setFieldsValue({
      name: record.name,
      term: record.term,
      classId: record.classId?._id || record.classId,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      status: record.status || "active",
    });
    setExamModalVisible(true);
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await deleteExam(id).unwrap();
      message.success("Exam schedule deleted successfully");
      refetchExams();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to delete exam");
    }
  };

  // Marks changes helpers
  const handleMarkObtainedChange = (studentId: string, val: number) => {
    setLocalMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: val,
      },
    }));
  };

  const handleGradeChange = (studentId: string, val: string) => {
    setLocalMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        grade: val,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, val: string) => {
    setLocalMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: val,
      },
    }));
  };

  const handleMarksSubmit = async () => {
    if (!selectedExam || !selectedSubject) return;

    const students = (studentsData as any)?.data || [];
    const submittedMarks = (marksListData as any)?.data || [];
    const marksMap = new Map(submittedMarks.map((m: any) => [m.studentId?._id?.toString() || m.studentId?.toString(), m]));

    try {
      let successCount = 0;
      for (const student of students) {
        const studentIdStr = student._id.toString();
        const existingRecord = marksMap.get(studentIdStr);
        const local = localMarks[studentIdStr];

        // Skip if not modified locally and doesn't exist
        if (!local && !existingRecord) continue;

        const payload = {
          studentId: student._id,
          subjectId: selectedSubject,
          examId: selectedExam,
          maxMarks,
          marksObtained: local?.marksObtained !== undefined ? local.marksObtained : existingRecord?.marksObtained || 0,
          grade: local?.grade !== undefined ? local.grade : existingRecord?.grade || "",
          remarks: local?.remarks !== undefined ? local.remarks : existingRecord?.remarks || "",
        };

        await submitMarks(payload).unwrap();
        successCount++;
      }

      message.success(`Successfully recorded marks for ${successCount} students`);
      setLocalMarks({});
      refetchMarksList();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to submit marks");
    }
  };

  const examColumns = [
    { title: "Exam Name", dataIndex: "name", key: "name", render: (text: string) => <strong>{text}</strong> },
    { title: "Term", dataIndex: "term", key: "term", render: (text: string) => text || "-" },
    { title: "Class Scope", dataIndex: ["classId", "name"], key: "class", render: (text: string, r: any) => text || r.classId?.name || "-" },
    { title: "Start Date", dataIndex: "startDate", key: "startDate", render: (text: string) => text ? dayjs(text).format("YYYY-MM-DD") : "-" },
    { title: "End Date", dataIndex: "endDate", key: "endDate", render: (text: string) => text ? dayjs(text).format("YYYY-MM-DD") : "-" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditExam(record)} />
          <Popconfirm title="Delete this exam schedule?" onConfirm={() => handleDeleteExam(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const marksColumns = [
    { title: "Roll No", dataIndex: "rollNumber", key: "rollNumber", width: 90 },
    { title: "Student Name", dataIndex: ["user", "name"], key: "name", render: (text: string) => <strong>{text}</strong> },
    {
      title: "Marks Obtained",
      key: "obtained",
      width: 150,
      render: (_: any, record: any) => {
        const studentId = record._id.toString();
        const submittedMarks = (marksListData as any)?.data || [];
        const existingRecord = submittedMarks.find((m: any) => (m.studentId?._id || m.studentId) === record._id);
        const currentVal = localMarks[studentId]?.marksObtained !== undefined 
          ? localMarks[studentId].marksObtained 
          : existingRecord?.marksObtained || 0;

        return (
          <Input
            type="number"
            value={currentVal}
            min={0}
            max={maxMarks}
            style={{ width: "100px" }}
            onChange={(e) => handleMarkObtainedChange(studentId, parseFloat(e.target.value) || 0)}
          />
        );
      },
    },
    {
      title: "Max Marks",
      key: "max",
      width: 100,
      render: () => maxMarks,
    },
    {
      title: "Grade (Optional)",
      key: "grade",
      width: 120,
      render: (_: any, record: any) => {
        const studentId = record._id.toString();
        const submittedMarks = (marksListData as any)?.data || [];
        const existingRecord = submittedMarks.find((m: any) => (m.studentId?._id || m.studentId) === record._id);
        const currentVal = localMarks[studentId]?.grade !== undefined 
          ? localMarks[studentId].grade 
          : existingRecord?.grade || "";

        return (
          <Input
            value={currentVal}
            placeholder="A+, B"
            style={{ width: "80px" }}
            onChange={(e) => handleGradeChange(studentId, e.target.value)}
          />
        );
      },
    },
    {
      title: "Remarks",
      key: "remarks",
      render: (_: any, record: any) => {
        const studentId = record._id.toString();
        const submittedMarks = (marksListData as any)?.data || [];
        const existingRecord = submittedMarks.find((m: any) => (m.studentId?._id || m.studentId) === record._id);
        const currentVal = localMarks[studentId]?.remarks !== undefined 
          ? localMarks[studentId].remarks 
          : existingRecord?.remarks || "";

        return (
          <Input
            value={currentVal}
            placeholder="Good performance"
            onChange={(e) => handleRemarksChange(studentId, e.target.value)}
          />
        );
      },
    },
  ];

  return (
    <Card className="exams-page-card" style={{ borderRadius: "12px", background: "var(--card-bg)", borderColor: "var(--muted)", color: "var(--sider-text)" }}>
      <div className="setup-header" style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "var(--sider-text)" }}>Exams & Marks Entry</h2>
        <p style={{ color: "var(--placeholder)" }}>Manage examination terms, schedules, and record student marks</p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab={<span><CalendarOutlined /> Exam Schedules</span>} key="schedules">
          <div style={{ textAlign: "right", marginBottom: "16px" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditingExam(null); examForm.resetFields(); setExamModalVisible(true); }}
            >
              Add Exam Schedule
            </Button>
          </div>
          <CommonTable
            dataSource={examsList}
            columns={examColumns}
            rowKey="_id"
            loading={isLoadingExams}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>

        <TabPane tab={<span><FileDoneOutlined /> Marks Entry</span>} key="marks">
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
            <div style={{ minWidth: "200px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, color: "var(--sider-text)" }}>Select Exam Term</label>
              <Select
                placeholder="Choose Exam"
                options={examOptions}
                value={selectedExam}
                onChange={(val) => { setSelectedExam(val); setSelectedSubject(""); }}
                style={{ width: "100%" }}
                showSearch
              />
            </div>

            <div style={{ minWidth: "200px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, color: "var(--sider-text)" }}>Select Subject</label>
              <Select
                placeholder="Choose Subject"
                options={subjectsOptions}
                value={selectedSubject}
                onChange={setSelectedSubject}
                style={{ width: "100%" }}
                showSearch
                disabled={!selectedExam}
              />
            </div>

            <div style={{ minWidth: "100px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, color: "var(--sider-text)" }}>Max Marks</label>
              <Input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {selectedExam && selectedSubject ? (
            <>
              <CommonTable
                dataSource={(studentsData as any)?.data || []}
                columns={marksColumns}
                rowKey="_id"
                loading={isLoadingStudents}
                pagination={false}
                style={{ marginTop: "16px" }}
              />

              <div style={{ marginTop: "24px", textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<BookOutlined />}
                  onClick={handleMarksSubmit}
                  loading={isSubmittingMarks}
                  style={{ height: "40px", borderRadius: "6px", minWidth: "160px" }}
                  disabled={isLoadingStudents || !((studentsData as any)?.data?.length > 0)}
                >
                  Save Subject Marks
                </Button>
              </div>
            </>
          ) : (
            <Card style={{ textAlign: "center", padding: "40px 0", borderStyle: "dashed", background: "var(--transparent)", borderColor: "var(--muted)", color: "var(--sider-text)" }}>
              <BookOutlined style={{ fontSize: "48px", color: "var(--placeholder)", marginBottom: "16px" }} />
              <p style={{ fontSize: "16px", color: "var(--placeholder)" }}>
                Please select an Exam and a Subject to retrieve the student grading sheet.
              </p>
            </Card>
          )}
        </TabPane>
      </Tabs>

      {/* Exam Modal */}
      <Modal
        title={editingExam ? "Edit Exam Schedule" : "Schedule New Exam"}
        open={examModalVisible}
        onCancel={() => setExamModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={examForm} layout="vertical" onFinish={handleExamSubmit}>
          <Form.Item name="name" label="Exam Name" rules={[{ required: true, message: "Enter exam name (e.g. Final Semester Exams)" }]}>
            <Input placeholder="Greenwood Annual Exams" />
          </Form.Item>
          <Form.Item name="term" label="Exam Term (e.g. Term 1, Term 2)">
            <Input placeholder="First Term" />
          </Form.Item>
          <Form.Item name="classId" label="Target Class" rules={[{ required: true, message: "Select target class" }]}>
            <Select placeholder="Choose Class" options={classesOptions} showSearch />
          </Form.Item>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Form.Item name="startDate" label="Start Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="endDate" label="End Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <Form.Item style={{ textAlign: "right", marginTop: "16px", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setExamModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreatingExam || isUpdatingExam}>Save Schedule</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ExamsPage;
