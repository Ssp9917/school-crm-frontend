
import  { useState, useMemo } from "react";
import usePermissions from "../../hooks/usePermissions";
import { Button, Dropdown, Tooltip } from "antd";
import { EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { EditBranchRoute } from "../../routes/routepath";
import { useGetBranchesQuery } from "../../services/branches";
import SearchBar from "../../components/searchBar";
import ColumnVisibility from "../../components/columnVisibility";
import CommonTable from "../../components/commonTable";
import CustomPagination from "../../components/pagination";
import "./styles.scss";

const allColumns = [
  { title: "Branch Name", dataIndex: "name", key: "name", width: 180 },
  { 
    title: "Phone Number", 
    dataIndex: "phoneNumber", 
    key: "phoneNumber", 
    width: 150,
    render: (phone) => phone || "-"
  },
  { 
    title: "Company Email", 
    dataIndex: "companyEmail", 
    key: "companyEmail", 
    width: 200,
    render: (email) => email || "-"
  },
  { 
    title: "Address", 
    dataIndex: "address", 
    key: "address", 
    width: 220,
    render: (address) => address ? (
      <Tooltip title={address} placement="topLeft">
        <div style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          maxWidth: '200px',
          cursor: 'pointer'
        }}>
          {address}
        </div>
      </Tooltip>
    ) : "-"
  },
  {
    title: "Incorporation Certificate",
    dataIndex: "incorporationCertificate",
    key: "incorporationCertificate",
    width: 180,
    render: (url) => url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button type="text" icon={<EyeOutlined />}>View</Button>
      </a>
    ) : "-",
  },
  {
    title: "GST Certificate",
    dataIndex: "gstCertificate",
    key: "gstCertificate",
    width: 180,
    render: (url) => url ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button type="text" icon={<EyeOutlined />}>View</Button>
      </a>
    ) : "-",
  },
  {
    title: "Owned By",
    dataIndex: "ownedBy",
    key: "ownedBy",
    width: 120,
    render: (val) => val ? val.charAt(0).toUpperCase() + val.slice(1) : "-",
  },
  // Actions column will be injected in the component
];

const defaultVisible = {
  name: true,
  phoneNumber: true,
  companyEmail: true,
  address: true,
  incorporationCertificate: true,
  gstCertificate: true,
  ownedBy: true,
  actions: true,
};

const AllBranches = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const { data, isLoading } = useGetBranchesQuery();

  const { hasPermission } = usePermissions();

  // Normalize data to array
  const branchList = useMemo(() => Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []), [data]);

  const filteredData = useMemo(() => {
    if (!searchText) return branchList;
    return branchList.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [branchList, searchText]);

  const navigate = useNavigate();
  const columns = [
    ...allColumns,
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => {
        const menuItems = [
          ...(hasPermission('14-2-edit') ? [{
            key: 'edit',
            label: 'Edit',
            onClick: () => navigate(`${EditBranchRoute}/${record._id || record.id}`)
          }] : []),
          ...(hasPermission('14-1-delete') ? [{
            key: 'delete',
            label: 'Delete',
            danger: true,
            onClick: () => {}
          }] : []),
        ];
        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        );
      },
    },
  ].filter(col => visibleColumns[col.key]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!filteredData) return [];
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, limit]);

  return (
    <div className="all-branches-page">
      <div className="header-section">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search branches..."
        />
        <ColumnVisibility
          columns={allColumns}
          visibleColumns={visibleColumns}
          onColumnToggle={(key) => setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))}
        />
      </div>
      <div className="branches-table-wrapper">
        <CommonTable
          columns={columns}
          dataSource={paginatedData || []}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id || record.id}
          scroll={{ x: 900 }}
        />
      </div>
      <CustomPagination
        current={page}
        pageSize={limit}
        total={filteredData?.length || 0}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default AllBranches;
