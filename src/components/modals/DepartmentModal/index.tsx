import { useState } from "react";
import { Modal, Input, Button, Switch, message } from "antd";
import CommonTable from "../../commonTable";
import { useAddDepartmentMutation, useGetDepartmentsQuery, useToggleDepartmentStatusMutation } from "../../../services/departments";
import "./styles.scss";

interface Department {
  _id: string;
  name: string;
  status: string;
}

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
}

const DepartmentModal = ({ open, onClose }: DepartmentModalProps) => {
  const [deptName, setDeptName] = useState("");

  const [addDepartment,          { isLoading }]                   = useAddDepartmentMutation();
  const { data, isLoading: loadingDepartments, refetch }          = useGetDepartmentsQuery(undefined);
  const [toggleDepartmentStatus, { isLoading: isToggling }]       = useToggleDepartmentStatusMutation();

  const handleToggle = async (id: string) => {
    try {
      await (toggleDepartmentStatus as any)({ id }).unwrap();
      refetch();
    } catch { /* silent */ }
  };

  const handleAdd = async () => {
    if (!deptName.trim()) {
      message.warning("Please enter department name");
      return;
    }
    try {
      await (addDepartment as any)({ name: deptName.trim() }).unwrap();
      setDeptName("");
      refetch();
    } catch { /* silent */ }
  };

  const columns = [
    {
      title: "Department",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <span>{status}</span>,
    },
    {
      title: "Action",
      dataIndex: "enabled",
      key: "action",
      align: "center" as const,
      render: (enabled: boolean, record: Department & { enabled: boolean }) => (
        <Switch
          checked={enabled}
          loading={isToggling}
          onChange={() => handleToggle(record._id)}
        />
      ),
    },
  ];

  const tableData = Array.isArray((data as any)?.data)
    ? (data as any).data.map((d: Department, i: number) => ({
        ...d,
        key:     d._id || i,
        status:  d.status === 'active' ? 'Enabled' : 'Disabled',
        enabled: d.status === 'active',
      }))
    : [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      closeIcon={<span style={{ fontSize: 28, fontWeight: 600 }}>&times;</span>}
    >
      <div className="department-modal-content">
        <div className="department-modal-title">Manage Departments</div>

        <div className="department-modal-input-row">
          <Input
            value={deptName}
            onChange={e => setDeptName(e.target.value)}
            placeholder="Create Department"
            className="department-modal-input"
            onPressEnter={handleAdd}
          />
          <Button
            type="primary"
            className="department-modal-add-btn"
            onClick={handleAdd}
            loading={isLoading}
          >
            +
          </Button>
        </div>

        <hr style={{ borderWidth: '0.1px', marginBottom: '15px' }} />

        <div className="department-modal-section-title">Existing Departments</div>

        <CommonTable
          columns={columns}
          dataSource={tableData}
          loading={loadingDepartments}
          pagination={false}
          bordered={false}
          className="department-modal-table"
          rowClassName={() => "department-row"}
        />
      </div>
    </Modal>
  );
};

export default DepartmentModal;
