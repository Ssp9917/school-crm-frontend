import { useState } from 'react';
import { Modal, Input, Select, Button } from 'antd';
import {
  PhoneOutlined, MessageOutlined, CalendarOutlined, FileTextOutlined,
  PaperClipOutlined, SendOutlined, WhatsAppOutlined,
  ClockCircleOutlined, PlusOutlined, SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './viewEditActivityModal.scss';

const TYPE_CONFIG = {
  phone:        { color: '#8B5CF6', bg: 'rgba(139,92,246,0.18)',  icon: <PhoneOutlined />,     label: 'Phone Call' },
  message:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.18)',  icon: <MessageOutlined />,   label: 'Message' },
  meeting:      { color: '#10B981', bg: 'rgba(16,185,129,0.18)',  icon: <CalendarOutlined />,  label: 'Meeting' },
  note:         { color: '#F59E0B', bg: 'rgba(245,158,11,0.18)',  icon: <FileTextOutlined />,  label: 'Note' },
  content_msg:  { color: '#17A2B8', bg: 'rgba(23,162,184,0.18)', icon: <SendOutlined />,       label: 'Content: Messages' },
  content_file: { color: '#17A2B8', bg: 'rgba(23,162,184,0.18)', icon: <PaperClipOutlined />, label: 'Content: Files' },
  content_page: { color: '#17A2B8', bg: 'rgba(23,162,184,0.18)', icon: <FileTextOutlined />,  label: 'Content: Pages' },
  whatsapp:     { color: '#25D366', bg: 'rgba(37,211,102,0.12)',  icon: <WhatsAppOutlined />,  label: 'WhatsApp Sequence' },
};

const TYPE_OPTIONS = Object.entries(TYPE_CONFIG).map(([key, val]) => ({
  value: key,
  label: val.label,
  color: val.color,
  bg: val.bg,
  icon: val.icon,
}));

const ViewEditActivityModal = ({ open, onClose, item }) => {
  const [actType, setActType] = useState(item?.type || 'phone');
  const [note, setNote]       = useState(item?.note || '');

  const cfg = TYPE_CONFIG[actType] || TYPE_CONFIG.phone;

  const formatDatetime = () => {
    if (!item?.time) return dayjs().format('ddd MMM D, hh:mm A');
    const parsed = dayjs(`${item.dateKey || dayjs().format('YYYY-MM-DD')} ${item.time}`, 'YYYY-MM-DD hh:mm A');
    if (item?.isToday || item?.dateKey === dayjs().format('YYYY-MM-DD')) {
      return `Today ${item.time}`;
    }
    return parsed.format('ddd MMM D, hh:mm A');
  };

  const handleClose = () => {
    setActType(item?.type || 'phone');
    setNote(item?.note || '');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      centered
      className="vea-modal"
    >
      <div className="vea-header">
        <h2 className="vea-title">Activity</h2>
        <p className="vea-subtitle">
          With <strong className="vea-client-name">{item?.name}</strong>
        </p>
      </div>

      {/* Activity type selector */}
      <div className="vea-type-row">
        <span className="vea-type-icon" style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.icon}
        </span>
        <Select
          value={actType}
          onChange={setActType}
          className="vea-type-select"
          variant="borderless"
          options={TYPE_OPTIONS}
          optionRender={(opt) => (
            <div className="vea-opt-item">
              <span className="vea-opt-icon" style={{ background: opt.data.bg, color: opt.data.color }}>
                {opt.data.icon}
              </span>
              {opt.data.label}
            </div>
          )}
          labelRender={({ value }) => (
            <span className="vea-type-label">{TYPE_CONFIG[value]?.label}</span>
          )}
        />
      </div>

      {/* Notes */}
      <Input.TextArea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add a note..."
        autoSize={{ minRows: 5, maxRows: 8 }}
        className="vea-notes"
      />

      {/* Date / time */}
      <div className="vea-datetime-row">
        <ClockCircleOutlined className="vea-dt-icon" />
        <span className="vea-dt-label">{formatDatetime()}</span>
        <span className="vea-dt-arrow">▾</span>
      </div>

      {/* Add Attachment */}
      <div className="vea-attach-row">
        <PlusOutlined className="vea-attach-plus" />
        <PaperClipOutlined className="vea-attach-clip" />
        <span className="vea-attach-label">Add Attachment</span>
      </div>

      <Button
        block
        size="large"
        className="vea-save-btn"
        icon={<SaveOutlined />}
        onClick={handleClose}
      >
        SAVE
      </Button>
    </Modal>
  );
};

export default ViewEditActivityModal;