import { useState, useEffect } from 'react';
import { Image, Tag, Select, Modal, Form, InputNumber } from 'antd';
import { useAssignGymKitMutation } from '../../services/user';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface GymKitProduct {
  value: string;
  label: string;
  total: number;
  delivered: number;
  remaining: number;
  fullyDelivered: boolean;
  image?: string;
  warehouseName?: string;
}

interface StatusMessage {
  type: 'success' | 'error';
  text: string;
}

interface DeliveryPayload {
  userId: string;
  products: { productId: string; quantity: number }[];
  setMessage: (msg: StatusMessage) => void;
}

interface GymKitDeliveryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: DeliveryPayload) => Promise<void>;
  products: GymKitProduct[];
  userId: string;
  isLoading: boolean;
}

interface PlanProduct {
  _id?: string;
  productId?: { _id?: string; productName?: string; productImage?: string; warehouseName?: string };
  quantity?: number;
  deliveredQuantity?: number;
  remainingQuantity?: number;
  fullyDelivered?: boolean;
}

interface GymKitSelectProps {
  record?: {
    _id: string;
    planGymKit?: {
      gymKitAvailable?: boolean;
      products?: PlanProduct[];
    };
  };
}

/* ─── Delivery Modal ─────────────────────────────────────────────────── */

const GymKitDeliveryModal = ({ visible, onClose, onSubmit, products, userId, isLoading }: GymKitDeliveryModalProps) => {
  const [form] = Form.useForm();
  const [quantities, setQuantities] = useState<Record<string, number | null>>({});
  const [message, setMessage]       = useState<StatusMessage | null>(null);

  useEffect(() => {
    if (visible) {
      setQuantities({});
      setMessage(null);
      form.resetFields();
    }
  }, [visible, form]);

  const handleQuantityChange = (productId: string, value: number | null) => {
    setQuantities(prev => ({ ...prev, [productId]: value }));
  };

  const handleSubmit = async () => {
    const productsToDeliver = (Object.entries(quantities) as [string, number | null][])
      .filter(([, qty]) => qty != null && qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity: quantity as number }));

    if (productsToDeliver.length === 0) {
      Modal.warning({ title: 'No Products Selected', content: 'Please enter quantity for at least one product.' });
      return;
    }

    const validationErrors: string[] = [];
    productsToDeliver.forEach(({ productId, quantity }) => {
      const product = products.find(p => p.value === productId);
      if (product && quantity > product.remaining) {
        validationErrors.push(`${product.label}: Quantity (${quantity}) exceeds remaining (${product.remaining})`);
      }
    });

    if (validationErrors.length > 0) {
      Modal.error({
        title: 'Validation Error',
        content: <div>{validationErrors.map((err, i) => <div key={i}>{err}</div>)}</div>,
      });
      return;
    }

    await onSubmit({ userId, products: productsToDeliver, setMessage });
  };

  const handleCancel = () => {
    form.resetFields();
    setQuantities({});
    setMessage(null);
    onClose();
  };

  const hasValidQuantities = Object.values(quantities).some(qty => qty != null && qty > 0);

  return (
    <Modal
      title="Gym Kit Delivery"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Deliver Selected"
      cancelText="Cancel"
      width={800}
      okButtonProps={{ disabled: !hasValidQuantities || isLoading, loading: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
      closable={!isLoading}
      maskClosable={!isLoading}
    >
      <div style={{ marginTop: 20 }}>
        {message && (
          <div style={{
            padding: '12px 16px', marginBottom: 16, borderRadius: '8px',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: message.type === 'success' ? '#166534' : '#991b1b',
          }}>
            <strong>{message.type === 'success' ? '✓ Success' : '✗ Error'}:</strong> {message.text}
          </div>
        )}

        <h4 style={{ marginBottom: 16, color: 'var(--sider-text)', fontSize: 16 }}>Enter Delivery Quantities</h4>

        <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '8px' }}>
          {products?.map(product => (
            <div key={product.value} style={{
              padding: '16px', border: '1px solid var(--border-color, #e5e5e5)',
              borderRadius: '10px', marginBottom: '12px', background: 'var(--card-bg)',
              opacity: product.remaining === 0 ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {product.image && (
                  <div style={{ flexShrink: 0 }}>
                    <Image
                      src={product.image} alt={product.label} width={60} height={60}
                      style={{ borderRadius: '8px', objectFit: 'cover' }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 15, color: 'var(--sider-text)' }}>{product.label}</strong>
                    {product.warehouseName && <Tag style={{ marginLeft: 8 }} color="blue">{product.warehouseName}</Tag>}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: 13, color: 'var(--muted, #6b7280)' }}>
                    <span>Total: <strong>{product.total}</strong></span>
                    <span>Delivered: <strong>{product.delivered}</strong></span>
                    <span style={{ color: product.remaining > 0 ? 'var(--accent)' : '#ef4444', fontWeight: 600 }}>
                      Remaining: <strong>{product.remaining}</strong>
                    </span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, width: '150px' }}>
                  {product.remaining > 0 ? (
                    <InputNumber
                      min={0}
                      max={product.remaining}
                      placeholder="Quantity"
                      value={quantities[product.value] ?? undefined}
                      onChange={val => handleQuantityChange(product.value, val)}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <Tag color="green">Delivered</Tag>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {products?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted, #6b7280)' }}>
            No gym kit products available
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────── */

const GymKitSelect = ({ record }: GymKitSelectProps) => {
  const [modalVisible, setModalVisible]           = useState(false);
  const [assignGymKit, { isLoading }]             = useAssignGymKitMutation();

  const hasGymKit =
    record?.planGymKit?.gymKitAvailable === true &&
    Array.isArray(record?.planGymKit?.products) &&
    (record.planGymKit.products?.length ?? 0) > 0;

  const gymKitItems: GymKitProduct[] = hasGymKit
    ? (record!.planGymKit!.products ?? []).map(product => ({
        label:          product.productId?.productName || 'Unknown Product',
        value:          product.productId?._id || product._id || '',
        total:          product.quantity         ?? 0,
        delivered:      product.deliveredQuantity ?? 0,
        remaining:      product.remainingQuantity ?? 0,
        fullyDelivered: product.fullyDelivered    ?? false,
        image:          product.productId?.productImage,
        warehouseName:  product.productId?.warehouseName,
      }))
    : [];

  const allProductsDelivered =
    hasGymKit && (record!.planGymKit!.products ?? []).every(p => p.fullyDelivered === true);

  const handleDelivery = async (deliveryData: DeliveryPayload) => {
    const { setMessage } = deliveryData;
    try {
      await (assignGymKit as any)({ userId: deliveryData.userId, products: deliveryData.products }).unwrap();
      setMessage({ type: 'success', text: 'Gym kit delivered successfully!' });
      setTimeout(() => setModalVisible(false), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.data?.message || error?.message || 'Failed to deliver gym kit' });
    }
  };

  if (!hasGymKit) return <span style={{ color: 'var(--muted, #6b7280)' }}>N/A</span>;
  if (allProductsDelivered) return <Tag color="green" style={{ fontWeight: 600 }}>Fully Delivered</Tag>;

  return (
    <>
      <Select
        placeholder="Select Action"
        style={{ width: '100%' }}
        onSelect={() => setModalVisible(true)}
        value={undefined}
        options={[{ label: 'Available', value: 'available' }]}
      />
      <GymKitDeliveryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleDelivery}
        products={gymKitItems}
        userId={record!._id}
        isLoading={isLoading}
      />
    </>
  );
};

export default GymKitSelect;
