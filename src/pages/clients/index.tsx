import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tabs, Input, Select, Modal } from 'antd';
import { useCountries } from '../../hooks/useCountries';
import { PlusOutlined, SearchOutlined, TeamOutlined, FilterOutlined, SettingOutlined, FullscreenOutlined, CloseOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import FilterDrawer from '../../components/filterDrawer';
import CommonTable from '../../components/commonTable';
import CustomPagination from '../../components/pagination';
import UncontactedTable from './UncontactedTable';
import FollowUpsTable from './FollowUpsTable';
import RecentlyViewedTable from './RecentlyViewedTable';
import AddClientModal from '../../components/addClientModal';
import { ClientDetailRoute } from '../../routes/routepath';
import { useGetLeadsQuery } from '../../services/leads';
import './styles.scss';

const { TabPane } = Tabs;

const formatStage = (value?: string | null) => {
  if (!value) return '-';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/* Stage metadata — mirrors the lead-stage dropdown in clientDetail (icon + color + label) */
const STAGE_META: Record<string, { label: string; color: string; icon: string }> = {
  new:            { label: 'New',            color: '#3d8fd4', icon: '🆕' },
  interested:     { label: 'Interested',     color: '#9b59b6', icon: '⬜' },
  meeting_booked: { label: 'Meeting Booked', color: '#f5a623', icon: '🟧' },
  proposal:       { label: 'Proposal',       color: '#9b59b6', icon: '🟪' },
  negotiating:    { label: 'Negotiating',    color: '#3498db', icon: '🟦' },
  closed_won:     { label: 'Closed - Won',   color: '#2ecc71', icon: '✅' },
  closed_lost:    { label: 'Closed - Lost',  color: '#e74c3c', icon: '❌' },
  uncontactable:  { label: 'Uncontactable',  color: '#7f8c8d', icon: '✖'  },
  converted:      { label: 'Converted',      color: '#27ae60', icon: '✅' },
};

const normalizeStage = (value?: string | null) =>
  String(value ?? '').toLowerCase().trim().replace(/[\s-]+/g, '_');

const StageTag = ({ value }: { value?: string | null }) => {
  if (!value || value === '-') return <span style={{ color: 'var(--placeholder)' }}>-</span>;
  const meta = STAGE_META[normalizeStage(value)];
  const label = meta?.label ?? formatStage(value);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--sider-text)',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
      }}
    >
      {meta?.icon && <span style={{ fontSize: 14, lineHeight: 1 }}>{meta.icon}</span>}
      {label}
    </span>
  );
};

const Clients = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { dialCodeMap } = useCountries();
  const { data: leadsData, isLoading } = useGetLeadsQuery({
    search: search || undefined,
    page,
    limit: pageSize,
  });

  const pagination = leadsData?.pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const data = (leadsData?.leads ?? leadsData?.data ?? []).map((lead) => ({
    key: lead._id,
    name: lead.name ?? '-',
    assignedTo: lead.assignedTo?.name ?? lead.assignedTo ?? '-',
    notes: lead.description ?? lead.notes ?? '-',
    phoneNumber: lead.number ?? lead.phoneNumber ?? '-',
    countryCode: lead.countryCode ?? null,
    email: lead.email ?? '-',
    dateAdded: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-',
    lastActivity: lead.lastActivity ?? '-',
    followUp: lead.followUp ?? '-',
    groups: lead.groups ?? '-',
    leadStage: formatStage(lead.status ?? lead.leadStage),
    leadSource: lead.source ?? lead.leadSource ?? '-',
    opportunitySize: lead.opportunitySize ?? '-',
  }));

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
      render: (text, record) => (
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', cursor: 'pointer' }}
          onClick={() => navigate(`${ClientDetailRoute}/${record.key}`)}
          className="client-name-cell"
        >
          <span>{text}</span>
          <span style={{ color: '#999', fontSize: '16px' }}>›</span>
        </div>
      ),
    },
    {
      title: 'ASSIGNED TO',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 200,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <div style={{
            width: 24,
            height: 24,
            background: '#666',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px'
          }}>
            ↗
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'LEAD SOURCE',
      dataIndex: 'leadSource',
      key: 'leadSource',
      width: 140,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'PHONE NUMBER',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 180,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (phone: string, record: any) => {
        const info = record.countryCode ? dialCodeMap.get(record.countryCode) : null;
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {info ? (
              <>
                {info.flag && <img src={info.flag} alt={info.name} style={{ width: 16, height: 12, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} />}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{info.dial || record.countryCode}</span>
              </>
            ) : record.countryCode ? (
              <span style={{ fontSize: 11, opacity: 0.7 }}>{record.countryCode}</span>
            ) : null}
            <span>{phone || '—'}</span>
          </span>
        );
      },
    },
    {
      title: 'NOTES',
      dataIndex: 'notes',
      key: 'notes',
      width: 350,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
      render: (text) => <span style={{ color: "#999", whiteSpace: 'nowrap' }}>{text}</span>,
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'DATE ADDED',
      dataIndex: 'dateAdded',
      key: 'dateAdded',
      width: 120,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'LAST ACTIVITY',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      width: 130,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'FOLLOW UP',
      dataIndex: 'followUp',
      key: 'followUp',
      width: 120,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'GROUPS',
      dataIndex: 'groups',
      key: 'groups',
      width: 120,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
    {
      title: 'LEAD STAGE',
      dataIndex: 'leadStage',
      key: 'leadStage',
      width: 140,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
      render: (value: string) => <StageTag value={value} />,
    },
    {
      title: 'OPPORTUNITY SIZE',
      dataIndex: 'opportunitySize',
      key: 'opportunitySize',
      width: 160,
      ellipsis: false,
      onCell: () => ({
        style: { whiteSpace: 'nowrap' }
      }),
    },
  ];


  const tabs = [
    { key: 'all', label: 'All Clients', count: pagination?.total ?? data.length },
    { key: 'uncontacted', label: 'Uncontacted', count: 0 },
    { key: 'followUps', label: 'Follow Ups', count: 0 },
    { key: 'recentlyViewed', label: 'Recently Viewed Content', count: 0 },
  ];

  return (
    <div className="clients-page">
      <div className="clients-header">
        <h1>Clients</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large" 
          className="add-client-btn"
          onClick={() => setAddClientModalOpen(true)}
        >
          ADD NEW CLIENT
        </Button>
      </div>

      <div className="clients-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {tabs.map(tab => (
            <TabPane tab={tab.label} key={tab.key} />
          ))}
        </Tabs>
      </div>

      {activeTab !== 'uncontacted' && activeTab !== 'followUps' && activeTab !== 'recentlyViewed' && <div className="clients-filters">
        <div className="search-section">
          <Input
            placeholder="Search Clients"
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            size="large"
            className="search-input"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="filter-section">
          <Select
            defaultValue="all"
            size="large"
            className="team-select"
            suffixIcon={<TeamOutlined />}
          >
            <Select.Option value="all">All Team Members</Select.Option>
          </Select>
          <Button
            size="large"
            className="filter-btn"
            icon={<FilterOutlined />}
            onClick={() => setFilterDrawerOpen(true)}
          >
            Filter
          </Button>
          <Button icon={<SettingOutlined />} size="large" className="icon-btn" />
          <Button 
            icon={<FullscreenOutlined />} 
            size="large" 
            className="icon-btn"
            onClick={() => setFullscreenMode(true)}
          />
        </div>
      </div>}

      <div className="clients-table">
        {activeTab === 'uncontacted' ? (
          <UncontactedTable
            data={data}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
          />
        ) : activeTab === 'recentlyViewed' ? (
          <RecentlyViewedTable
            data={data}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
          />
        ) : activeTab === 'followUps' ? (
          <FollowUpsTable
            data={data}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
          />
        ) : (
          <CommonTable
            columns={columns}
            dataSource={data}
            loading={isLoading}
            scroll={{ x: 'max-content' }}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: () => ({ className: 'custom-checkbox' }),
            }}
          />
        )}
      </div>

      {activeTab === 'all' && (
        <CustomPagination
          current={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          onPageChange={(newPage: number) => setPage(newPage)}
          onPageSizeChange={(newLimit: number) => { setPageSize(newLimit); setPage(1); }}
        />
      )}

      {selectedRowKeys.length > 0 && (
        <div className="selection-toolbar">
          <div className="selection-info">
            <span className="selection-count">{selectedRowKeys.length} Selected</span>
            <CloseOutlined 
              className="close-icon" 
              onClick={() => setSelectedRowKeys([])}
            />
          </div>
          <div className="selection-actions">
            <Button icon={<EditOutlined />} className="action-btn">
              Reassign
            </Button>
            <Button icon={<UnorderedListOutlined />} className="action-btn">
              Custom Fields
            </Button>
            <Button icon={<DeleteOutlined />} className="action-btn delete-btn">
              Delete
            </Button>
          </div>
        </div>
      )}

      <FilterDrawer open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />
      <AddClientModal open={addClientModalOpen} onClose={() => setAddClientModalOpen(false)} />

      <Modal
        open={fullscreenMode}
        onCancel={() => setFullscreenMode(false)}
        footer={null}
        width="95vw"
        style={{ top: 20 }}
        closeIcon={<CloseOutlined style={{ fontSize: '24px' }} />}
        className="fullscreen-table-modal"
      >
        <div className="fullscreen-table-content">
          {/* <h2 className="fullscreen-title">Clients Table</h2> */}
          <CommonTable
            columns={columns}
            dataSource={data}
            scroll={{ x: 'max-content', y: 'calc(100vh - 250px)' }}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: () => ({
                className: 'custom-checkbox',
              }),
            }}
          />
          <CustomPagination
            current={pagination?.page ?? page}
            pageSize={pagination?.limit ?? pageSize}
            total={pagination?.total ?? 0}
            onPageChange={(newPage: number) => setPage(newPage)}
            onPageSizeChange={(newLimit: number) => { setPageSize(newLimit); setPage(1); }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Clients;
