import { useState, useRef } from 'react';
import { Modal, Input, Button } from 'antd';
import { CloudUploadOutlined, CheckOutlined } from '@ant-design/icons';
import './uploadFileModal.scss';

interface Props {
  open:    boolean;
  onClose: () => void;
}

const UploadFileModal = ({ open, onClose }: Props) => {
  const [title,    setTitle]    = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
      centered
      className="upload-file-modal"
    >
      <h2 className="ufm-title">Upload New File</h2>

      <div
        className={`ufm-dropzone${dragOver ? ' ufm-dropzone--over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); }}
      >
        <CloudUploadOutlined className="ufm-cloud-icon" />
        <p className="ufm-drop-text">Drag and drop a PDF file here</p>
        <Button className="ufm-browse-btn" onClick={() => inputRef.current?.click()}>
          BROWSE
        </Button>
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} />
      </div>

      <div className="ufm-field">
        <div className="ufm-field-header">
          <label className="ufm-label">File Title*</label>
          <span className="ufm-required">*Required</span>
        </div>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. ACME Residences Brochure"
          size="large"
          className="ufm-input"
        />
      </div>

      <Button
        block
        size="large"
        className="ufm-create-btn"
        icon={<CheckOutlined />}
        disabled={!title.trim()}
      >
        CREATE FILE
      </Button>
    </Modal>
  );
};

export default UploadFileModal;
