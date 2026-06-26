import { useNavigate } from 'react-router-dom';
import { CaretDownOutlined } from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import { ClientDetailRoute } from '../../routes/routepath';
import './recentlyViewedTable.scss';

const STAGE_COLORS = {
  'Follow Up':      { bg: '#f5a623', text: '#fff' },
  'Not Pick':       { bg: '#2c3e6b', text: '#fff' },
  'Converted':      { bg: '#27ae60', text: '#fff' },
  'Renewal':        { bg: '#e91e8c', text: '#fff' },
  'Incoming':       { bg: '#3d8fd4', text: '#fff' },
  'Interested':     { bg: '#9b59b6', text: '#fff' },
  'Hot':            { bg: '#f5a623', text: '#fff' },
  'Booked Ap...':   { bg: '#4a5568', text: '#fff' },
  'GC Branch':      { bg: '#1a4b8c', text: '#fff' },
  'Prospect__':     { bg: '#1a4b8c', text: '#fff' },
  'Refrence':       { bg: '#e91e8c', text: '#fff' },
  'location Is...': { bg: '#b07030', text: '#fff' },
  'default':        { bg: '#4a5568', text: '#fff' },
};

const MAX_BADGES = 2;

const DetailsBadges = ({ assignedTo, leadStage, groups, notes }) => {
  const badges = [];
  if (leadStage && leadStage !== '—') badges.push({ label: leadStage });
  if (groups && groups !== '—') badges.push({ label: groups });

  const visible = badges.slice(0, MAX_BADGES);
  const extra = badges.length - MAX_BADGES;

  return (
    <div className="rv-details-row">
      {assignedTo && assignedTo !== '—' && (
        <div className="rv-assignee-badge">
          <span>↗</span>
          <span className="rv-assignee-name">{assignedTo}</span>
        </div>
      )}
      {visible.map((b, i) => {
        const style = STAGE_COLORS[b.label] || STAGE_COLORS.default;
        return (
          <div key={i} className="rv-stage-badge" style={{ background: style.bg, color: style.text }}>
            {b.label}
          </div>
        );
      })}
      {extra > 0 && (
        <div className="rv-more-badge">+{extra} more</div>
      )}
      {notes && notes !== '-' && notes !== '—' && (
        <span className="rv-notes-text">{notes}</span>
      )}
    </div>
  );
};

const RecentlyViewedTable = ({ data = [], selectedRowKeys = [], onSelectionChange }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text, record) => (
        <span
          className="rv-name"
          onClick={() => navigate(`${ClientDetailRoute}/${record.key}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'DETAILS',
      key: 'details',
      width: 480,
      onCell: () => ({ style: { whiteSpace: 'nowrap', overflow: 'hidden' } }),
      render: (_, record) => (
        <DetailsBadges
          assignedTo={record.assignedTo}
          leadStage={record.leadStage}
          groups={record.groups}
          notes={record.notes}
        />
      ),
    },
    {
      title: 'VIEWED ITEM',
      dataIndex: 'viewedItem',
      key: 'viewedItem',
      width: 220,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text) => <span className="rv-viewed-item">{text || '—'}</span>,
    },
    {
      title: (
        <span className="rv-col-title">
          LAST VIEWED <CaretDownOutlined style={{ fontSize: 11 }} />
        </span>
      ),
      dataIndex: 'lastViewed',
      key: 'lastViewed',
      width: 180,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text) => <span className="rv-last-viewed">{text || '—'}</span>,
    },
  ];

  return (
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
  );
};

export default RecentlyViewedTable;
