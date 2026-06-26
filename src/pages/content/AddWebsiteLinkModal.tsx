import { useState } from 'react';
import { Modal, Form, Input, Button, notification } from 'antd';
import {
  LinkOutlined, PaperClipOutlined, FileTextOutlined, PictureOutlined,
  PlayCircleOutlined, EnvironmentOutlined, ReadOutlined, DatabaseOutlined,
  BorderOutlined, FolderOutlined, PhoneOutlined, MessageOutlined,
  MailOutlined, UserOutlined, StarOutlined, CloudDownloadOutlined,
  DownloadOutlined, SelectOutlined, HomeOutlined, ShoppingCartOutlined,
  SettingOutlined, InfoCircleOutlined, EyeOutlined, IdcardOutlined,
  BarChartOutlined, CheckOutlined, DownOutlined,
} from '@ant-design/icons';
import './addWebsiteLinkModal.scss';

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

const AddWebsiteLinkModal = ({ open, onClose, onAdd }) => {
  const [form] = Form.useForm();
  const [selectedIcon, setSelectedIcon] = useState('link');
  const [gridOpen, setGridOpen]         = useState(false);

  const urlVal  = Form.useWatch('url',  form);
  const textVal = Form.useWatch('text', form);
  const canAdd  = !!(urlVal?.trim() && textVal?.trim());

  const selectedEl = ICONS.find(i => i.key === selectedIcon)?.el;

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
    onAdd?.({ ...values, icon: selectedIcon });
    handleClose();
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedIcon('link');
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
      className="awl-modal"
    >
      <h2 className="awl-title">Add Website Link</h2>

      <Form
        form={form}
        layout="vertical"
        className="awl-form"
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Link URL"
          name="url"
          rules={[{ required: true, message: 'This field is required' }]}
        >
          <Input placeholder="https://" size="large" />
        </Form.Item>

        <Form.Item
          label="Link Icon & Text"
          name="text"
          rules={[{ required: true, message: 'This field is required' }]}
        >
          <Input
            placeholder="Enter title text for this link..."
            size="large"
            prefix={
              <span
                className="awl-icon-prefix"
                onMouseDown={e => { e.preventDefault(); setGridOpen(v => !v); }}
              >
                <span className="awl-icon-current">{selectedEl}</span>
                <DownOutlined className={`awl-icon-chevron${gridOpen ? ' awl-icon-chevron--open' : ''}`} />
              </span>
            }
          />
        </Form.Item>

        {/* Icon grid */}
        {gridOpen && (
          <div className="awl-icon-grid">
            {ICONS.map(ic => (
              <button
                type="button"
                key={ic.key}
                className={`awl-icon-cell${selectedIcon === ic.key ? ' awl-icon-cell--active' : ''}`}
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
          className="awl-add-btn"
          icon={<CheckOutlined />}
          disabled={!canAdd}
        >
          ADD TO PAGE
        </Button>
      </Form>
    </Modal>
  );
};

export default AddWebsiteLinkModal;
