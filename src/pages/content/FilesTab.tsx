import { useState } from 'react';
import { Input } from 'antd';
import {
  SearchOutlined, FolderOutlined, RightOutlined,
  FilePdfOutlined, LockOutlined, CaretUpOutlined, PaperClipOutlined,
} from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import './filesTab.scss';

const FILES_DATA = [
  { key: '1', title: '1754369424920_ProductBuilder',       visibility: 'Private Content', shared: '-', lastShared: '-', folders: ['Franchise'] },
  { key: '2', title: 'Example - ACME Residences Brochure', visibility: null,              shared: '-', lastShared: '-', folders: [] },
];

const FilesTab = ({ selectedFolder, onOpenFolderDrawer, onClearFolder }) => {
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const searchFiltered = FILES_DATA.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const filtered = selectedFolder
    ? searchFiltered.filter(f => f.folders.includes(selectedFolder.name))
    : searchFiltered;

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
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle' } }),
      render: (text, record) => (
        <div className="ft-title-cell">
          <FilePdfOutlined className="ft-pdf-icon" />
          <div>
            <div className="ft-title">{text}</div>
            {record.visibility && (
              <div className="ft-visibility">
                <LockOutlined className="ft-lock" /> {record.visibility}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'SHARED',
      dataIndex: 'shared',
      key: 'shared',
      width: 120,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle' } }),
      render: (text) => <span style={{ color: 'var(--placeholder)' }}>{text}</span>,
    },
    {
      title: 'LAST SHARED',
      dataIndex: 'lastShared',
      key: 'lastShared',
      width: 180,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle' } }),
      render: (text) => <span style={{ color: 'var(--placeholder)' }}>{text}</span>,
    },
  ];

  return (
    <>
      {/* Filters or folder bar */}
      {selectedFolder ? (
        <div className="ct-folder-bar-full">
          <FolderOutlined className="ct-fb-icon" />
          <span className="ct-fb-name">{selectedFolder.name}</span>
          <button className="ct-fb-close" onClick={onClearFolder}>×</button>
        </div>
      ) : (
        <div className="clients-filters">
          <div className="search-section">
            <Input
              placeholder="Search files"
              prefix={<SearchOutlined style={{ color: '#999' }} />}
              size="large"
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="ct-folder-btn" onClick={onOpenFolderDrawer}>
            <FolderOutlined className="ct-fi" />
            <span className="ct-fl">All Folders</span>
            <RightOutlined className="ct-fa" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="clients-table">
        <CommonTable
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: () => ({ className: 'custom-checkbox' }),
          }}
        />
      </div>

      {/* Welcome / empty state */}
      <div className="ft-empty-state">
        <PaperClipOutlined className="ft-empty-icon" />
        <div className="ft-empty-title">Welcome to your Files</div>
        <div className="ft-empty-sub">
          Easily manage, share, and track your PDF<br />documents all in one place
        </div>
      </div>
    </>
  );
};

export default FilesTab;
