import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { FileTextOutlined, FileImageOutlined, RightOutlined } from '@ant-design/icons';
import { CreatePageRoute } from '../../routes/routepath';
import './newPageModal.scss';

const OPTIONS = [
  {
    key: 'product',
    icon: <FileTextOutlined />,
    title: 'Product or Event Page',
    desc: 'Custom page for your product or event with title, description, images, map, and video',
  },
  {
    key: 'gallery',
    icon: <FileImageOutlined />,
    title: 'Image Gallery',
    desc: 'Create a custom page from one or more images, arranged in an image gallery',
  },
];

const NewPageModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleSelect = (key) => {
    onClose();
    navigate(`${CreatePageRoute}/${key}`);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={540}
      centered
      className="new-page-modal"
    >
      <h2 className="npm-title">Select a Page Template</h2>
      <p className="npm-subtitle">Choose the type of page to create</p>

      <div className="npm-options">
        {OPTIONS.map(opt => (
          <div key={opt.key} className="npm-option" onClick={() => handleSelect(opt.key)}>
            <div className="npm-icon">{opt.icon}</div>
            <div className="npm-option-text">
              <div className="npm-option-title">{opt.title}</div>
              <div className="npm-option-desc">{opt.desc}</div>
            </div>
            <RightOutlined className="npm-arrow" />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default NewPageModal;
