import { Button, Dropdown, Switch, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { DirectorDetailPageRoute, UserDetailAttendanceRoute } from "../../routes/routepath";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface DirectorRecord {
  _id?:         string;
  id?:          string;
  name?:        string;
  email?:       string;
  number?:      string;
  phoneNumber?: string;
  status?:      string;
  branches?:    { name?: string }[];
  branchIds?:   { name?: string }[];
  branch?:      { name?: string };
  branchName?:  string;
  role?:        { name?: string };
  ownedBy?:     string;
}

/* ─── Columns ────────────────────────────────────────────────────────── */

export const getColumns = (
  handleView:           (record: DirectorRecord) => void,
  handleEdit:           (record: DirectorRecord) => void,
  handleDelete:         (record: DirectorRecord) => void,
  handleChangePassword: (record: DirectorRecord) => void,
  handleStatusToggle:   (record: DirectorRecord, newStatus: boolean) => void,
  updatingStatus:       boolean,
  canEdit           = true,
  canDelete         = true,
  canChangePassword = true,
  canStatusToggle   = true,
  canView           = true,
) => {
  const hasAnyAction = canEdit || canDelete || canChangePassword;
  return [
    {
      title:     "Name",
      dataIndex: "name",
      key:       "name",
      width:     150,
      render:    (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title:     "Email",
      dataIndex: "email",
      key:       "email",
      width:     200,
    },
    {
      title:     "Phone Number",
      dataIndex: "phoneNumber",
      key:       "phoneNumber",
      width:     130,
    },
    {
      title:     "Branch Name",
      dataIndex: "branches",
      key:       "branchName",
      width:     150,
      render:    (branches: { name?: string }[]) => {
        if (Array.isArray(branches) && branches.length > 0) {
          const branchNames = branches.map(b => b.name).join(", ");
          if (branches.length === 1) return branches[0].name;
          return (
            <Tooltip title={branchNames} placement="topLeft">
              <span style={{ cursor: "pointer" }}>
                {branches[0].name} +{branches.length - 1}
              </span>
            </Tooltip>
          );
        }
        return "-";
      },
    },
    {
      title:     "Designation",
      dataIndex: "ownedBy",
      key:       "ownedBy",
      width:     150,
      render:    (ownedBy: string) => ownedBy || "-",
    },
    ...(canStatusToggle ? [{
      title:     "Status",
      dataIndex: "status",
      key:       "status",
      width:     120,
      align:     "center" as const,
      render:    (status: string, record: DirectorRecord) => (
        <Switch
          checked={status === "ACTIVE"}
          onChange={(checked: boolean) => handleStatusToggle(record, checked)}
          loading={updatingStatus}
          size="small"
          checkedChildren="On"
          unCheckedChildren="Off"
          style={{ minWidth: 40, width: 40 }}
        />
      ),
    }] : []),
    ...(canView ? [{
      title:  "View",
      key:    "view",
      width:  80,
      align:  "center" as const,
      render: (_: unknown, record: DirectorRecord) => (
        <Link to={DirectorDetailPageRoute + `/${record._id}/${UserDetailAttendanceRoute}`}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)} />
        </Link>
      ),
    }] : []),
    ...(hasAnyAction ? [{
      title:  "Actions",
      key:    "actions",
      width:  80,
      align:  "center" as const,
      render: (_: unknown, record: DirectorRecord) => {
        const menuItems = [
          ...(canEdit ? [{
            key:     "edit",
            label:   "Edit",
            icon:    <EditOutlined />,
            onClick: () => handleEdit(record),
          }] : []),
          ...(canChangePassword ? [{
            key:     "change-password",
            label:   "Change Password",
            icon:    <HomeOutlined />,
            onClick: () => handleChangePassword(record),
          }] : []),
          ...(canDelete ? [{
            key:     "delete",
            label:   "Delete",
            icon:    <DeleteOutlined />,
            danger:  true,
            onClick: () => handleDelete(record),
          }] : []),
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        );
      },
    }] : []),
  ];
};
