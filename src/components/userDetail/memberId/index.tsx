import { useState } from 'react';
import { Image, Modal, Button } from 'antd';
import { FilePdfOutlined, EyeOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Member {
  idFront?: string;
  idBack?: string;
  memberId?: string;
}

interface UserData {
  member?: Member;
  idFront?: string;
  idBack?: string;
}

interface UserOutletContext {
  userData?: UserData;
}

interface IdViewerProps {
  src: string;
  alt: string;
  label: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const isPdf = (url: string) => url.toLowerCase().includes('.pdf');

/* ─── IdViewer ───────────────────────────────────────────────────────── */

const IdViewer = ({ src, alt, label }: IdViewerProps) => {
  const [pdfOpen, setPdfOpen] = useState(false);

  if (isPdf(src)) {
    return (
      <>
        <div className="pdf-preview-box" onClick={() => setPdfOpen(true)}>
          <FilePdfOutlined className="pdf-icon" />
          <span className="pdf-label">{label}</span>
          <Button type="primary" size="small" icon={<EyeOutlined />} className="pdf-view-btn">
            View PDF
          </Button>
        </div>
        <Modal
          title={alt}
          open={pdfOpen}
          onCancel={() => setPdfOpen(false)}
          footer={[
            <Button key="open" type="primary" onClick={() => window.open(src, '_blank')}>
              Open in New Tab
            </Button>,
            <Button key="close" onClick={() => setPdfOpen(false)}>Close</Button>,
          ]}
          width="80%"
          style={{ top: 20 }}
          styles={{ body: { height: '75vh', padding: 0 } }}
        >
          <iframe src={src} title={alt} width="100%" height="100%" style={{ border: 'none', borderRadius: '4px' }} />
        </Modal>
      </>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      style={{ width: '100%', height: '263px', borderRadius: '8px', objectFit: 'cover' }}
      preview={{ mask: <span style={{ fontWeight: 600, fontSize: 16 }}>Preview</span> }}
    />
  );
};

/* ─── Component ──────────────────────────────────────────────────────── */

const MemberIdSection = () => {
  const { userData } = useOutletContext<UserOutletContext>();
  const idFront = userData?.member?.idFront || userData?.idFront;
  const idBack  = userData?.member?.idBack  || userData?.idBack;

  return (
    <div className="member-id-section">
      <div className="id-images-section">
        <h3>ID Images</h3>
        <Image.PreviewGroup>
          <div className="id-images">
            <div className="image-column">
              <h4>Front Side</h4>
              <div className="image-container">
                {idFront
                  ? <IdViewer src={idFront} alt="ID Front" label="Front Side PDF" />
                  : <span className="no-id-text">No front ID uploaded</span>
                }
              </div>
            </div>
            <div className="image-column">
              <h4>Back Side</h4>
              <div className="image-container">
                {idBack
                  ? <IdViewer src={idBack} alt="ID Back" label="Back Side PDF" />
                  : <span className="no-id-text">No back ID uploaded</span>
                }
              </div>
            </div>
          </div>
        </Image.PreviewGroup>
      </div>
    </div>
  );
};

export default MemberIdSection;
