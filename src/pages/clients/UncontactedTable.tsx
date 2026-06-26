import { useNavigate } from 'react-router-dom';
import { HolderOutlined, CaretDownOutlined } from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import { ClientDetailRoute } from '../../routes/routepath';

const UncontactedTable = ({ data = [], selectedRowKeys = [], onSelectionChange }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text, record) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate(`${ClientDetailRoute}/${record.key}`)}
          className="client-name-cell"
        >
          <HolderOutlined style={{ color: 'var(--placeholder)', fontSize: 14 }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'SOURCE',
      dataIndex: 'leadSource',
      key: 'leadSource',
      width: 160,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text) => (
        <span style={{ color: (!text || text === '—') ? 'var(--placeholder)' : 'var(--sider-text)' }}>
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'DETAILS',
      key: 'details',
      width: 420,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {record.assignedTo && record.assignedTo !== '—' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#4a5568', borderRadius: 4, padding: '3px 8px',
              fontSize: 13, color: '#fff', maxWidth: 120, overflow: 'hidden',
            }}>
              <span style={{ fontSize: 11 }}>↗</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {record.assignedTo}
              </span>
            </div>
          )}
          {record.location && (
            <span style={{ color: 'var(--sider-text)', fontSize: 14 }}>{record.location}</span>
          )}
        </div>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          DATE ADDED <CaretDownOutlined style={{ fontSize: 11 }} />
        </span>
      ),
      dataIndex: 'dateAdded',
      key: 'dateAdded',
      width: 180,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text) => <span style={{ color: 'var(--sider-text)' }}>{text || '—'}</span>,
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

export default UncontactedTable;
