import { useRef } from 'react';
import { Modal } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import './uploadImagesModal.scss';

interface Props {
  open:     boolean;
  onClose:  () => void;
  onUpload: (files: File[]) => void;
}

const UploadImagesModal = ({ open, onClose, onUpload }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f =>
      ['image/png', 'image/jpg', 'image/jpeg'].includes(f.type)
    );
    if (files.length) { onUpload(files); onClose(); }
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) { onUpload(files); onClose(); }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={540}
      centered
      className="upload-img-modal"
    >
      <h2 className="uim-title">Upload Images</h2>
      <p className="uim-subtitle">Add images to be displayed on your Page</p>

      <div
        className="uim-dropzone"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <FileImageOutlined className="uim-drop-icon" />
        <p className="uim-drop-text">
          Drag and drop your images here<br />
          <span className="uim-drop-hint">(.png, .jpg, or .jpeg)</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          multiple
          style={{ display: 'none' }}
          onChange={handleBrowse}
        />
        <button className="uim-browse-btn" onClick={() => inputRef.current?.click()}>
          BROWSE IMAGES
        </button>
      </div>
    </Modal>
  );
};

export default UploadImagesModal;
