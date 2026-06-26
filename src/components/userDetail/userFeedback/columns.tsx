import { Tag } from "antd";
import { renderEmojiCell } from "./emojiRender";

interface FeedbackRow {
  feedback: string;
  images: string[];
}

const getColumns = (
  onViewFeedback: (row: FeedbackRow) => void,
  onViewImages:   (imgs: string[], idx: number) => void,
) => [
  {
    title: 'S.NO',
    dataIndex: 'serial',
    key: 'serial',
    align: 'center' as const,
    render: (_: unknown, __: unknown, idx: number) => idx + 1,
  },
  { title: 'Ticket Id',      dataIndex: 'ticketId',      key: 'ticketId'      },
  { title: 'Department',     dataIndex: 'department',     key: 'department'    },
  { title: 'Branch',         dataIndex: 'branch',         key: 'branch'        },
  { title: 'Customer Name',  dataIndex: 'customerName',   key: 'customerName'  },
  { title: 'Mobile Number',  dataIndex: 'mobileNumber',   key: 'mobileNumber'  },
  { title: 'Email',          dataIndex: 'email',          key: 'email'         },
  {
    title: 'Feedback',
    dataIndex: 'feedback',
    key: 'feedback',
    render: (_: unknown, row: FeedbackRow) => (
      <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => onViewFeedback(row)}>
        View
      </Tag>
    ),
  },
  {
    title: 'Images',
    dataIndex: 'images',
    key: 'images',
    render: (imgs: string[]) =>
      imgs?.length ? (
        <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => onViewImages(imgs, 0)}>
          View
        </Tag>
      ) : '-',
  },
  { title: 'Staff Behavior', dataIndex: 'staffBehavior', key: 'staffBehavior', render: (val: string) => renderEmojiCell(val, 'staffBehavior') },
  { title: 'Gym Hygiene',    dataIndex: 'gymHygiene',    key: 'gymHygiene',    render: (val: string) => renderEmojiCell(val, 'gymHygiene')    },
  { title: 'Assign To',      dataIndex: 'assignToName',  key: 'assignToName',  render: (name: string) => name || '-' },
  { title: 'Date & Time',    dataIndex: 'dateTime',      key: 'dateTime'       },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      let color = 'default';
      let label = status;
      if (status === 'pending')                                   { color = 'orange'; label = 'Pending';    }
      else if (status === 'in_process' || status === 'in_progress') { color = 'blue';   label = 'In Process'; }
      else if (status === 'completed')                            { color = 'green';  label = 'Completed';  }
      return <Tag color={color}>{label}</Tag>;
    },
  },
];

export default getColumns;
