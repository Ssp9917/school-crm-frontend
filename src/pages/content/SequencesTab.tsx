import { useState } from 'react';
import {
  ThunderboltOutlined, MessageOutlined, FileTextOutlined,
  WhatsAppOutlined, NodeIndexOutlined, CaretUpOutlined,
} from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import './sequencesTab.scss';

const SEQUENCES = [
  {
    key: '1',
    type: 'Manual',
    title: 'APPOINTMENT',
    description: "Dear Ma'am Thank you for booking your appointment with us at FitClub. We look forward to giving you a tour of our centre and discuss what we can do for you...",
    steps: 0,
    duration: null,
    clients: 0,
    stepIcons: [],
    status: 'Active',
    folders: ['Franchise'],
  },
  {
    key: '2',
    type: 'Manual',
    title: 'NEW LEAD INTRO SEQUENCE',
    description: 'This is the default sequence that will be suggested for all uncontacted leads. You can customise each step to suit your sales process.',
    steps: 3,
    duration: '4 days',
    clients: 47,
    stepIcons: ['message', 'file', 'message'],
    status: 'Active',
    folders: [],
  },
  {
    key: '3',
    type: 'Automated',
    title: 'WHATSAPP AUTO-RESPONDER SEQUENCE FOR NEW LEADS',
    description: 'Automatically respond to new leads via WhatsApp to ensure timely follow-ups and improve conversion rates.',
    steps: 1,
    duration: null,
    clients: 0,
    stepIcons: [],
    status: 'Active',
    folders: [],
  },
];

const TypeBadge = ({ type }) => {
  if (type === 'Automated') {
    return (
      <span className="sq-badge sq-badge--automated">
        <WhatsAppOutlined /> Automated
      </span>
    );
  }
  return (
    <span className="sq-badge sq-badge--manual">
      <NodeIndexOutlined /> Manual
    </span>
  );
};

const StepFlow = ({ icons }) => {
  if (!icons?.length) return null;
  const ICON_MAP = { message: <MessageOutlined />, file: <FileTextOutlined /> };
  return (
    <span className="sq-step-flow">
      {icons.map((icon, i) => (
        <span key={i} className="sq-step-group">
          <span className="sq-step-icon">{ICON_MAP[icon]}</span>
          {i < icons.length - 1 && <span className="sq-step-dash">—</span>}
        </span>
      ))}
    </span>
  );
};

const SequencesTab = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const visibleSequences = SEQUENCES;

  const columns = [
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          TITLE <CaretUpOutlined style={{ fontSize: 10 }} />
        </span>
      ),
      dataIndex: 'title',
      key: 'title',
      ellipsis: false,
      onCell: () => ({ style: { verticalAlign: 'middle', padding: '14px 24px' } }),
      render: (text, record) => (
        <div className="sq-title-cell">
          <TypeBadge type={record.type} />
          <div className="sq-title-text">{text}</div>
          {record.description && (
            <div className="sq-title-desc">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'STEPS',
      key: 'steps',
      width: 180,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle' } }),
      render: (_, record) => (
        <div className="sq-steps-cell">
          <span style={{ color: 'var(--sider-text)' }}>
            {record.steps} steps{record.duration ? ` / ${record.duration}` : ''}
          </span>
          {record.stepIcons.length > 0 && <StepFlow icons={record.stepIcons} />}
        </div>
      ),
    },
    {
      title: 'CLIENTS',
      dataIndex: 'clients',
      key: 'clients',
      width: 120,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle' } }),
      render: (text) => (
        <span style={{ color: text === 0 ? 'var(--placeholder)' : 'var(--sider-text)', fontWeight: text === 0 ? 400 : 500 }}>
          {text === 0 ? '-' : text}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle' } }),
      render: (text) => (
        <span className="sq-status-cell">
          <span className="sq-status-dot" /> {text}
        </span>
      ),
    },
  ];

  return (
    <div className="sq-container">
      {/* Automation banner */}
      <div className="sq-banner">
        <ThunderboltOutlined className="sq-banner-icon" />
        <div>
          <div className="sq-banner-title">MANAGE AUTOMATED SEQUENCE TRIGGERS</div>
          <div className="sq-banner-sub">
            Configure lead automation rules to automatically add new leads to specific sequences.
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="clients-table">
        <CommonTable
          columns={columns}
          dataSource={visibleSequences}
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: () => ({ className: 'custom-checkbox' }),
          }}
        />
      </div>
    </div>
  );
};

export default SequencesTab;