import { useState, useEffect } from 'react';
import { Modal, Input, Button, Select, message } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { useAddLeadMutation, useUpdateLeadMutation } from '../../services/leads';
import { useCountries } from '../../hooks/useCountries';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface FormData {
  clientName:  string;
  countryCode: string;
  mobileNumber: string;
  email:        string;
  source:       string | undefined;
  notes:        string;
}

interface InitialData {
  _id?:         string;
  name?:        string;
  number?:      string;
  phoneNumber?: string;
  countryCode?: string;
  email?:       string;
  source?:      string;
  description?: string;
  notes?:       string;
}

interface AddClientModalProps {
  open:          boolean;
  onClose:       () => void;
  initialData?:  InitialData | null;
  title?:        string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const SOURCE_OPTIONS = [
  { label: 'Walk In',      value: 'walking'      },
  { label: 'Incoming',     value: 'incoming'     },
  { label: 'Social Media', value: 'social_media' },
  { label: 'Facebook',     value: 'facebook'     },
  { label: 'Reference',    value: 'reference'    },
  { label: 'Other',        value: 'other'        },
];

const EMPTY_FORM: FormData = {
  clientName:   '',
  countryCode:  'IN',
  mobileNumber: '',
  email:        '',
  source:       undefined,
  notes:        '',
};

/* ─── Component ──────────────────────────────────────────────────────── */

const AddClientModal = ({ open, onClose, initialData = null, title = 'Add New Client' }: AddClientModalProps) => {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const [addLead]    = useAddLeadMutation();
  const [updateLead] = useUpdateLeadMutation();
  const { countryOptions } = useCountries();

  useEffect(() => {
    if (open && initialData) {
      const isoFromDial = initialData.countryCode
        ? countryOptions.find(c => c.dial === initialData.countryCode)?.value
        : undefined;
      setFormData({
        clientName:   initialData.name          || '',
        countryCode:  isoFromDial               || 'IN',
        mobileNumber: initialData.number        || initialData.phoneNumber || '',
        email:        initialData.email         || '',
        source:       initialData.source        || undefined,
        notes:        initialData.description   || initialData.notes || '',
      });
    } else if (open && !initialData) {
      setFormData(EMPTY_FORM);
    }
  }, [open]);

  const set = (field: keyof FormData, value: string | undefined) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!formData.clientName.trim()) {
      message.error('Client name is required');
      return;
    }
    if (!formData.mobileNumber.trim()) {
      message.error('Mobile number is required');
      return;
    }
    if (!formData.source) {
      message.error('Source is required');
      return;
    }
    if (!formData.notes.trim()) {
      message.error('Notes are required');
      return;
    }
    const selectedCountry = countryOptions.find(c => c.value === formData.countryCode);
    const dialCode = selectedCountry?.dial || '+91';

    const payload = {
      name:        formData.clientName,
      number:      formData.mobileNumber,
      countryCode: dialCode,
      email:       formData.email,
      source:      formData.source,
      description: formData.notes,
    };
    try {
      if (initialData?._id) {
        await (updateLead as any)({ id: initialData._id, ...payload }).unwrap();
      } else {
        await (addLead as any)(payload).unwrap();
        setFormData(EMPTY_FORM);
      }
      onClose();
    } catch {
      message.error(initialData?._id ? 'Failed to update client' : 'Failed to add client');
    }
  };

  const selectedCountry = countryOptions.find(c => c.value === formData.countryCode);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      closeIcon={<CloseOutlined style={{ fontSize: '20px', color: '#666' }} />}
      className="add-client-modal"
    >
      <div className="add-client-content">
        <h2 className="modal-title">{title}</h2>

        <div className="form-group">
          <label className="form-label">
            Client Name<span className="required">*</span>
          </label>
          <span className="required-text">*Required</span>
          <Input
            placeholder="e.g. Katherine Lim"
            size="large"
            value={formData.clientName}
            onChange={e => set('clientName', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Mobile Number<span className="required">*</span>
          </label>
          <div className="phone-input-wrapper">
            <Select
              showSearch
              value={formData.countryCode}
              onChange={(val: string) => set('countryCode', val)}
              className="country-code-select"
              popupMatchSelectWidth={300}
              optionLabelProp="label"
              options={countryOptions.map(c => ({
                value: c.value,
                label: `${c.name} ${c.dial || ''}`,
                render: c,
              }))}
              optionRender={option => {
                const c = (option.data as any).render;
                return (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {c.flag && (
                      <img src={c.flag} alt={c.name} style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 13 }}>{c.name}</span>
                    {c.dial && <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 'auto' }}>{c.dial}</span>}
                  </span>
                );
              }}
              labelRender={() => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {selectedCountry?.flag && (
                    <img src={selectedCountry.flag} alt={selectedCountry.name} style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2 }} />
                  )}
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedCountry?.dial || '+91'}</span>
                </span>
              )}
            />
            <Input
              placeholder="Enter phone number"
              size="large"
              value={formData.mobileNumber}
              onChange={e => set('mobileNumber', e.target.value)}
              className="phone-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <Input
            placeholder="e.g. email@example.com"
            size="large"
            value={formData.email}
            onChange={e => set('email', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Source<span className="required">*</span>
          </label>
          <Select
            placeholder="Select source"
            size="large"
            style={{ width: '100%' }}
            value={formData.source}
            onChange={(val: string) => set('source', val)}
            className="form-input"
            options={SOURCE_OPTIONS}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Notes<span className="required">*</span>
          </label>
          <Input.TextArea
            placeholder="Add any notes..."
            rows={3}
            value={formData.notes}
            onChange={e => set('notes', e.target.value)}
            className="form-input"
          />
        </div>

        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={handleSave}
          className="save-button"
        >
          SAVE
        </Button>
      </div>
    </Modal>
  );
};

export default AddClientModal;
