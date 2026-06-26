import { useState, useRef, ReactElement } from 'react';
import { Modal, Input, Button, Dropdown } from 'antd';
import {
  PhoneOutlined, MessageOutlined, CalendarOutlined,
  FileTextOutlined, PaperClipOutlined, ClockCircleOutlined, FilePdfOutlined, EyeOutlined,
  PlusOutlined, DownOutlined, SaveOutlined, CheckOutlined, CloudUploadOutlined, DeleteOutlined,
} from '@ant-design/icons';
import FollowUpCalendar from '../followUpCalendar';
import { useAddLeadActivityMutation } from '../../services/leads';
import { useImageUploadMutation } from '../../services/imageService';
import './styles.scss';

interface Activity {
  key: string;
  icon: ReactElement;
  label: string;
  color: string;
}

interface TimeState {
  hour: number;
  minute: string;
  ampm: string;
}

interface ActivityFormProps {
  activity: Activity;
  onClose: () => void;
  clientName?: string;
  initialNote?: string;
  initialTime?: string;
  initialDateKey?: string;
  leadId?: string;
  onSuccess?: () => void;
}

interface AddActivityModalProps {
  open: boolean;
  onClose: () => void;
  item?: {
    id?: string;
    type?: string;
    name?: string;
    note?: string;
    time?: string;
    dateKey?: string;
  } | null;
  leadId?: string;
  onSuccess?: () => void;
}

const ACTIVITIES: Activity[] = [
  { key: 'phone_call',  icon: <PhoneOutlined />,     label: 'Phone Call',  color: 'linear-gradient(135deg,#9b7ee0,#7c5cbf)' },
  { key: 'message',     icon: <MessageOutlined />,   label: 'Message',     color: 'linear-gradient(135deg,#b07fe0,#8a4fc7)' },
  { key: 'meeting',     icon: <CalendarOutlined />,  label: 'Meeting',     color: 'linear-gradient(135deg,#6ab4f5,#3d8fd4)' },
  { key: 'note',        icon: <FileTextOutlined />,  label: 'Note',        color: 'linear-gradient(135deg,#a07ee0,#7040c0)' },
  { key: 'attachment',  icon: <PaperClipOutlined />, label: 'Attachment',  color: 'linear-gradient(135deg,#a07ee0,#7040c0)' },
];

const formatDateTime = (date: Date, time: TimeState): string => {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = isToday
    ? 'Today'
    : `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`;
  return `${dateStr}  ${time.hour}:${time.minute} ${time.ampm}`;
};

const parseTime = (timeStr?: string): TimeState | null => {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(' ');
  const ampm = parts[1] || 'AM';
  const [h, m] = (parts[0] || '12:00').split(':');
  return { hour: parseInt(h) || 12, minute: m || '00', ampm };
};

const ActivityForm = ({
  activity, onClose, clientName, initialNote, initialTime, initialDateKey, leadId, onSuccess
}: ActivityFormProps) => {
  const [notes, setNotes]     = useState<string>(initialNote || '');
  const [current, setCurrent] = useState<Activity>(activity);
  const [title, setTitle]     = useState<string>(activity.label);
  const [typeOpen, setTypeOpen]               = useState(false);
  const [datePickerOpen, setDatePickerOpen]   = useState(false);
  const [attachmentModal, setAttachmentModal] = useState(activity.key === 'attachment');
  const [uploadedUrls, setUploadedUrls]       = useState<string[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addLeadActivity, { isLoading: isSaving }] = useAddLeadActivityMutation();
  const [imageUpload] = useImageUploadMutation();

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (initialDateKey) {
      const d = new Date(initialDateKey);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const [selectedTime, setSelectedTime] = useState<TimeState>(() => {
    const parsed = parseTime(initialTime);
    if (parsed) return parsed;
    const now = new Date();
    const h   = now.getHours() % 12 || 12;
    const m   = now.getMinutes().toString().padStart(2, '0');
    return { hour: h, minute: m, ampm: now.getHours() >= 12 ? 'PM' : 'AM' };
  });

  const buildISODate = (): string => {
    const d = new Date(selectedDate);
    let h = selectedTime.hour;
    if (selectedTime.ampm === 'PM' && h !== 12) h += 12;
    if (selectedTime.ampm === 'AM' && h === 12) h = 0;
    d.setHours(h, parseInt(selectedTime.minute), 0, 0);
    return d.toISOString();
  };

  const handleFilesChange = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - uploadedUrls.length;
    if (remaining <= 0) return;
    const arr = Array.from(files).slice(0, remaining);
    if (arr.length === 0) return;
    setIsUploadingFiles(true);
    try {
      const fd = new FormData();
      arr.forEach((f: File) => fd.append('files', f));
      const res = await (imageUpload as any)(fd).unwrap();
      const urls = ((res?.files || []) as { url: string }[]).map(f => f.url).filter(Boolean);
      setUploadedUrls(prev => [...prev, ...urls].slice(0, 5));
    } catch (e) {
      console.error('File upload failed', e);
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const handleSave = async () => {
    if (!leadId) return;
    try {
      await (addLeadActivity as any)({
        id: leadId,
        type: current.key,
        details: notes,
        activityDate: buildISODate(),
        ...(uploadedUrls.length > 0 && { attachments: uploadedUrls }),
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error('Save activity failed', e);
    }
  };

  const handleTypeChange = (act: Activity) => {
    setCurrent(act);
    setTitle(act.label);
    setTypeOpen(false);
  };

  const typeDropdown = (
    <div className="af-type-dropdown">
      {ACTIVITIES.map(a => (
        <div
          key={a.key}
          className={`af-type-item${current.key === a.key ? ' af-type-item--active' : ''}`}
          onClick={() => handleTypeChange(a)}
        >
          <div className="af-type-item-icon" style={{ background: a.color }}>{a.icon}</div>
          <span className="af-type-item-label">{a.label}</span>
          {current.key === a.key && <CheckOutlined className="af-type-item-check" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="af-wrap">
      {clientName && (
        <p className="af-client-subtitle">
          With <strong className="af-client-name">{clientName}</strong>
        </p>
      )}

      <div className="af-type-row">
        <Dropdown
          popupRender={() => typeDropdown}
          trigger={['click']}
          open={typeOpen}
          onOpenChange={setTypeOpen}
          placement="bottomLeft"
          align={{ offset: [-14, 8] }}
          getPopupContainer={trigger => trigger.parentElement ?? document.body}
        >
          <div className={`af-type-trigger${typeOpen ? ' af-type-trigger--open' : ''}`}>
            <div className="af-icon-circle" style={{ background: current.color }}>
              {current.icon}
            </div>
            <DownOutlined className="af-type-chevron" />
          </div>
        </Dropdown>

        <Input
          className="af-title-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          variant="borderless"
        />
      </div>

      <Input.TextArea
        className="af-textarea"
        placeholder="Add optional details here..."
        style={{ height: 200, resize: 'none' }}
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />

      <div className="af-datetime-wrap">
        <div className="af-datetime-row" onClick={() => setDatePickerOpen(o => !o)}>
          <ClockCircleOutlined className="af-clock" />
          <span className="af-datetime-text">{formatDateTime(selectedDate, selectedTime)}</span>
          <DownOutlined className="af-datetime-chevron" />
        </div>
        {datePickerOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 999 }}
              onClick={() => setDatePickerOpen(false)}
            />
            <div className="af-calendar-popup">
              <FollowUpCalendar
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
                onApply={() => setDatePickerOpen(false)}
                onClose={() => setDatePickerOpen(false)}
                compact
              />
            </div>
          </>
        )}
      </div>

      <div className="af-attachment-row" onClick={() => setAttachmentModal(true)}>
        <PlusOutlined />
        <PaperClipOutlined />
        <span>Add Attachment</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={e => { handleFilesChange(e.target.files); e.target.value = ''; }}
      />

      <Modal
        open={attachmentModal}
        onCancel={() => setAttachmentModal(false)}
        footer={null}
        closable
        width={580}
        styles={{
          content: { background: 'var(--card-bg)', borderRadius: 12, padding: '32px 28px 28px' },
          body: { padding: 0 },
          mask: { backdropFilter: 'blur(2px)' },
        } as any}
      >
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px', color: 'var(--sider-text)' }}>Select File</h2>
        <p style={{ fontSize: 14, color: 'var(--placeholder)', marginBottom: 20 }}>You can attach up to 5 files per activity</p>
        <div
          className="af-dropzone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('af-dropzone--drag'); }}
          onDragLeave={e => e.currentTarget.classList.remove('af-dropzone--drag')}
          onDrop={e => {
            e.preventDefault();
            e.currentTarget.classList.remove('af-dropzone--drag');
            handleFilesChange(e.dataTransfer.files);
          }}
        >
          <CloudUploadOutlined className="af-dropzone-icon" />
          <p className="af-dropzone-text">Drag and drop your files here</p>
          <span className="af-dropzone-browse">BROWSE</span>
        </div>

        {isUploadingFiles && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--placeholder)', fontSize: 13 }}>
            <CloudUploadOutlined style={{ fontSize: 16 }} />
            <span>Uploading...</span>
          </div>
        )}

        {uploadedUrls.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {uploadedUrls.map((url, i) => {
              const fileName = url.split('/').pop() ?? '';
              const isPdf    = fileName.toLowerCase().endsWith('.pdf');
              const isImage  = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  {isPdf ? (
                    <div style={{ width: 44, height: 44, borderRadius: 6, background: '#fff1f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FilePdfOutlined style={{ fontSize: 22, color: '#ff4d4f' }} />
                    </div>
                  ) : isImage ? (
                    <img src={url} alt={fileName} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 6, background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <PaperClipOutlined style={{ fontSize: 20, color: 'var(--placeholder)' }} />
                    </div>
                  )}
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--sider-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
                  <EyeOutlined style={{ fontSize: 15, color: 'var(--placeholder)', cursor: 'pointer' }} onClick={() => window.open(url, '_blank')} />
                  <DeleteOutlined style={{ fontSize: 15, color: '#ef4444', cursor: 'pointer' }} onClick={() => setUploadedUrls(prev => prev.filter((_, j) => j !== i))} />
                </div>
              );
            })}
          </div>
        )}

        <Button
          block
          type="primary"
          style={{ marginTop: 16, height: 44, background: '#17A2B8', borderColor: '#17A2B8', borderRadius: 8 }}
          onClick={() => setAttachmentModal(false)}
        >
          Done
        </Button>
      </Modal>

      <Button
        className="af-save-btn"
        block
        icon={<SaveOutlined />}
        loading={isSaving || isUploadingFiles}
        disabled={!notes.trim() && uploadedUrls.length === 0}
        onClick={handleSave}
      >
        SAVE
      </Button>
    </div>
  );
};

const AddActivityModal = ({ open, onClose, item, leadId, onSuccess }: AddActivityModalProps) => {
  const [selected, setSelected] = useState<Activity | null>(null);

  const editActivity = item
    ? ACTIVITIES.find(a => a.key === item.type) || ACTIVITIES[0]
    : null;

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const activeActivity = selected || editActivity;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable
      width={activeActivity ? 640 : 700}
      styles={{
        content: { background: 'var(--card-bg)', borderRadius: 12, padding: activeActivity ? '28px 28px 24px' : '32px 32px 28px' },
        body: { padding: 0 },
        mask: { backdropFilter: 'blur(2px)' },
      } as any}
      afterClose={() => setSelected(null)}
    >
      <h2 className="aa-title">{item ? 'Activity' : 'Add Activity'}</h2>

      {activeActivity ? (
        <ActivityForm
          key={item?.id ?? 'new'}
          activity={activeActivity}
          onClose={handleClose}
          clientName={item?.name}
          initialNote={item?.note || ''}
          initialTime={item?.time}
          initialDateKey={item?.dateKey}
          leadId={leadId}
          onSuccess={onSuccess}
        />
      ) : (
        <>
          <p className="aa-subtitle">Please select the type of activity you want to add</p>
          <div className="aa-grid">
            {ACTIVITIES.map(act => (
              <div key={act.key} className="aa-card" onClick={() => setSelected(act)}>
                <div className="aa-card-icon" style={{ background: act.color }}>{act.icon}</div>
                <span className="aa-card-label">{act.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};

export default AddActivityModal;
