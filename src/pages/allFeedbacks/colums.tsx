import { Select, Tag } from "antd";
import { renderEmojiCell } from "./emojiRender";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface Employee {
  _id?:  string;
  name?: string;
}

export interface FeedbackRow {
  key:           string | number;
  ticketId:      string;
  department:    string;
  branch:        string;
  customerName:  string;
  mobileNumber:  string;
  email:         string;
  feedback:      string;
  sentiment:     string;
  images:        string[];
  staffBehavior: string | number;
  gymHygiene:    string | number;
  dateTime:      string;
  status:        string;
  assignToId?:   string;
  assignToName?: string;
}

/* ─── Columns ────────────────────────────────────────────────────────── */

export const getColumns = (
  onViewFeedback:   (row: FeedbackRow) => void,
  onViewImages:     (imgs: string[], idx: number) => void,
  employees:        Employee[] = [],
  onAssignTo?:      (selectedValue: string, feedbackId: string | number) => void,
  onStatusChange?:  (status: string, feedbackId: string | number) => void,
) => [
  {
    title:     "S.NO",
    dataIndex: "serial",
    key:       "serial",
    align:     "center" as const,
    render:    (_: unknown, __: unknown, idx: number) => idx + 1,
  },
  { title: "Ticket Id",      dataIndex: "ticketId",      key: "ticketId"      },
  { title: "Department",     dataIndex: "department",    key: "department"    },
  { title: "Branch",         dataIndex: "branch",        key: "branch"        },
  { title: "Customer Name",  dataIndex: "customerName",  key: "customerName"  },
  { title: "Mobile Number",  dataIndex: "mobileNumber",  key: "mobileNumber"  },
  { title: "Email",          dataIndex: "email",         key: "email"         },
  {
    title:     "Feedback",
    dataIndex: "feedback",
    key:       "feedback",
    render:    (_: string, row: FeedbackRow) => (
      <Tag color="blue" style={{ cursor: "pointer" }} onClick={() => onViewFeedback(row)}>
        View
      </Tag>
    ),
  },
  {
    title:     "Images",
    dataIndex: "images",
    key:       "images",
    render:    (imgs: string[]) =>
      imgs?.length ? (
        <Tag color="blue" style={{ cursor: "pointer" }} onClick={() => onViewImages(imgs, 0)}>
          View
        </Tag>
      ) : "-",
  },
  {
    title:     "Staff Behavior",
    dataIndex: "staffBehavior",
    key:       "staffBehavior",
    render:    (val: string | number) => renderEmojiCell(val, 'staffBehavior'),
  },
  {
    title:     "Gym Hygiene",
    dataIndex: "gymHygiene",
    key:       "gymHygiene",
    render:    (val: string | number) => renderEmojiCell(val, 'gymHygiene'),
  },
  { title: "Date & Time", dataIndex: "dateTime", key: "dateTime" },
  {
    title:     "Status",
    dataIndex: "status",
    key:       "status",
    render:    (status: string, row: FeedbackRow) => (
      <Select
        value={status}
        style={{ minWidth: 120 }}
        options={[
          { value: "pending",    label: "Pending"     },
          { value: "in_process", label: "In Process"  },
          { value: "completed",  label: "Completed"   },
        ]}
        onChange={value => onStatusChange?.(value, row.key)}
      />
    ),
  },
  {
    title:     "Assign To",
    dataIndex: "assignToId",
    key:       "assignTo",
    render:    (assignToId: string | undefined, row: FeedbackRow) => {
      const employeeOptions = employees.map(emp => ({ value: emp._id, label: emp.name }));
      const assigned        = employees.find(emp => emp._id === assignToId);
      return (
        <Select
          value={assigned?._id}
          style={{ minWidth: 140 }}
          placeholder="Assign user"
          options={employeeOptions}
          onChange={(selectedValue: string) => {
            if (onAssignTo && selectedValue) onAssignTo(selectedValue, row.key);
          }}
          disabled={employees.length === 0}
          showSearch
          allowClear
        />
      );
    },
  },
];
