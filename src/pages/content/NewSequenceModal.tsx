import { useState } from 'react';
import { Modal, Input, Button, Select } from 'antd';
import {
  NodeIndexOutlined, WhatsAppOutlined, RightOutlined,
  LeftOutlined, CheckOutlined,
} from '@ant-design/icons';
import './newSequenceModal.scss';

const { TextArea } = Input;

const OPTIONS = [
  {
    key: 'manual',
    icon: <NodeIndexOutlined />,
    iconClass: 'nsm-icon nsm-icon--manual',
    title: 'Manual Sequence',
    desc: 'Engage clients with calls, messages, and other content',
  },
  {
    key: 'whatsapp',
    icon: <WhatsAppOutlined />,
    iconClass: 'nsm-icon nsm-icon--whatsapp',
    title: 'Automated WhatsApp Sequence',
    desc: 'Send a multi-step WhatsApp sequence over multiple days',
  },
];

const NewSequenceModal = ({ open, onClose }) => {
  const [step, setStep]               = useState(1);
  const [selected, setSelected]       = useState(null);
  const [sendingFrom, setSendingFrom] = useState(null);
  const [seqTitle, setSeqTitle]       = useState('');
  const [seqDesc, setSeqDesc]         = useState('');

  const handleSelect = (opt) => {
    setSelected(opt);
    setStep(2);
  };

  const handleClose = () => {
    setStep(1);
    setSelected(null);
    setSendingFrom(null);
    setSeqTitle('');
    setSeqDesc('');
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setSendingFrom(null);
    setSeqTitle('');
    setSeqDesc('');
  };

  const isCreateDisabled = !seqTitle.trim() || (selected?.key === 'whatsapp' && !sendingFrom);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      centered
      className="new-seq-modal"
    >
      {/* ── Step 1: pick type ── */}
      {step === 1 && (
        <>
          <h2 className="nsm-title">Create New Sequence</h2>
          <p className="nsm-subtitle">Choose the type of sequence to create</p>
          <div className="nsm-options">
            {OPTIONS.map(opt => (
              <div key={opt.key} className="nsm-option" onClick={() => handleSelect(opt)}>
                <div className={opt.iconClass}>{opt.icon}</div>
                <div className="nsm-option-text">
                  <div className="nsm-option-title">{opt.title}</div>
                  <div className="nsm-option-desc">{opt.desc}</div>
                </div>
                <RightOutlined className="nsm-arrow" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Step 2: fill details ── */}
      {step === 2 && selected && (
        <>
          <button className="nsm-back" onClick={handleBack}>
            <LeftOutlined /> BACK
          </button>

          <h2 className="nsm-title">Create New Sequence</h2>

          <div className="nsm-selected-badge">
            <span className={selected.iconClass} style={{ width: 24, height: 24, fontSize: 14, borderRadius: 6 }}>
              {selected.icon}
            </span>
            {selected.title}
          </div>

          {selected?.key === 'whatsapp' && (
            <div className="nsm-field">
              <div className="nsm-field-header">
                <label className="nsm-label">Sending from*</label>
                <span className="nsm-required">*Required</span>
              </div>
              <Select
                value={sendingFrom}
                onChange={(val) => { if (val !== '__connect__') setSendingFrom(val); }}
                placeholder="Select WhatsApp Business number"
                size="large"
                className="nsm-select"
                style={{ width: '100%' }}
                optionRender={(option) => {
                  if (option.value === '__connect__') {
                    return (
                      <span className="nsm-connect-wa">
                        <span className="nsm-connect-wa-plus">+</span>
                        CONNECT NEW WHATSAPP NUMBER
                      </span>
                    );
                  }
                  return (
                    <span className="nsm-wa-option">
                      <WhatsAppOutlined className="nsm-wa-option-icon" />
                      {option.label}
                    </span>
                  );
                }}
                options={[
                  { value: '+919910666390', label: '+91 99106 66390 (Rewant singh)' },
                  { value: '__connect__',   label: 'CONNECT NEW WHATSAPP NUMBER' },
                ]}
              />
            </div>
          )}

          <div className="nsm-field">
            <div className="nsm-field-header">
              <label className="nsm-label">Sequence Title*</label>
              <span className="nsm-required">*Required</span>
            </div>
            <Input
              value={seqTitle}
              onChange={e => setSeqTitle(e.target.value)}
              placeholder="Enter a title..."
              size="large"
            />
          </div>

          <div className="nsm-field">
            <label className="nsm-label">Description</label>
            <TextArea
              value={seqDesc}
              onChange={e => setSeqDesc(e.target.value)}
              placeholder="Add a description about the main goal or use case of your sequence"
              rows={6}
            />
          </div>

          <Button
            block
            size="large"
            className="nsm-create-btn"
            icon={<CheckOutlined />}
            disabled={isCreateDisabled}
          >
            CREATE SEQUENCE
          </Button>
        </>
      )}
    </Modal>
  );
};

export default NewSequenceModal;
