import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Drawer, Space, Tooltip, Spin, message, Modal, Slider, Radio } from 'antd';
import {
  CameraOutlined, PictureOutlined, CloudUploadOutlined, CloseOutlined,
  UploadOutlined, RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined,
  UndoOutlined, BorderOutlined, CheckCircleOutlined, FilePdfOutlined, EyeOutlined,
} from '@ant-design/icons';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import type { FormInstance } from 'antd';
import { useImageUploadMutation, useDeleteImageMutation } from '../../services/imageService';
import './styles.scss';

export type CropShape = 'rect' | 'round';

interface FlipState { horizontal: boolean; vertical: boolean; }

interface ImagePickerProps {
  form: FormInstance;
  name?: string;
  aspectRatio?: number;
  initialImageUrl?: string;
}

/* ─── Canvas helpers ─────────────────────────────────────────────────── */

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });

const getRadianAngle = (deg: number) => (deg * Math.PI) / 180;

const rotateSize = (width: number, height: number, rotation: number) => {
  const r = getRadianAngle(rotation);
  return {
    width:  Math.abs(Math.cos(r) * width)  + Math.abs(Math.sin(r) * height),
    height: Math.abs(Math.sin(r) * width)  + Math.abs(Math.cos(r) * height),
  };
};

export const getCroppedImg = async (
  src: string,
  pixelCrop: Area,
  rotation = 0,
  flip: FlipState = { horizontal: false, vertical: false },
  cropShape: CropShape = 'rect',
): Promise<Blob | null> => {
  const image = await createImage(src);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);
  const { width: bw, height: bh } = rotateSize(image.width, image.height, rotation);
  canvas.width  = bw;
  canvas.height = bh;
  ctx.translate(bw / 2, bh / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const cropped = document.createElement('canvas');
  const croppedCtx = cropped.getContext('2d');
  if (!croppedCtx) return null;
  cropped.width  = pixelCrop.width;
  cropped.height = pixelCrop.height;
  croppedCtx.drawImage(canvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

  if (cropShape === 'round') {
    const round = document.createElement('canvas');
    const roundCtx = round.getContext('2d')!;
    round.width  = pixelCrop.width;
    round.height = pixelCrop.height;
    roundCtx.beginPath();
    roundCtx.arc(pixelCrop.width / 2, pixelCrop.height / 2, Math.min(pixelCrop.width, pixelCrop.height) / 2, 0, Math.PI * 2);
    roundCtx.closePath();
    roundCtx.clip();
    roundCtx.drawImage(cropped, 0, 0);
    return new Promise(resolve => round.toBlob(resolve, 'image/jpeg'));
  }

  return new Promise(resolve => cropped.toBlob(resolve, 'image/jpeg'));
};

/* ─── Component ──────────────────────────────────────────────────────── */

const ImagePicker = ({ form, name = 'photo', aspectRatio = 1, initialImageUrl }: ImagePickerProps) => {
  const [open, setOpen]                         = useState(false);
  const [preview, setPreview]                   = useState<string | null>(() => {
    if (initialImageUrl) return initialImageUrl;
    const val = form.getFieldValue(name);
    if (Array.isArray(val) && val.length > 0 && val[0].url) return val[0].url;
    return typeof val === 'string' ? val : null;
  });
  const [uploadingLocal, setUploadingLocal]     = useState(false);
  const [deletingLocal,  setDeletingLocal]      = useState(false);
  const [cropModalOpen,  setCropModalOpen]      = useState(false);
  const [imageSrc,       setImageSrc]           = useState<string | null>(null);
  const [crop,           setCrop]               = useState<Point>({ x: 0, y: 0 });
  const [zoom,           setZoom]               = useState(1);
  const [rotation,       setRotation]           = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropShape,      setCropShape]          = useState<CropShape>('rect');
  const [storedImageUrl, setStoredImageUrl]     = useState<string | null>(null);

  const [uploadImage] = useImageUploadMutation();
  const [deleteImage] = useDeleteImageMutation();

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImageUrl && !preview) {
      setPreview(initialImageUrl);
      setStoredImageUrl(initialImageUrl);
      return;
    }
    const val = form.getFieldValue(name);
    if (Array.isArray(val) && val.length > 0 && val[0].url) {
      setPreview(val[0].url);
      setStoredImageUrl(val[0].url);
    } else if (typeof val === 'string' && val) {
      setPreview(val);
      setStoredImageUrl(val);
    }
  }, [form, name, initialImageUrl, preview]);

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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      setOpen(false);
      setUploadingLocal(true);
      try {
        const fd = new FormData();
        fd.append('images', file);
        const res = await (uploadImage as any)(fd).unwrap();
        const fileUrl: string | undefined = res?.images?.[0] || res?.files?.[0]?.url;
        if (!fileUrl) { message.error('Upload succeeded but no file URL returned'); setPreview(null); }
        else { setPreview(fileUrl); setStoredImageUrl(fileUrl); form.setFieldsValue({ [name]: fileUrl }); }
      } catch { message.error('File upload failed'); setPreview(null); }
      finally { setUploadingLocal(false); }
      return;
    }

    if (name === 'photo') {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setCropModalOpen(true);
        setOpen(false);
      });
      reader.readAsDataURL(file);
    } else {
      setOpen(false);
      setUploadingLocal(true);
      try {
        const fd = new FormData();
        fd.append('images', file);
        const res = await (uploadImage as any)(fd).unwrap();
        const imageUrl: string | undefined = res?.images?.[0] || res?.files?.[0]?.url;
        if (!imageUrl) { message.error('Upload succeeded but no image URL returned'); setPreview(null); }
        else { setPreview(imageUrl); setStoredImageUrl(imageUrl); form.setFieldsValue({ [name]: imageUrl }); }
      } catch (err) { console.error('Image upload failed', err); message.error('Image upload failed'); setPreview(null); }
      finally { setUploadingLocal(false); resetCropState(); }
    }
  };

  const processAndUploadImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCropModalOpen(false);
    setUploadingLocal(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, undefined, cropShape);
      const fd = new FormData();
      fd.append('images', blob as Blob, 'cropped-image.jpg');
      const res = await (uploadImage as any)(fd).unwrap();
      const imageUrl: string | undefined = res?.images?.[0] || res?.files?.[0]?.url;
      if (!imageUrl) { message.error('Upload succeeded but no image URL returned'); setPreview(null); }
      else { setPreview(imageUrl); setStoredImageUrl(imageUrl); form.setFieldsValue({ [name]: imageUrl }); }
    } catch (err) { console.error('Image processing/upload failed', err); message.error('Image upload failed'); setPreview(null); }
    finally { setUploadingLocal(false); resetCropState(); }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!storedImageUrl) return;
    setDeletingLocal(true);
    try {
      if (storedImageUrl.startsWith('http')) await (deleteImage as any)(storedImageUrl).unwrap();
      setPreview(null);
      setStoredImageUrl(null);
      form.setFieldsValue({ [name]: null });
    } catch { /* silent */ }
    finally { setDeletingLocal(false); }
  };

  const openGallery = () => { if (galleryRef.current) { galleryRef.current.value = ''; galleryRef.current.click(); } };
  const openCamera  = () => { if (cameraRef.current)  { cameraRef.current.value  = ''; cameraRef.current.click();  } };

  return (
    <div className="image-picker">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="upload-control" style={{ width: '100%', position: 'relative' }}>
          {deletingLocal ? (
            <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spin size="small" /><span>Deleting...</span>
            </div>
          ) : uploadingLocal ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, border: '2px dashed #d9d9d9', borderRadius: 8, background: '#fafafa' }}>
              <Spin size="large" />
              <span>Uploading image...</span>
              <span style={{ fontSize: '12px', color: '#999' }}>Please wait</span>
            </div>
          ) : !preview ? (
            <Button type="default" className="upload-btn" onClick={() => !deletingLocal && setOpen(true)} disabled={uploadingLocal || deletingLocal}>
              Upload Image
            </Button>
          ) : (
            <div className="image-preview-wrapper" style={{ marginTop: 8, position: 'relative', display: 'inline-block', height: preview.endsWith('.pdf') ? 'auto' : undefined }}>
              <Tooltip title="Remove file">
                <Button
                  className="image-remove"
                  type="text" shape="circle" size="small"
                  icon={deletingLocal ? <Spin size="small" /> : <CloseOutlined />}
                  onClick={handleRemove}
                  style={{ position: 'absolute', top: 6, right: 6, zIndex: 2, background: 'rgba(0,0,0,0.35)', color: '#fff' }}
                />
              </Tooltip>
              {preview.endsWith('.pdf') ? (
                <div
                  onClick={() => window.open(preview, '_blank')}
                  style={{ padding: '12px 5px', border: '2px solid #d9d9d9', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', gap: 10, opacity: deletingLocal ? 0.5 : 1, cursor: 'pointer', transition: 'all 0.3s', maxWidth: '200px' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = '#40a9ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff';    e.currentTarget.style.borderColor = '#d9d9d9'; }}
                >
                  <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>PDF Document</div>
                    <div style={{ fontSize: 11, color: '#999' }}>Click to view</div>
                  </div>
                  <EyeOutlined style={{ fontSize: 16, color: '#1890ff' }} />
                </div>
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  style={{ maxWidth: '100%', borderRadius: cropShape === 'round' ? '50%' : 6, display: 'block', opacity: deletingLocal ? 0.5 : 1, aspectRatio }}
                />
              )}
            </div>
          )}
        </div>

        <input ref={galleryRef} type="file" accept="image/*,application/pdf" onChange={handleFile} style={{ display: 'none' }} />

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
                  <Button type="primary" icon={<UploadOutlined />} onClick={processAndUploadImage} loading={uploadingLocal}>Upload</Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <input ref={cameraRef} type="file" accept="image/*,application/pdf" capture="environment" onChange={handleFile} style={{ display: 'none' }} />

        <Drawer className="image-picker-drawer" placement="bottom" closeIcon={false} onClose={() => setOpen(false)} open={open} height={60}>
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
      </Space>
    </div>
  );
};

export default ImagePicker;
