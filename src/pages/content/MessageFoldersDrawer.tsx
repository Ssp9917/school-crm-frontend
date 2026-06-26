import { useState } from 'react';
import { Drawer, Dropdown, Input, Modal } from 'antd';
import { FolderOutlined, PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import './messageFoldersDrawer.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Folder {
  id:    number;
  name:  string;
  count: number;
}

interface Props {
  open:            boolean;
  onClose:         () => void;
  drawerTitle?:    string;
  onFolderSelect?: (folder: Folder) => void;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const BG    = 'var(--card-bg)';
const MUTED = 'var(--muted)';

const INITIAL_FOLDERS: Folder[] = [
  { id: 1, name: 'Franchise',    count: 0 },
  { id: 2, name: 'testing page', count: 0 },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const MessageFoldersDrawer = ({ open, onClose, drawerTitle = 'Message Folders', onFolderSelect }: Props) => {
  const [folders,     setFolders]     = useState<Folder[]>(INITIAL_FOLDERS);
  const [createOpen,  setCreateOpen]  = useState(false);
  const [renameId,    setRenameId]    = useState<number | null>(null);
  const [inputVal,    setInputVal]    = useState('');

  const openCreate = () => { setInputVal(''); setCreateOpen(true); };

  const handleCreate = () => {
    if (!inputVal.trim()) return;
    setFolders(prev => [...prev, { id: Date.now(), name: inputVal.trim(), count: 0 }]);
    setCreateOpen(false);
  };

  const openRename = (f: Folder) => { setRenameId(f.id); setInputVal(f.name); };

  const handleRename = () => {
    if (!inputVal.trim()) return;
    setFolders(prev => prev.map(f => f.id === renameId ? { ...f, name: inputVal.trim() } : f));
    setRenameId(null);
  };

  const deleteFolder = (id: number) => setFolders(prev => prev.filter(f => f.id !== id));

  const menuFor = (folder: Folder) => ({
    items: [
      { key: 'rename', label: 'Rename', icon: <EditOutlined /> },
      { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'rename') openRename(folder);
      if (key === 'delete') deleteFolder(folder.id);
    },
  });

  return (
    <>
      <Drawer
        title={<span style={{ color: 'var(--sider-text)', fontSize: 16, fontWeight: 700 }}>{drawerTitle}</span>}
        closeIcon={<CloseOutlined style={{ color: 'var(--placeholder)' }} />}
        placement="right"
        onClose={onClose}
        open={open}
        styles={{
          wrapper: { background: BG, width: 360 },
          header:  { background: BG, borderBottom: `1px solid ${MUTED}`, padding: '16px 20px' },
          body:    { background: BG, padding: 0, display: 'flex', flexDirection: 'column' },
        }}
      >
        <div className="mfd-body">
          <p className="mfd-section-label">Custom Folders</p>

          <div className="mfd-list">
            {folders.map(f => (
              <div key={f.id} className="mfd-item" onClick={() => { onFolderSelect?.(f); onClose(); }}>
                <FolderOutlined className="mfd-folder-icon" />
                <span className="mfd-name">{f.name}</span>
                <span className="mfd-count">{f.count}</span>
                <Dropdown menu={menuFor(f)} trigger={['click']} placement="bottomRight">
                  <button className="mfd-more" onClick={e => e.stopPropagation()}>
                    <MoreOutlined />
                  </button>
                </Dropdown>
              </div>
            ))}

            {folders.length === 0 && (
              <p className="mfd-empty">No folders yet. Create one below.</p>
            )}
          </div>
        </div>

        <div className="mfd-footer">
          <button className="mfd-create-btn" onClick={openCreate}>
            <PlusOutlined /> CREATE NEW FOLDER
          </button>
        </div>
      </Drawer>

      {/* Create folder modal */}
      <Modal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="Create"
        cancelText="Cancel"
        title="Create New Folder"
        width={400}
        okButtonProps={{ disabled: !inputVal.trim() }}
        styles={{ content: { background: 'var(--card-bg)' }, header: { background: 'var(--card-bg)' } } as any}
      >
        <Input
          placeholder="Folder name..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onPressEnter={handleCreate}
          autoFocus
          style={{ marginTop: 12 }}
        />
      </Modal>

      {/* Rename folder modal */}
      <Modal
        open={renameId !== null}
        onCancel={() => setRenameId(null)}
        onOk={handleRename}
        okText="Save"
        cancelText="Cancel"
        title="Rename Folder"
        width={400}
        okButtonProps={{ disabled: !inputVal.trim() }}
        styles={{ content: { background: 'var(--card-bg)' }, header: { background: 'var(--card-bg)' } } as any}
      >
        <Input
          placeholder="Folder name..."
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onPressEnter={handleRename}
          autoFocus
          style={{ marginTop: 12 }}
        />
      </Modal>
    </>
  );
};

export default MessageFoldersDrawer;
