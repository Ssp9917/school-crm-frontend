import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, CaretDownOutlined } from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import { ClientDetailRoute } from '../../routes/routepath';
import './followUpsTable.scss';

const STAGE_COLORS = {
  'Follow Up':       { bg: '#f5a623', text: '#fff' },
  'Not Pick':        { bg: '#2c3e6b', text: '#fff' },
  'Converted':       { bg: '#27ae60', text: '#fff' },
  'Renewal':         { bg: '#e91e8c', text: '#fff' },
  'Incoming':        { bg: '#3d8fd4', text: '#fff' },
  'Interested':      { bg: '#9b59b6', text: '#fff' },
  'Hot':             { bg: '#f5a623', text: '#fff' },
  'Visited GC':      { bg: '#8b4ac5', text: '#fff' },
  'Int. For Visit':  { bg: '#b07030', text: '#fff' },
  'Walk-in':         { bg: '#1a4b8c', text: '#fff' },
  'Client Refe...':  { bg: '#e91e8c', text: '#fff' },
  'default':         { bg: '#4a5568', text: '#fff' },
};

const FILTERS = [
  { key: 'dueToday',  label: 'Due Today',  count: 217  },
  { key: 'upcoming',  label: 'Upcoming',   count: 3107 },
  { key: 'overdue',   label: 'Overdue',    count: 1100, red: true },
  { key: 'all',       label: 'All',        count: 845  },
];

const StageBadge = ({ label }) => {
  const style = STAGE_COLORS[label] || STAGE_COLORS.default;
  return (
    <div className="fu-badge" style={{ background: style.bg, color: style.text }}>
      {label}
    </div>
  );
};

const FollowUpsTable = ({ data = [], selectedRowKeys = [], onSelectionChange }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('upcoming');

  const columns = [
    {
      title: (
        <span className="fu-col-title">
          FOLLOW UP <CaretDownOutlined style={{ fontSize: 11 }} />
        </span>
      ),
      dataIndex: 'followUp',
      key: 'followUp',
      width: 180,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text) => <span className="fu-followup-text">{text || '—'}</span>,
    },
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text, record) => (
        <span
          className="fu-name"
          onClick={() => navigate(`${ClientDetailRoute}/${record.key}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'DETAILS',
      key: 'details',
      onCell: () => ({ style: { whiteSpace: 'nowrap', maxWidth: 600, overflow: 'hidden' } }),
      render: (_, record) => (
        <div className="fu-details-row">
          {record.assignedTo && record.assignedTo !== '—' && (
            <div className="fu-assignee-badge">
              <span>↗</span>
              <span className="fu-assignee-name">{record.assignedTo}</span>
            </div>
          )}
          {record.leadStage && record.leadStage !== '—' && (
            <StageBadge label={record.leadStage} />
          )}
          {record.notes && record.notes !== '-' && record.notes !== '—' && (
            <span className="fu-notes-text">{record.notes}</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fu-wrap">
      {/* Filter Banner */}
      <div className="fu-banner">
        {FILTERS.map(f => (
          <div
            key={f.key}
            className={`fu-filter-item${activeFilter === f.key ? ' fu-filter-item--active' : ''}${f.red ? ' fu-filter-item--red' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            <CalendarOutlined className="fu-filter-icon" />
            <span className="fu-filter-label">
              {f.label}&nbsp;
              <span className="fu-filter-count">({f.count})</span>
            </span>
          </div>
        ))}
      </div>

      <CommonTable
        columns={columns}
        dataSource={data}
        scroll={{ x: 'max-content' }}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectionChange,
          getCheckboxProps: () => ({ className: 'custom-checkbox' }),
        }}
      />
    </div>
  );
};

export default FollowUpsTable;
