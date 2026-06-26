import { useState, useRef } from 'react';
import { Modal, Form, Input, Button, notification } from 'antd';
import {
  CloudUploadOutlined,
  LinkOutlined, PaperClipOutlined, FileTextOutlined, PictureOutlined,
  PlayCircleOutlined, EnvironmentOutlined, ReadOutlined, DatabaseOutlined,
  BorderOutlined, FolderOutlined, PhoneOutlined, MessageOutlined,
  MailOutlined, UserOutlined, StarOutlined, CloudDownloadOutlined,
  DownloadOutlined, SelectOutlined, HomeOutlined, ShoppingCartOutlined,
  SettingOutlined, InfoCircleOutlined, EyeOutlined, IdcardOutlined,
  BarChartOutlined, CheckOutlined, DownOutlined,
} from '@ant-design/icons';
import './addAttachmentModal.scss';

const ICONS = [
  { key: 'link',       el: <LinkOutlined /> },
  { key: 'paperclip', el: <PaperClipOutlined /> },
  { key: 'file',      el: <FileTextOutlined /> },
  { key: 'picture',   el: <PictureOutlined /> },
  { key: 'play',      el: <PlayCircleOutlined /> },
  { key: 'location',  el: <EnvironmentOutlined /> },
  { key: 'book',      el: <ReadOutlined /> },
  { key: 'database',  el: <DatabaseOutlined /> },
  { key: 'border',    el: <BorderOutlined /> },
  { key: 'folder',    el: <FolderOutlined /> },
  { key: 'phone',     el: <PhoneOutlined /> },
  { key: 'message',   el: <MessageOutlined /> },
  { key: 'mail',      el: <MailOutlined /> },
  { key: 'user',      el: <UserOutlined /> },
  { key: 'star',      el: <StarOutlined /> },
  { key: 'clouddown', el: <CloudDownloadOutlined /> },
  { key: 'download',  el: <DownloadOutlined /> },
  { key: 'external',  el: <SelectOutlined /> },
  { key: 'home',      el: <HomeOutlined /> },
  { key: 'cart',      el: <ShoppingCartOutlined /> },
  { key: 'setting',   el: <SettingOutlined /> },
  { key: 'info',      el: <InfoCircleOutlined /> },
  { key: 'eye',       el: <EyeOutlined /> },
  { key: 'id',        el: <IdcardOutlined /> },
  { key: 'chart',     el: <BarChartOutlined /> },
];

const AddAttachmentModal = ({ open, onClose, onAdd }) => {
  const [form]         = Form.useForm();
  const fileInputRef   = useRef(null);
  const [file, setFile]             = useState(null);
  const [selectedIcon, setSelectedIcon] = useState('paperclip');
  const [gridOpen, setGridOpen]     = useState(false);

  const textVal  = Form.useWatch('text', form);
  const canAdd   = !!(file && textVal?.trim());
  const selectedEl = ICONS.find(i => i.key === selectedIcon)?.el;

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleBrowse = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const onFinishFailed = ({ errorFields }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    const unique = [...new Set(labels)];
    notification.error({
      message: 'Required Fields Missing',
      description: unique.join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  const handleFinish = (values) => {
    onAdd?.({ ...values, file, icon: selectedIcon });
    handleClose();
  };

  const handleClose = () => {
    form.resetFields();
    setFile(null);
    setSelectedIcon('paperclip');
    setGridOpen(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={580}
      centered
      className="aam-modal"
    >
      <h2 className="aam-title">Add Attachment</h2>

      <Form
        form={form}
        layout="vertical"
        className="aam-form"
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
      >
        {/* Drop zone */}
        <div
          className="aam-dropzone"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          <CloudUploadOutlined className="aam-drop-icon" />
          {file
            ? <p className="aam-file-name">{file.name}</p>
            : <p className="aam-drop-text">Drag and drop your files here</p>
          }
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleBrowse}
          />
          <Button
            type="primary"
            className="aam-browse-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            BROWSE
          </Button>
        </div>

        {/* File Icon & Text */}
        <Form.Item
          label="File Icon & Text"
          name="text"
          rules={[{ required: true, message: 'This field is required' }]}
        >
          <Input
            placeholder="Enter title text for this file..."
            size="large"
            prefix={
              <span
                className="aam-icon-prefix"
                onMouseDown={e => { e.preventDefault(); setGridOpen(v => !v); }}
              >
                <span className="aam-icon-current">{selectedEl}</span>
                <DownOutlined className={`aam-icon-chevron${gridOpen ? ' aam-icon-chevron--open' : ''}`} />
              </span>
            }
          />
        </Form.Item>

        {gridOpen && (
          <div className="aam-icon-grid">
            {ICONS.map(ic => (
              <button
                type="button"
                key={ic.key}
                className={`aam-icon-cell${selectedIcon === ic.key ? ' aam-icon-cell--active' : ''}`}
                onClick={() => { setSelectedIcon(ic.key); setGridOpen(false); }}
              >
                {ic.el}
              </button>
            ))}
          </div>
        )}

        <Button
          htmlType="submit"
          block
          size="large"
          className="aam-add-btn"
          icon={<CheckOutlined />}
          disabled={!canAdd}
        >
          ADD TO PAGE
        </Button>
      </Form>
    </Modal>
  );
};

export default AddAttachmentModal;
