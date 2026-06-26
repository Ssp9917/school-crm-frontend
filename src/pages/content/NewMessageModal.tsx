import { useState } from 'react';
import { Modal, Input, Button } from 'antd';
import { CheckOutlined, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import './newMessageModal.scss';

const { TextArea } = Input;

const VARIABLES = [
  { key: '@clientName',     desc: "Client's display name (if blank, use full client name)" },
  { key: '@clientEmail',    desc: "Client's email address" },
  { key: '@clientPhone',    desc: "Client's phone number" },
  { key: '@clientWhatsApp', desc: "Client's WhatsApp number" },
  { key: '@senderName',     desc: "Sender's name" },
  { key: '@senderCompany',  desc: "Sender's company name" },
  { key: '@senderPhone',    desc: "Sender's phone number" },
  { key: '@senderEmail',    desc: "Sender's email address" },
];

const NewMessageModal = ({ open, onClose }) => {
  const [title, setTitle]                 = useState('');
  const [message, setMessage]             = useState('');
  const [emailSubject, setEmailSubject]   = useState('');
  const [advanced, setAdvanced]           = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [discardOpen, setDiscardOpen]     = useState(false);

  const isDirty = title.trim() || message.trim() || emailSubject.trim();

  const resetAll = () => {
    setTitle('');
    setMessage('');
    setEmailSubject('');
    setAdvanced(false);
    setShowVariables(false);
  };

  const handleClose = () => {
    if (isDirty) {
      setDiscardOpen(true);
    } else {
      resetAll();
      onClose();
    }
  };

  const handleDiscard = () => {
    setDiscardOpen(false);
    resetAll();
    onClose();
  };

  const insertVariable = (varKey) => {
    setMessage(prev => prev + varKey);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={showVariables ? 1120 : 890}
        centered
        className="new-msg-modal"
      >
        <div className="nmm-layout">

          {/* ── Left: form ── */}
          <div className="nmm-form">
            <h2 className="nmm-title">New Message Template</h2>

            <div className="nmm-field">
              <label className="nmm-label">Title</label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Ask for coffee in next 3 days"
                size="large"
                className="nmm-input"
              />
            </div>

            <div className="nmm-field">
              <label className="nmm-label">Template Message</label>
              <TextArea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hi @clientName..."
                rows={5}
                className="nmm-textarea"
              />
            </div>

            <div className="nmm-variable-row">
              <p className="nmm-variable-text">
                You can use <strong>@variables</strong> in this message, which will be automatically
                replaced with the relevant details when sending. Click the{' '}
                <strong>'@variable'</strong> button.
              </p>
              <Button
                className={`nmm-variable-btn${showVariables ? ' nmm-variable-btn--active' : ''}`}
                onClick={() => setShowVariables(v => !v)}
              >
                @variable &nbsp;<CaretRightOutlined />
              </Button>
            </div>

            <div className="nmm-advanced" onClick={() => setAdvanced(v => !v)}>
              ADVANCED SETTINGS &nbsp;<CaretDownOutlined className={advanced ? 'nmm-adv-icon--open' : ''} />
            </div>

            {advanced && (
              <div className="nmm-adv-section">
                <label className="nmm-label">Email Subject Line</label>
                <p className="nmm-adv-hint">Enter a subject line for your Message Template when sending via email</p>
                <Input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject line..."
                  size="large"
                  className="nmm-input"
                />
              </div>
            )}

            <Button
              block
              size="large"
              className="nmm-create-btn"
              icon={<CheckOutlined />}
              disabled={!title.trim()}
            >
              CREATE MESSAGE
            </Button>
          </div>

          {/* ── Right: variables panel ── */}
          {showVariables && (
            <div className="nmm-vars-panel">
              {VARIABLES.map(v => (
                <div key={v.key} className="nmm-var-item">
                  <div className="nmm-var-info">
                    <span className="nmm-var-key">{v.key}</span>
                    <span className="nmm-var-desc">{v.desc}</span>
                  </div>
                  <span className="nmm-var-add" onClick={() => insertVariable(v.key)}>+</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </Modal>

      {/* Discard confirmation */}
      <Modal
        open={discardOpen}
        onCancel={() => setDiscardOpen(false)}
        footer={null}
        width={580}
        centered
        className="discard-modal"
      >
        <h2 className="dm-title">Discard Message?</h2>
        <p className="dm-desc">
          This message hasn't been saved yet. You're about to discard it and will
          need to start over from scratch next time.
        </p>
        <div className="dm-actions">
          <Button className="dm-keep-btn" onClick={() => setDiscardOpen(false)}>
            KEEP EDITING
          </Button>
          <Button className="dm-discard-btn" onClick={handleDiscard}>
            DISCARD MESSAGE
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default NewMessageModal;