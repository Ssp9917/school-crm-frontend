import { useRef, useState, useCallback } from 'react';
import { Button, Drawer, Tooltip, Modal, Slider, Radio, message } from 'antd';
import {
  CameraOutlined, PictureOutlined, CloudUploadOutlined, UploadOutlined,
  RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined, UndoOutlined,
  BorderOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { useImageUploadMutation } from '../../services/imageService';
import { getCroppedImg } from './ImagePicker';
import type { CropShape } from './ImagePicker';
import './styles.scss';

interface ProfilePhotoUploaderProps {
  open: boolean;
  onClose: () => void;
  onUploaded: (url: string) => void | Promise<void>;
  onUploadingChange?: (uploading: boolean) => void;
  aspectRatio?: number;
}

const ProfilePhotoUploader = ({
  open,
  onClose,
  onUploaded,
  onUploadingChange,
  aspectRatio = 1,
}: ProfilePhotoUploaderProps) => {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc,      setImageSrc]      = useState<string | null>(null);
  const [crop,          setCrop]          = useState<Point>({ x: 0, y: 0 });
  const [zoom,          setZoom]          = useState(1);
  const [rotation,      setRotation]      = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropShape,     setCropShape]     = useState<CropShape>('round');
  const [uploading,     setUploading]     = useState(false);

  const [uploadImage] = useImageUploadMutation();

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const resetCropState = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
      setCropModalOpen(true);
      onClose();
    });
    reader.readAsDataURL(file);
  };

  const processAndUploadImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCropModalOpen(false);
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, undefined, cropShape);
      const fd = new FormData();
      fd.append('images', blob as Blob, 'cropped-image.jpg');
      const res = await (uploadImage as any)(fd).unwrap();
      const imageUrl: string | undefined = res?.images?.[0] || res?.files?.[0]?.url;
      if (!imageUrl) {
        message.error('Upload succeeded but no image URL returned');
        return;
      }
      await onUploaded(imageUrl);
    } catch (err) {
      console.error('Image processing/upload failed', err);
      message.error('Image upload failed');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      resetCropState();
    }
  };

  const openGallery = () => { if (galleryRef.current) { galleryRef.current.value = ''; galleryRef.current.click(); } };
  const openCamera  = () => { if (cameraRef.current)  { cameraRef.current.value  = ''; cameraRef.current.click();  } };

  return (
    <>
      <input ref={galleryRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />

      <Drawer className="image-picker-drawer" placement="bottom" closeIcon={false} onClose={onClose} open={open} height={60}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
          <Tooltip title="Camera">
            <Button type="default" shape="circle" size="large" icon={<CameraOutlined />} onClick={openCamera} />
          </Tooltip>
          <Tooltip title="Gallery">
            <Button type="default" shape="circle" size="large" icon={<PictureOutlined />} onClick={openGallery} />
          </Tooltip>
          <Tooltip title="Google Drive">
            <Button type="default" shape="circle" size="large" icon={<CloudUploadOutlined />} onClick={openGallery} />
          </Tooltip>
        </div>
      </Drawer>

      <Modal
        title="Edit Image"
        open={cropModalOpen}
        onCancel={() => { setCropModalOpen(false); resetCropState(); }}
        footer={null}
        width={800}
      >
        {imageSrc && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ position: 'relative', height: 300, width: '100%', marginBottom: 24 }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                cropShape={cropShape}
                showGrid={false}
              />
            </div>
            <div className="crop-controls">
              <div className="crop-row top-row" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <Radio.Group value={cropShape} onChange={e => setCropShape(e.target.value as CropShape)} buttonStyle="solid">
                  <Radio.Button value="rect"><BorderOutlined /> Square</Radio.Button>
                  <Radio.Button value="round"><CheckCircleOutlined /> Circle</Radio.Button>
                </Radio.Group>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button icon={<RotateLeftOutlined />}  onClick={() => setRotation(r => r - 90)}>-90°</Button>
                  <Button icon={<UndoOutlined />}        onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); setCroppedAreaPixels(null); }}>Reset</Button>
                  <Button icon={<RotateRightOutlined />} onClick={() => setRotation(r => r + 90)}>+90°</Button>
                </div>
              </div>
              <div className="crop-row slider-row" style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 16 }}>
                <div className="slider-box">
                  <label><ZoomInOutlined /> Zoom</label>
                  <Slider min={1} max={3} step={0.1} value={zoom} onChange={setZoom} style={{ width: 120 }} />
                </div>
                <div className="slider-box">
                  <label><RotateRightOutlined /> Rotation</label>
                  <Slider min={0} max={360} value={rotation} onChange={setRotation} style={{ width: 120 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <Button onClick={() => { setCropModalOpen(false); resetCropState(); }}>Cancel</Button>
                <Button type="primary" icon={<UploadOutlined />} onClick={processAndUploadImage} loading={uploading}>Upload</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProfilePhotoUploader;
