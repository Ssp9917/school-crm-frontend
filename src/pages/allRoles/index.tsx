import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, Tag, message, Modal, Switch } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useGetRolesQuery, useDeleteRoleMutation, useUpdateRoleStatusMutation } from "../../services/role";
import CustomPagination from "../../components/pagination";
import StatusTabs from "../../components/statusTabs";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import AddButton from "../../components/addButton";
import { AddRoleRoute, EditRoleRoute } from "../../routes/routepath";
import CommonTable from "../../components/commonTable";
import usePermissions from "../../hooks/usePermissions";
import "./styles.scss";

const { confirm } = Modal;

/* ─── Types ──────────────────────────────────────────────────────────── */

interface RoleRecord {
  _id?:         string;
  id?:          string;
  name?:        string;
  level?:       number;
  status?:      string;
  permissions?: unknown[];
}

interface VisibleColumns {
  name:             boolean;
  level:            boolean;
  permissionsCount: boolean;
  status:           boolean;
  actions:          boolean;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const AllRoles = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [page,       setPage]       = useState(1);
  const [limit,      setLimit]      = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeTab,  setActiveTab]  = useState("all");

  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name:             true,
    level:            true,
    permissionsCount: true,
    status:           true,
    actions:          true,
  });

  const { data: rolesData, isLoading }          = useGetRolesQuery(undefined);
  const [deleteRole,       { isLoading: deleting }]        = useDeleteRoleMutation();
  const [updateRoleStatus, { isLoading: updatingStatus }]  = useUpdateRoleStatusMutation();

  const handleStatusToggle = async (record: RoleRecord, _checked: boolean) => {
    try {
      await (updateRoleStatus as any)(record?._id).unwrap();
    } catch {
      // silently ignored
    }
  };

  const handleEdit = (record: RoleRecord) => {
    if (record?._id) {
      navigate(`${EditRoleRoute}/${record._id}`);
    } else {
      message.error('Role ID not found');
    }
  };

  const handleDelete = (record: RoleRecord) => {
    confirm({
      title:      'Are you sure you want to delete this role?',
      icon:       <ExclamationCircleOutlined />,
      content:    `Role: ${record.name}`,
      okText:     'Yes, Delete',
      okType:     'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await (deleteRole as any)(record._id).unwrap();
          message.success('Role deleted successfully');
        } catch (error) {
          message.error((error as any)?.data?.message || 'Failed to delete role');
        }
      },
    });
  };

  const allColumns = [
    {
      title:     'Role Name',
      dataIndex: 'name',
      key:       'name',
      width:     200,
      render:    (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title:     'Level',
      dataIndex: 'level',
      key:       'level',
      width:     100,
      align:     'center' as const,
      render:    (level: number) => <Tag color="blue">Level {level || 'N/A'}</Tag>,
    },
    {
      title:     'Permissions',
      dataIndex: 'permissions',
      key:       'permissionsCount',
      width:     150,
      align:     'center' as const,
      render:    (permissions: unknown[]) => (
        <span>{Array.isArray(permissions) ? permissions.length : 0} permissions</span>
      ),
    },
    {
      title:     'Status',
      dataIndex: 'status',
      key:       'status',
      width:     150,
      align:     'center' as const,
      render:    (status: string, record: RoleRecord) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {hasPermission('3-status') ? (
            <Switch
              checked={status === 'active'}
              onChange={(checked) => handleStatusToggle(record, checked)}
              loading={updatingStatus}
              size="small"
              checkedChildren="On"
              unCheckedChildren="Off"
              style={{ minWidth: 40, width: 40 }}
            />
          ) : (
            <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>
          )}
        </div>
      ),
    },
    {
      title:  'Actions',
      key:    'actions',
      width:  100,
      align:  'center' as const,
      render: (_: unknown, record: RoleRecord) => {
        const menuItems = [
          ...(hasPermission('3-edit')   ? [{ key: 'edit',   label: 'Edit',   icon: <EditOutlined />,   onClick: () => handleEdit(record)   }] : []),
          ...(hasPermission('3-delete') ? [{ key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(record) }] : []),
        ];
        if (!menuItems.length) return null;
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        );
      },
    },
  ];

  const allRoles: RoleRecord[] = (rolesData as any)?.data || [];

  const filteredData = useMemo(() => {
    return allRoles.filter(item => {
      const matchesSearch = searchText === '' || item.name?.toLowerCase().includes(searchText.toLowerCase());
      const matchesTab    = activeTab === 'all'
        || (activeTab === 'active'   && item.status === 'active')
        || (activeTab === 'inactive' && item.status !== 'active');
      return matchesSearch && matchesTab;
    });
  }, [allRoles, searchText, activeTab]);

  const paginatedData = useMemo<RoleRecord[]>(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  const tabsData = [
    { key: 'all',      label: 'All',      count: allRoles.length },
    { key: 'active',   label: 'Active',   count: allRoles.filter(r => r.status === 'active').length  },
    { key: 'inactive', label: 'Inactive', count: allRoles.filter(r => r.status !== 'active').length  },
  ];

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof VisibleColumns],
    }));
  };

  const columns = allColumns.filter(col => visibleColumns[col.key as keyof VisibleColumns]);

  return (
    <div className="all-roles-page">
      <div className="header-section">
        <div className="left-col">
          <SearchBar
            value={searchText}
            onChange={(val: string) => { setSearchText(val); setPage(1); }}
            placeholder="Search roles..."
          />
          <StatusTabs
            activeTab={activeTab}
            onTabChange={(key: string) => { setActiveTab(key); setPage(1); }}
            tabs={tabsData}
          />
        </div>
        <div className="right-col">
          {hasPermission('3-add') && (
            <AddButton to={AddRoleRoute}>Add Role</AddButton>
          )}
          <ColumnVisibility
            columns={allColumns}
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
          />
        </div>
      </div>

      <div className="roles-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData}
          loading={isLoading || deleting}
          pagination={false}
          rowKey={(record: RoleRecord) => record._id || record.id || ''}
          scroll={{ x: 800 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={filteredData.length}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newLimit: number) => { setLimit(newLimit); setPage(1); }}
      />
    </div>
  );
};

export default AllRoles;
