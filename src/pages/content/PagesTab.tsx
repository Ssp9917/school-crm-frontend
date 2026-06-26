import { useState } from 'react';
import { Input } from 'antd';
import {
  SearchOutlined, FolderOutlined, RightOutlined,
  LockOutlined, CaretUpOutlined, FileTextOutlined,
} from '@ant-design/icons';
import CommonTable from '../../components/commonTable';
import './pagesTab.scss';

const PAGES_DATA = [
  { key: '1', title: "Celebrating Women's Day",  visibility: null,              shared: '53 times',  lastShared: 'Mar 07 - 05:34 PM', thumb: '#b8860b', folders: [] },
  { key: '2', title: "Celebrating Women's Day",  visibility: null,              shared: '-',         lastShared: '-',                 thumb: '#7a5c10', folders: [] },
  { key: '3', title: 'Fitclub Golf Course Road',  visibility: null,              shared: '626 times', lastShared: 'May 14 - 09:19 AM', thumb: '#0d0d1a', folders: [] },
  { key: '4', title: 'gallery',                   visibility: 'Private Content', shared: '-',         lastShared: '-',                 thumb: '#6b48cc', folders: ['testing page'] },
  { key: '5', title: 'GROUP CLASSES BY FITCLUB',  visibility: null,              shared: '63 times',  lastShared: 'Jan 07 - 09:20 PM', thumb: '#111111', folders: [] },
  { key: '6', title: 'Hatha Yoga Workshop',       visibility: null,              shared: '-',         lastShared: '-',                 thumb: '#2d5016', folders: ['Franchise'] },
  { key: '7', title: 'bellatesting',              visibility: null,              shared: '-',         lastShared: '-',                 thumb: '#1a1a2e', folders: [] },
];

const Thumbnail = ({ color, title }) => (
  <div className="pt-thumb" style={{ background: color }}>
    <span className="pt-thumb-label">{title.charAt(0).toUpperCase()}</span>
  </div>
);

const PagesTab = ({ selectedFolder, onOpenFolderDrawer, onClearFolder }) => {
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const searchFiltered = PAGES_DATA.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const folderFiltered = selectedFolder
    ? searchFiltered.filter(p => p.folders.includes(selectedFolder.name))
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
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '10px 24px' } }),
      render: (text, record) => (
        <div className="pt-title-cell">
          <Thumbnail color={record.thumb} title={text} />
          <div>
            <div className="pt-title">{text}</div>
            {record.visibility && (
              <div className="pt-visibility">
                <LockOutlined className="pt-lock" /> {record.visibility}
              </div>
            )}
            {record.folders.length > 0 && (
              <div className="pt-folder-chips">
                {record.folders.map(f => (
                  <span key={f} className="pt-folder-chip">
                    <FolderOutlined className="pt-chip-icon" />
                    {f.length > 10 ? f.slice(0, 10) + '…' : f}
                  </span>
                ))}
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
      width: 140,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle' } }),
      render: (text) => (
        <span style={{ color: text === '-' ? 'var(--placeholder)' : 'var(--sider-text)', fontWeight: text === '-' ? 400 : 500 }}>
          {text}
        </span>
      ),
    },
    {
      title: 'LAST SHARED',
      dataIndex: 'lastShared',
      key: 'lastShared',
      width: 200,
      ellipsis: false,
      onCell: () => ({ style: { whiteSpace: 'nowrap', verticalAlign: 'middle' } }),
      render: (text) => (
        <span style={{ color: text === '-' ? 'var(--placeholder)' : 'var(--sider-text)' }}>
          {text}
        </span>
      ),
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
              placeholder="Search pages"
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
          dataSource={folderFiltered}
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: () => ({ className: 'custom-checkbox' }),
          }}
        />
      </div>

      {/* Welcome section — shown when folder selected */}
      {selectedFolder && (
        <div className="pt-welcome">
          <FileTextOutlined className="pt-welcome-icon" />
          <p className="pt-welcome-title">Welcome to your Pages</p>
          <p className="pt-welcome-desc">
            Create, share, and track views on your<br />
            custom pages to showcase your products,<br />
            services, or events
          </p>
          <span className="pt-welcome-link">LEARN MORE</span>
        </div>
      )}
    </>
  );
};

export default PagesTab;
