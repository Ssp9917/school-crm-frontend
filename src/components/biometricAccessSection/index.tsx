import { useState } from 'react';
import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../searchBar';
import ColumnVisibility from '../columnVisibility';
import CommonTable from '../commonTable';
import { useGetUserAccessQuery } from '../../services/biometric';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface BiometricAccessSectionProps {
  userId?: string;
  addPath?: string;
}

/* ─── Columns ────────────────────────────────────────────────────────── */

const ALL_COLUMNS = [
  {
    title: 'Machine Name',
    key:   'machineName',
    width: 160,
    render: (_: unknown, record: any) =>
      record.machineName || record.name || record.model || record.machine || '-',
  },
  {
    title: 'Device ID',
    key:   'deviceId',
    width: 160,
    render: (_: unknown, record: any) =>
      record.machineId || record.deviceId || record.device_id || '-',
  },
  {
    title: 'Floor',
    key:   'floor',
    width: 130,
    render: (_: unknown, record: any) =>
      record.floor || record.branchFloor || '-',
  },
  {
    title: 'Record Purpose',
    key:   'recordPurpose',
    width: 140,
    render: (_: unknown, record: any) => {
      const purpose = record.recordPurpose || record.purpose || '';
      const upper   = purpose.toString().toUpperCase();
      const color   = upper === 'IN' ? 'green' : upper === 'OUT' ? 'red' : 'default';
      return purpose ? <Tag color={color}>{upper}</Tag> : '-';
    },
  },
  {
    title: 'Branch',
    key:   'branch',
    width: 160,
    render: (_: unknown, record: any) =>
      record.branchName || record.branch?.name || record.branchId?.name || '-',
  },
  {
    title: 'Status',
    key:   'status',
    width: 110,
    render: (_: unknown, record: any) => {
      const status = record.status || '';
      const s      = status.toLowerCase();
      const color  = s === 'active' ? 'green' : s === 'inactive' ? 'red' : 'default';
      return <Tag color={color}>{(status || '-').toUpperCase()}</Tag>;
    },
  },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const BiometricAccessSection = ({ userId, addPath }: BiometricAccessSectionProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    ALL_COLUMNS.forEach(col => { obj[col.key] = true; });
    return obj;
  });

  const { data, isLoading } = useGetUserAccessQuery(userId as string, { skip: !userId });

  const rows: any[] = (() => {
    const d = data as any;
    if (Array.isArray(d))           return d;
    if (Array.isArray(d?.data))     return d.data;
    if (Array.isArray(d?.machines)) return d.machines;
    return [];
  })();

  const filteredData = rows.filter(row =>
    Object.values(row).some(val =>
      String(typeof val === 'object' && val !== null ? JSON.stringify(val) : val)
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  const handleColumnToggle = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const columns = ALL_COLUMNS.filter(col => visibleColumns[col.key]);

  return (
    <div className="biometric-access-section">
      <div className="table-controls">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search biometric access"
        />
        <div className="biometric-access-btn-col">
          {addPath && (
            <Button
              className="biometric-access-btn"
              icon={<PlusOutlined />}
              onClick={() => navigate(addPath)}
            >
              Biometric Access
            </Button>
          )}
          <ColumnVisibility
            columns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <CommonTable
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        rowKey={(record: any) => record._id || record.id || record.machineId || record.deviceId}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default BiometricAccessSection;
