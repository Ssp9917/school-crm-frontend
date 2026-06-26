import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Input, Button, notification } from 'antd';
import {
  LinkOutlined, PaperClipOutlined, YoutubeOutlined,
  EnvironmentOutlined, PictureOutlined, EditOutlined,
} from '@ant-design/icons';
import { ContentRoute } from '../../routes/routepath';
import UploadImagesModal from './UploadImagesModal';
import AddWebsiteLinkModal from './AddWebsiteLinkModal';
import AddAttachmentModal from './AddAttachmentModal';
import AddYouTubeModal from './AddYouTubeModal';
import AddGoogleMapModal from './AddGoogleMapModal';
import './createNewPage.scss';

/* ─── Constants ──────────────────────────────────────────────────────── */

const TYPE_LABELS: Record<string, string> = {
  product: 'Product or Event Page',
  gallery: 'Image Gallery',
};

const ADD_ONS: { key: string; icon: React.ReactNode; label: string }[] = [
  { key: 'link',       icon: <LinkOutlined />,       label: 'Add Website Link'  },
  { key: 'attachment', icon: <PaperClipOutlined />,  label: 'Add Attachment'    },
  { key: 'youtube',    icon: <YoutubeOutlined />,     label: 'Add YouTube Video' },
  { key: 'map',        icon: <EnvironmentOutlined />, label: 'Add Google Map'    },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const CreateNewPage = () => {
  const [form]    = Form.useForm();
  const navigate  = useNavigate();
  const { type }  = useParams<{ type: string }>();
  const typeLabel = TYPE_LABELS[type ?? ''] ?? 'Product or Event Page';

  const [images,         setImages]         = useState<File[]>([]);
  const [uploadOpen,     setUploadOpen]     = useState(false);
  const [linkOpen,       setLinkOpen]       = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [youtubeOpen,    setYoutubeOpen]    = useState(false);
  const [mapOpen,        setMapOpen]        = useState(false);

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    const unique = [...new Set(labels)];
    notification.error({
      message:     'Required Fields Missing',
      description: unique.join(', '),
      placement:   'topRight',
      duration:    4,
    });
  };

  const handleCreate = (values: Record<string, string>) => {
    if (images.length === 0) return;
    console.log({ ...values, images });
  };

  const isGallery = type === 'gallery';

  return (
    <div className="cnp-page">

      {/* Breadcrumb */}
      <div className="cnp-breadcrumb">
        <Link to={ContentRoute} className="cnp-bc-link">Content</Link>
        <span className="cnp-bc-sep"> &gt; </span>
        <Link to={ContentRoute} className="cnp-bc-link">Pages</Link>
        <span className="cnp-bc-sep"> &gt; </span>
        <span className="cnp-bc-current">Create New Page</span>
      </div>

      <h1 className="cnp-title">Create New Page</h1>
      <p className="cnp-type-label">{typeLabel}</p>

      <div className="cnp-card">
        <Form
          form={form}
          layout="vertical"
          className="cnp-form"
          onFinish={handleCreate}
          onFinishFailed={onFinishFailed as any}
        >

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'This field is required' }]}
          >
            <Input placeholder="Enter page title" size="large" />
          </Form.Item>

          {!isGallery && (
            <Form.Item label="Description" name="description">
              <Input.TextArea
                placeholder="Add a description about your product or event"
                rows={8}
              />
            </Form.Item>
          )}

          {/* Image Gallery */}
          <div className="cnp-gallery-field">
            <div className="cnp-gallery-header">
              <span className="cnp-gallery-label">
                Image Gallery <span className="cnp-gallery-star">*</span>
              </span>
            </div>
            <p className="cnp-hint">Add images by clicking on &apos;Upload Images&apos; below</p>
            <div className="cnp-upload-zone" onClick={() => setUploadOpen(true)}>
              {images.length === 0 ? (
                <button type="button" className="cnp-upload-btn">
                  <span className="cnp-upload-plus">+</span>
                  <PictureOutlined className="cnp-upload-icon" />
                  Upload Images
                </button>
              ) : (
                <div className="cnp-image-previews">
                  {images.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} className="cnp-img-thumb" alt="" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isGallery && (
            <div className="cnp-addons">
              {ADD_ONS.map(a => (
                <div
                  key={a.key}
                  className="cnp-addon-row"
                  onClick={() => {
                    if (a.key === 'link')       setLinkOpen(true);
                    if (a.key === 'attachment') setAttachmentOpen(true);
                    if (a.key === 'youtube')    setYoutubeOpen(true);
                    if (a.key === 'map')        setMapOpen(true);
                  }}
                >
                  <span className="cnp-addon-plus">+</span>
                  <span className="cnp-addon-icon">{a.icon}</span>
                  <span className="cnp-addon-label">{a.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="cnp-actions">
            <Button
              size="large"
              className="cnp-cancel-btn"
              onClick={() => navigate(ContentRoute)}
            >
              CANCEL
            </Button>
            <Button
              htmlType="submit"
              size="large"
              className="cnp-create-btn"
              icon={<EditOutlined />}
              disabled={images.length === 0}
            >
              CREATE PAGE
            </Button>
          </div>

        </Form>
      </div>

      {!isGallery && (
        <>
          <AddWebsiteLinkModal open={linkOpen}       onClose={() => setLinkOpen(false)}       onAdd={() => {}} />
          <AddAttachmentModal  open={attachmentOpen} onClose={() => setAttachmentOpen(false)} onAdd={() => {}} />
          <AddYouTubeModal     open={youtubeOpen}    onClose={() => setYoutubeOpen(false)}    onAdd={() => {}} />
          <AddGoogleMapModal   open={mapOpen}        onClose={() => setMapOpen(false)}        onAdd={() => {}} />
        </>
      )}

      <UploadImagesModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={(files: File[]) => setImages(prev => [...prev, ...files])}
      />
    </div>
  );
};

export default CreateNewPage;
