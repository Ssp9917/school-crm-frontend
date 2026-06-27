import { useState, useMemo } from "react";
import { Card, DatePicker, Select, Button, Radio, Input, Space, message } from "antd";
import { CheckOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetClassesQuery } from "../../services/class";
import { useGetSectionsQuery } from "../../services/section";
import { useGetStudentAttendanceQuery, useSubmitStudentAttendanceMutation } from "../../services/studentAttendance";
import CommonTable from "../../components/commonTable";

const StudentAttendance = () => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  
  // Attendance local modifications state
  const [localAttendance, setLocalAttendance] = useState<Record<string, { status: string; remarks: string }>>({});

  // Query setups
  const { data: classesData } = useGetClassesQuery({});
  const { data: sectionsData } = useGetSectionsQuery({});

  const classesOptions = useMemo(() => {
    const list = (classesData as any)?.data || [];
    return list.map((c: any) => ({ label: c.name, value: c._id }));
  }, [classesData]);

  const sectionsOptions = useMemo(() => {
    const list = (sectionsData as any)?.data || [];
    return list
      .filter((s: any) => !selectedClass || s.classId?._id === selectedClass || s.classId === selectedClass)
      .map((s: any) => ({ label: s.name, value: s._id }));
  }, [sectionsData, selectedClass]);

  const shouldFetch = selectedDate && selectedClass && selectedSection;
  const { data: attendanceData, isLoading, refetch } = useGetStudentAttendanceQuery(
    { date: selectedDate, classId: selectedClass, sectionId: selectedSection },
    { skip: !shouldFetch }
  );

  const [submitAttendance, { isLoading: isSubmitting }] = useSubmitStudentAttendanceMutation();

  const handleStatusChange = (studentId: string, status: string) => {
    setLocalAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setLocalAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!shouldFetch) return;

    // Convert local modified state + defaults from API to a submission payload
    const studentsList = attendanceData?.data || [];
    const attendanceList = studentsList.map((item: any) => {
      const studentId = item.studentId;
      const modified = localAttendance[studentId];
      
      return {
        studentId,
        status: modified?.status || item.attendance?.status || "Present",
        remarks: modified?.remarks !== undefined ? modified.remarks : item.attendance?.remarks || "",
      };
    });

    try {
      await submitAttendance({
        date: selectedDate,
        classId: selectedClass,
        sectionId: selectedSection,
        attendanceList,
      }).unwrap();
      message.success("Attendance updated successfully");
      setLocalAttendance({});
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed to submit attendance");
    }
  };

  const columns = [
    {
      title: "Roll No",
      dataIndex: ["studentDetails", "rollNumber"],
      key: "rollNumber",
      width: 100,
      render: (text: string) => text || "-",
    },
    {
      title: "Student Name",
      dataIndex: ["studentDetails", "user", "name"],
      key: "name",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Attendance Status",
      key: "status",
      width: 320,
      render: (_: any, record: any) => {
        const studentId = record.studentId;
        const currentStatus = localAttendance[studentId]?.status || record.attendance?.status || "Present";
        
        return (
          <Radio.Group
            value={currentStatus}
            onChange={(e) => handleStatusChange(studentId, e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="Present" style={{ backgroundColor: currentStatus === "Present" ? "#52c41a" : "", borderColor: currentStatus === "Present" ? "#52c41a" : "" }}>
              Present
            </Radio.Button>
            <Radio.Button value="Absent" style={{ backgroundColor: currentStatus === "Absent" ? "#f5222d" : "", borderColor: currentStatus === "Absent" ? "#f5222d" : "" }}>
              Absent
            </Radio.Button>
            <Radio.Button value="Late" style={{ backgroundColor: currentStatus === "Late" ? "#faad14" : "", borderColor: currentStatus === "Late" ? "#faad14" : "" }}>
              Late
            </Radio.Button>
            <Radio.Button value="Leave" style={{ backgroundColor: currentStatus === "Leave" ? "#1890ff" : "", borderColor: currentStatus === "Leave" ? "#1890ff" : "" }}>
              Leave
            </Radio.Button>
          </Radio.Group>
        );
      },
    },
    {
      title: "Remarks / Notes",
      key: "remarks",
      render: (_: any, record: any) => {
        const studentId = record.studentId;
        const currentRemarks = localAttendance[studentId]?.remarks !== undefined 
          ? localAttendance[studentId].remarks 
          : record.attendance?.remarks || "";

        return (
          <Input
            value={currentRemarks}
            placeholder="Add remarks (e.g. sick leave)"
            onChange={(e) => handleRemarksChange(studentId, e.target.value)}
          />
        );
      },
    },
  ];

  return (
    <Card className="student-attendance-card" style={{ borderRadius: "12px", background: "var(--card-bg)", borderColor: "var(--muted)", color: "var(--sider-text)" }}>
      <div className="setup-header" style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "var(--sider-text)" }}>Daily Student Attendance</h2>
        <p style={{ color: "var(--placeholder)" }}>Select class, section, and date to mark or update attendance</p>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div style={{ minWidth: "150px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, color: "var(--sider-text)" }}>Select Class</label>
          <Select
            placeholder="Choose Class"
            options={classesOptions}
            value={selectedClass}
            onChange={(val) => { setSelectedClass(val); setSelectedSection(""); }}
            style={{ width: "100%" }}
            showSearch
          />
        </div>

        <div style={{ minWidth: "150px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, color: "var(--sider-text)" }}>Select Section</label>
          <Select
            placeholder="Choose Section"
            options={sectionsOptions}
            value={selectedSection}
            onChange={setSelectedSection}
            style={{ width: "100%" }}
            showSearch
            disabled={!selectedClass}
          />
        </div>

        <div style={{ minWidth: "180px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 500, color: "var(--sider-text)" }}>Select Date</label>
          <DatePicker
            value={selectedDate ? dayjs(selectedDate) : null}
            onChange={(date) => setSelectedDate(date ? date.format("YYYY-MM-DD") : "")}
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            allowClear={false}
          />
        </div>
      </div>

      {shouldFetch ? (
        <>
          <CommonTable
            dataSource={attendanceData?.data || []}
            columns={columns}
            rowKey="studentId"
            loading={isLoading}
            pagination={false}
            style={{ marginTop: "16px" }}
          />

          <div style={{ marginTop: "24px", textAlign: "right" }}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              loading={isSubmitting}
              style={{ height: "40px", borderRadius: "6px", minWidth: "160px" }}
              disabled={isLoading || !(attendanceData?.data?.length > 0)}
            >
              Submit Attendance
            </Button>
          </div>
        </>
      ) : (
        <Card style={{ textAlign: "center", padding: "40px 0", borderStyle: "dashed", background: "var(--transparent)", borderColor: "var(--muted)", color: "var(--sider-text)" }}>
          <CalendarOutlined style={{ fontSize: "48px", color: "var(--placeholder)", marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", color: "var(--placeholder)" }}>
            Please select Class, Section, and Date to view and mark student attendance.
          </p>
        </Card>
      )}
    </Card>
  );
};

export default StudentAttendance;
