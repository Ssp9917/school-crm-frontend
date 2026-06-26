import { Image } from 'antd';
import { useOutletContext } from 'react-router-dom';
import './styles.scss';

interface Staff {
  idFront?: string;
  idBack?: string;
}

interface StaffOutletContext {
  staff?: Staff;
}

const GeneralStaffIdSection = () => {
  const { staff } = useOutletContext<StaffOutletContext>();
  const idFrontImage = staff?.idFront || 'https://via.placeholder.com/400x250?text=ID+Front';
  const idBackImage  = staff?.idBack  || 'https://via.placeholder.com/400x250?text=ID+Back';

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '263px',
    borderRadius: '8px',
    objectFit: 'cover',
  };

  const previewMask = <span style={{ fontWeight: 600, fontSize: 16 }}>Preview</span>;

  return (
    <div className="employee-id-section">
      <div className="id-images-section">
        <h3>ID Images</h3>
        <Image.PreviewGroup>
          <div className="id-images">
            <div className="image-column">
              <h4>Front Side</h4>
              <div className="image-container">
                <Image src={idFrontImage} alt="ID Front" style={imageStyle} preview={{ mask: previewMask }} />
              </div>
            </div>
            <div className="image-column">
              <h4>Back Side</h4>
              <div className="image-container">
                <Image src={idBackImage} alt="ID Back" style={imageStyle} preview={{ mask: previewMask }} />
              </div>
            </div>
          </div>
        </Image.PreviewGroup>
      </div>
    </div>
  );
};

export default GeneralStaffIdSection;
