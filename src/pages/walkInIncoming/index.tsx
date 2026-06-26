import React, { useState } from 'react';
import { Button, Dropdown } from 'antd';
import { PlusOutlined, MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CommonTable from '../../components/commonTable';
import CustomPagination from '../../components/pagination';
import SearchBar from '../../components/searchBar';
import ColumnVisibility from '../../components/columnVisibility';
import { AddWalkInRoute } from '../../routes/routepath';
import './styles.scss';

const WalkInIncoming = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    dateTime: true,
    csr: true,
    clientName: true,
    mobileNo: true,
    source: true,
    enquiryFor: true,
    assistedBy: true,
    remark1: true,
    actions: true,
  });

  // Demo data
  const data = {
    walkins: [
      {
        _id: '1',
        dateTime: '2026-03-23 10:30 AM',
        csr: 'John Doe',
        clientName: 'Amit Kumar',
        mobileNo: '9876543210',
        source: 'Walk-in',
        enquiryFor: 'Personal Training',
        assistedBy: 'Sarah Coach',
        remark1: 'Interested in weight loss program',
      },
      {
        _id: '2',
        dateTime: '2026-03-23 11:15 AM',
        csr: 'Jane Smith',
        clientName: 'Priya Sharma',
        mobileNo: '9876543211',
        source: 'Phone Call',
        enquiryFor: 'Yoga Classes',
        assistedBy: 'Mike Trainer',
        remark1: 'Looking for morning batches',
      },
      {
        _id: '3',
        dateTime: '2026-03-23 02:00 PM',
        csr: 'John Doe',
        clientName: 'Rajesh Singh',
        mobileNo: '9876543212',
        source: 'Website',
        enquiryFor: 'Gym Membership',
        assistedBy: 'Sarah Coach',
        remark1: 'Wants 6 month package',
      },
    ],
    total: 3,
  };

  const isLoading = false;

  const allColumns = [
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: (text) => text || '-',
    },
    {
      title: 'CSR',
      dataIndex: 'csr',
      key: 'csr',
      render: (text) => text || '-',
    },
    {
      title: 'Client Name',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (text) => text || '-',
    },
    {
      title: 'Mobile No',
      dataIndex: 'mobileNo',
      key: 'mobileNo',
      render: (text) => text || '-',
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (text) => text || '-',
    },
    {
      title: 'Enquiry For',
      dataIndex: 'enquiryFor',
      key: 'enquiryFor',
      render: (text) => text || '-',
    },
    {
      title: 'Assisted By',
      dataIndex: 'assistedBy',
      key: 'assistedBy',
      render: (text) => text || '-',
    },
    {
      title: 'Remark 1',
      dataIndex: 'remark1',
      key: 'remark1',
      render: (text) => text || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record) => {
        const menuItems = [
          { 
            key: 'convert', 
            label: 'Convert To', 
            icon: <EyeOutlined />,
            onClick: () => console.log('Convert To:', record)
          },
          { 
            key: 'edit', 
            label: 'Edit', 
            icon: <EditOutlined />,
            onClick: () => console.log('Edit:', record)
          },
          { 
            key: 'delete', 
            label: 'Delete', 
            icon: <DeleteOutlined />, 
            danger: true,
            onClick: () => console.log('Delete:', record)
          },
        ];
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
          </Dropdown>
        );
      },
    },
  ];

  const columns = allColumns.filter((col) => visibleColumns[col.key]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  };

  const handleAddWalkIn = () => {
    navigate(AddWalkInRoute);
  };
   const handleSearchChange = (value) => {
    setSearchText(value);
    setPage(1); // Reset to first page when search changes
  };

  return (
    <div className="walkin-incoming-page">
      <div className="header-section">
        <div className="left-col">

         <SearchBar
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search users..."
          />
          </div>
        <div className='right-col'>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddWalkIn}
            size="large"
          >
            Add Walk-in / Incoming
          </Button>
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
          dataSource={data?.walkins || []}
          loading={isLoading}
          pagination={false}
          rowKey={(record) => record._id}
          // scroll={{ x: 1400 }}
        />
      </div>

      <CustomPagination
        current={page}
        pageSize={limit}
        total={data?.total || 0}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </div>
  );
};

export default WalkInIncoming;
