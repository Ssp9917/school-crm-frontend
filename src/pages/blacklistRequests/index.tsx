import { useState, useMemo } from 'react';
import { Tag, Tooltip, Button, Dropdown, Modal, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined, MoreOutlined } from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import SearchBar from '../../components/searchBar';
import StatusTabs from '../../components/statusTabs';
import ColumnVisibility from '../../components/columnVisibility';
import CustomPagination from '../../components/pagination';
import {
  useGetBlacklistRequestsQuery,
  useApproveBlacklistRequestMutation,
  useRejectBlacklistRequestMutation,
  BlacklistRequest,
} from '../../services/blacklist';
import './styles.scss';

interface VisibleColumns {
  requestedBy:    boolean;
  employeeBranch: boolean;
  phoneNumber:    boolean;
  userBranch:     boolean;
  reason:         boolean;
  status:         boolean;
  name:           boolean;
  createdAt:      boolean;
}

interface TableRow {
  key:           string;
  name:          string;
  phoneNumber:   string;
  userBranch:    string;
  employeeBranch: string;
  reason:        string;
  status:        string;
  requestedBy:   string;
  createdAt:     string;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'approved':  return 'green';
    case 'rejected':  return 'red';
    case 'pending':   return 'orange';
    case 'cancelled': return 'default';
    default:          return 'default';
  }
};

const STATUS_TABS = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'approved',  label: 'Approved'  },
  { key: 'rejected',  label: 'Rejected'  },
  { key: 'cancelled', label: 'Cancelled' },
];

const BlacklistRequests = () => {
  const [page,        setPage]        = useState(1);
  const [limit,       setLimit]       = useState(10);
  const [searchText,  setSearchText]  = useState('');
  const [activeTab,   setActiveTab]   = useState('all');

  const [rejectModal,   setRejectModal]   = useState(false);
  const [approveModal,  setApproveModal]  = useState(false);
  const [rejectReason,  setRejectReason]  = useState('');
  const [actionRow,     setActionRow]     = useState<TableRow | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    requestedBy:    true,
    employeeBranch: true,
    phoneNumber:    true,
    userBranch:     true,
    reason:         true,
    status:         true,
    name:           true,
    createdAt:      true,
  });

  const [approveRequest] = useApproveBlacklistRequestMutation();
  const [rejectRequest]  = useRejectBlacklistRequestMutation();

  const { data: apiData, isLoading, refetch } = useGetBlacklistRequestsQuery({
    type:   'blacklist',
    status: activeTab !== 'all' ? activeTab : undefined,
    page,
    limit,
  });

  const tableData = useMemo(() => {
    const rows: BlacklistRequest[] = apiData?.data || [];
    return rows.map(row => ({
      key:            row._id,
      name:           row.userId?.name        || '—',
      phoneNumber:    row.userId?.phoneNumber || '—',
      userBranch:     row.userId?.branchName || (typeof row.branchId === 'object' && row.branchId !== null ? row.branchId.name : '') || '—',
      employeeBranch: row.requestedBy?.branchName || '—',
      reason:         row.reason              || '—',
      status:         row.status              || 'pending',
      requestedBy:    row.requestedBy?.name   || '—',
      createdAt:      row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—',
    }));
  }, [apiData]);

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return tableData;
    const q = searchText.toLowerCase();
    return tableData.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.phoneNumber.includes(q)
    );
  }, [tableData, searchText]);

  const tabsData = STATUS_TABS.map(t => ({
    ...t,
    count: t.key === 'all'
      ? (apiData?.pagination?.total || 0)
      : tableData.filter(r => r.status === t.key).length,
  }));

  const handleApprove = (row: TableRow) => {
    setActionRow(row);
    setApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    try {
      await approveRequest(actionRow!.key).unwrap();
      message.success('Request approved');
      setApproveModal(false);
      setActionRow(null);
      refetch();
    } catch {
      message.error('Failed to approve request');
    }
  };

  const handleReject = (row: TableRow) => {
    setActionRow(row);
    setRejectReason('');
    setRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) { message.error('Please enter rejection reason'); return; }
    try {
      await rejectRequest({ id: actionRow!.key, rejectionReason: rejectReason }).unwrap();
      message.success('Request rejected');
      setRejectModal(false);
      setActionRow(null);
      refetch();
    } catch {
      message.error('Failed to reject request');
    }
  };

const allColumns = [
    {
      title:  'S.No',
      key:    'sno',
      width:  60,
      render: (_: unknown, __: unknown, i: number) => (page - 1) * limit + i + 1,
    },
    {
      title:     'Employee Branch',
      dataIndex: 'employeeBranch',
      key:       'employeeBranch',
      width:     160,
    },
    {
      title:     'Employee Name',
      dataIndex: 'requestedBy',
      key:       'requestedBy',
      width:     160,
    },
    {
      title:     'Reason',
      dataIndex: 'reason',
      key:       'reason',
      width:     220,
      render:    (text: string) => (
        <Tooltip title={text}>
          <span style={{ display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text || '—'}
          </span>
        </Tooltip>
      ),
    },
    {
      title:     'User Name',
      dataIndex: 'name',
      key:       'name',
      width:     160,
    },
    {
      title:     'Phone Number',
      dataIndex: 'phoneNumber',
      key:       'phoneNumber',
      width:     160,
    },
    {
      title:     'User Branch',
      dataIndex: 'userBranch',
      key:       'userBranch',
      width:     160,
    },
    {
      title:     'Date',
      dataIndex: 'createdAt',
      key:       'createdAt',
      width:     150,
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      width:     110,
      align:     'center' as const,
      render:    (status: string) => (
        <Tag color={statusColor(status)}>{status?.toUpperCase() || 'PENDING'}</Tag>
      ),
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  80,
      align:  'center' as const,
      render: (_: unknown, record: TableRow) => {
        if (record.status !== 'pending') return null;
        const items = [
          {
            key:     'approve',
            label:   'Approve',
            icon:    <CheckOutlined />,
            onClick: () => handleApprove(record),
          },
          {
            key:     'reject',
            label:   'Reject',
            icon:    <CloseOutlined />,
            danger:  true,
            onClick: () => handleReject(record),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        );
      },
    },
  ];

  const columns = allColumns.filter(col =>
    col.key === 'sno' || col.key === 'actions' || visibleColumns[col.key as keyof VisibleColumns]
  );

  const handleColumnToggle = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key as keyof VisibleColumns] }));
  };

  return (
    <div className="blacklist-requests-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={(val: string) => { setSearchText(val); setPage(1); }}
            placeholder="Search by name, phone or reason..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(tab: string) => { setActiveTab(tab); setPage(1); }}
            tabs={tabsData}
          />
        </div>
        <div className="right-col">
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          pagination={false}
          rowKey="key"
          scroll={{ x: 1100 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={apiData?.pagination?.total || 0}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />

      <Modal
        open={approveModal}
        title="Approve Blacklist Request"
        okText="Approve"
        cancelText="Cancel"
        onOk={handleApproveConfirm}
        onCancel={() => { setApproveModal(false); setActionRow(null); }}
      >
        <p>
          Approve blacklist request for <strong>{actionRow?.name || '—'}</strong>?
        </p>
      </Modal>

      <Modal
        open={rejectModal}
        title="Reject Blacklist Request"
        okText="Reject"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        onOk={handleRejectConfirm}
        onCancel={() => { setRejectModal(false); setActionRow(null); }}
      >
        <p style={{ marginBottom: 12 }}>
          User: <strong>{actionRow?.name || '—'}</strong>
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default BlacklistRequests;
