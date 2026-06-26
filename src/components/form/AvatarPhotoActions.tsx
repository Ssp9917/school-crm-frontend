import { useState } from 'react';
import { Image, Spin } from 'antd';
import { EyeOutlined, CameraOutlined } from '@ant-design/icons';
import ProfilePhotoUploader from './ProfilePhotoUploader';
import './avatarPhotoActions.scss';

interface AvatarPhotoActionsProps {
  photoUrl: string;
  canEdit?: boolean;
  onUploaded: (url: string) => void | Promise<void>;
}

/**
 * Renders inside an `.avatar-wrap` (position: relative) element.
 * Hover overlay with photo preview and, when permitted, the same
 * drawer + crop upload flow used by ImagePicker.
 */
const AvatarPhotoActions = ({ photoUrl, canEdit = false, onUploaded }: AvatarPhotoActionsProps) => {
  const [previewOpen,  setPreviewOpen]  = useState(false);
  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [uploading,    setUploading]    = useState(false);

  return (
    <>
      {uploading ? (
        <div className="avatar-overlay loading">
          <Spin size="small" />
        </div>
      ) : (
        <div className="avatar-overlay actions">
          <button
            type="button"
            className="avatar-action-btn"
            title="Preview Photo"
            onClick={() => setPreviewOpen(true)}
          >
            <EyeOutlined />
          </button>
          {canEdit && (
            <button
              type="button"
              className="avatar-action-btn"
              title="Change Photo"
              onClick={() => setPickerOpen(true)}
            >
              <CameraOutlined />
            </button>
          )}
        </div>
      )}

      <Image
        style={{ display: 'none' }}
        src={photoUrl}
        preview={{
          visible: previewOpen,
          src: photoUrl,
          onVisibleChange: visible => setPreviewOpen(visible),
        }}
      />

      {canEdit && (
        <ProfilePhotoUploader
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onUploaded={onUploaded}
          onUploadingChange={setUploading}
        />
      )}
    </>
  );
};

export default AvatarPhotoActions;
