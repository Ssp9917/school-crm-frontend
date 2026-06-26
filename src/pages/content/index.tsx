import { useState } from 'react';
import { Button, Tabs, Input, Modal } from 'antd';
import {
  PlusOutlined, UploadOutlined, SearchOutlined, FolderOutlined, RightOutlined,
  LockOutlined, CaretUpOutlined,
  CloseOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import SequencesTab from './SequencesTab';
import FilesTab from './FilesTab';
import PagesTab from './PagesTab';
import UploadFileModal from './UploadFileModal';
import NewMessageModal from './NewMessageModal';
import NewSequenceModal from './NewSequenceModal';
import NewPageModal from './NewPageModal';
import MessageFoldersDrawer from './MessageFoldersDrawer';
import './styles.scss';

const { TabPane } = Tabs;

const MESSAGES_DATA = [
  { key: '1', title: 'Copy of FITCLUB',         visibility: 'Private Content', preview: "Hi @clientName, It's Sunday, and it's time to work hard! You are...", sent: '-',     lastSent: '-',                 folders: ['Franchise'] },
  { key: '2', title: 'Copy of FITCLUB (1)',      visibility: 'Private Content', preview: "Hi @clientName, It's Sunday, and it's time to work hard! You are...", sent: '-',     lastSent: '-',                 folders: ['Franchise'] },
  { key: '3', title: 'Copy of FITCLUB (2)',      visibility: 'Private Content', preview: "Hi @clientName, It's Sunday, and it's time to work hard! You are...", sent: '-',     lastSent: '-',                 folders: [] },
  { key: '4', title: 'Copy of FITCLUB (3)',      visibility: 'Private Content', preview: "Hi @clientName, It's Sunday, and it's time to work hard! You are...", sent: '-',     lastSent: '-',                 folders: [] },
  { key: '5', title: 'FITCLUB',                  visibility: 'Private Content', preview: "Hi @clientName, It's Sunday, and it's time to work hard! You are...", sent: '-',     lastSent: '-',                 folders: ['testing page'] },
  { key: '6', title: 'Follow Up - FitClub',     visibility: 'Private Content', preview: "Hi @clientName, Hope you are doing well, I wanted to check if ...",  sent: '1 time', lastSent: 'Jul 24 - 10:32 AM', folders: [] },
  { key: '7', title: 'Follow Up To Non Member',  visibility: 'Private Content', preview: "Hi @clientName, Starting at the gym can be a life-changing de...",  sent: '-',     lastSent: '-',                 folders: [] },
];

const TABS = [
  { key: 'sequences', label: 'Sequences' },
  { key: 'messages',  label: 'Messages' },
  { key: 'files',     label: 'Files' },
  { key: 'pages',     label: 'Pages' },
];

const TAB_BTN_LABELS = {
  sequences: 'NEW SEQUENCE',
  messages:  'NEW MESSAGE',
  files:     'UPLOAD FILE',
  pages:     'NEW PAGE',
};

const Content = () => {
  const [activeTab, setActiveTab]             = useState('messages');
  const [search, setSearch]                   = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fullscreenMode, setFullscreenMode]   = useState(false);
  const [uploadModalOpen, setUploadModalOpen]     = useState(false);
  const [msgModalOpen, setMsgModalOpen]           = useState(false);
  const [seqModalOpen, setSeqModalOpen]           = useState(false);
  const [pageModalOpen, setPageModalOpen]         = useState(false);
  const [folderDrawerOpen, setFolderDrawerOpen]       = useState(false);
  const [selectedMsgFolder, setSelectedMsgFolder]     = useState(null);
  const [pagesFolderOpen, setPagesFolderOpen]         = useState(false);
  const [selectedPagesFolder, setSelectedPagesFolder] = useState(null);
  const [filesFolderOpen, setFilesFolderOpen]         = useState(false);
  const [selectedFilesFolder, setSelectedFilesFolder] = useState(null);

  const filtered = MESSAGES_DATA.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.preview.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = !selectedMsgFolder || d.folders.includes(selectedMsgFolder.name);
    return matchesSearch && matchesFolder;
  });

  const columns = [
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          TITLE <CaretUpOutlined style={{ fontSize: 10 }} />
        </span>
      ),
      dataIndex: 'title',
      key: 'title',
      width: 260,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'top' } }),
      render: (text, record) => (
        <div style={{ cursor: 'pointer' }} className="content-name-cell">
          <div className="ct-row-title">{text}</div>
          <div className="ct-row-visibility">
            <LockOutlined className="ct-lock-icon" /> {record.visibility}
          </div>
        </div>
      ),
    },
    {
      title: 'MESSAGE PREVIEW',
      dataIndex: 'preview',
      key: 'preview',
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'top' } }),
      render: (text) => <span style={{ color: 'var(--placeholder)' }}>{text}</span>,
    },
    {
      title: 'SENT',
      dataIndex: 'sent',
      key: 'sent',
      width: 100,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'top' } }),
      render: (text) => <span style={{ color: 'var(--placeholder)' }}>{text}</span>,
    },
    {
      title: 'LAST SENT',
      dataIndex: 'lastSent',
      key: 'lastSent',
      width: 180,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'top' } }),
      render: (text) => <span style={{ color: 'var(--placeholder)' }}>{text}</span>,
    },
  ];

  const tableNode = (
    <CommonTable
      columns={columns}
      dataSource={activeTab === 'messages' ? filtered : []}
      scroll={{ x: 'max-content' }}
      rowSelection={{
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        getCheckboxProps: () => ({ className: 'custom-checkbox' }),
      }}
    />
  );

  return (
    <div className="content-page">

      {/* Header */}
      <div className="clients-header">
        <h1>Content</h1>
        <Button
          type="primary"
          icon={activeTab === 'files' ? <UploadOutlined /> : <PlusOutlined />}
          size="large"
          className="add-client-btn"
          onClick={() => {
            if (activeTab === 'files') setUploadModalOpen(true);
            if (activeTab === 'messages') setMsgModalOpen(true);
            if (activeTab === 'sequences') setSeqModalOpen(true);
            if (activeTab === 'pages') setPageModalOpen(true);
          }}
        >
          {TAB_BTN_LABELS[activeTab]}
        </Button>
      </div>

      {/* Tabs */}
      <div className="clients-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {TABS.map(t => (
            <TabPane tab={t.label} key={t.key} />
          ))}
        </Tabs>
      </div>

      {/* Tab content */}
      {activeTab === 'sequences' ? (
        <SequencesTab />
      ) : activeTab === 'files' ? (
        <FilesTab
          selectedFolder={selectedFilesFolder}
          onOpenFolderDrawer={() => setFilesFolderOpen(true)}
          onClearFolder={() => setSelectedFilesFolder(null)}
        />
      ) : activeTab === 'pages' ? (
        <PagesTab
          selectedFolder={selectedPagesFolder}
          onOpenFolderDrawer={() => setPagesFolderOpen(true)}
          onClearFolder={() => setSelectedPagesFolder(null)}
        />
      ) : (
        <>
          {/* Filters or folder bar */}
          {selectedMsgFolder ? (
            <div className="ct-folder-bar-full">
              <FolderOutlined className="ct-fb-icon" />
              <span className="ct-fb-name">{selectedMsgFolder.name}</span>
              <button className="ct-fb-close" onClick={() => setSelectedMsgFolder(null)}>×</button>
            </div>
          ) : (
            <div className="clients-filters">
              <div className="search-section">
                <Input
                  placeholder="Search messages"
                  prefix={<SearchOutlined style={{ color: '#999' }} />}
                  size="large"
                  className="search-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="ct-folder-btn" onClick={() => setFolderDrawerOpen(true)}>
                <FolderOutlined className="ct-fi" />
                <span className="ct-fl">All Folders</span>
                <RightOutlined className="ct-fa" />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="clients-table">
            {tableNode}
          </div>
        </>
      )}

      {/* Selection toolbar */}
      {selectedRowKeys.length > 0 && (
        <div className="selection-toolbar">
          <div className="selection-info">
            <span className="selection-count">{selectedRowKeys.length} Selected</span>
            <CloseOutlined className="close-icon" onClick={() => setSelectedRowKeys([])} />
          </div>
          <div className="selection-actions">
            <Button icon={<EditOutlined />} className="action-btn">Edit</Button>
            <Button icon={<UnorderedListOutlined />} className="action-btn">Folders</Button>
            <Button icon={<DeleteOutlined />} className="action-btn delete-btn">Delete</Button>
          </div>
        </div>
      )}

      <MessageFoldersDrawer
        open={folderDrawerOpen}
        onClose={() => setFolderDrawerOpen(false)}
        onFolderSelect={f => setSelectedMsgFolder(f)}
      />
      <MessageFoldersDrawer
        drawerTitle="Page Folders"
        open={pagesFolderOpen}
        onClose={() => setPagesFolderOpen(false)}
        onFolderSelect={f => setSelectedPagesFolder(f)}
      />
      <MessageFoldersDrawer
        drawerTitle="File Folders"
        open={filesFolderOpen}
        onClose={() => setFilesFolderOpen(false)}
        onFolderSelect={f => setSelectedFilesFolder(f)}
      />
      <UploadFileModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
      <NewSequenceModal open={seqModalOpen} onClose={() => setSeqModalOpen(false)} />
      <NewMessageModal open={msgModalOpen} onClose={() => setMsgModalOpen(false)} />
      <NewPageModal open={pageModalOpen} onClose={() => setPageModalOpen(false)} />

      {/* Fullscreen modal */}
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
          <CommonTable
            columns={columns}
            dataSource={activeTab === 'messages' ? filtered : []}
            scroll={{ x: 'max-content', y: 'calc(100vh - 250px)' }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              getCheckboxProps: () => ({ className: 'custom-checkbox' }),
            }}
          />
        </div>
      </Modal>

    </div>
  );
};

export default Content;
