import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, Space, message, Divider } from 'antd';
import { HomeOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../common/mainLayout';
import PageBreadcrumb from '../../components/breadcrumb';
import { Home, AllInvoiceRoute } from '../../routes/routepath';
import './styles.scss';

const { Title } = Typography;

const AddInvoice = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Handle phone number search
  const handlePhoneSearch = async () => {
    if (!phoneNumber) {
      message.error('Please enter a phone number');
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Replace with actual API call
      // const response = await searchUserByPhone(phoneNumber);
      
      // Mock response for now
      setTimeout(() => {
        const mockUser = {
          id: '12345',
          name: 'John Doe',
          phone: phoneNumber,
          email: 'john@example.com',
          address: '123 Main St, City'
        };
        setSearchResult(mockUser);
        message.success('User found successfully!');
        setIsSearching(false);
      }, 1000);
    } catch (error) {
      message.error('User not found or search failed');
      setIsSearching(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setPhoneNumber('');
    setSearchResult(null);
    form.resetFields(['phoneNumber']);
  };

  // Handle form submission
  const onFinish = async (values) => {
    try {
      console.log('Invoice form values:', values);
      message.success('Invoice created successfully!');
      navigate(AllInvoiceRoute);
    } catch (error) {
      message.error('Failed to create invoice');
    }
  };

  return (

      <div className="add-invoice-page">
        <PageBreadcrumb
          items={[
            { href: Home, title: <HomeOutlined /> },
            { href: AllInvoiceRoute, title: 'All Invoices' },
            { title: 'Add Invoice' },
          ]}
        />

        <Card className="add-invoice-card">
          {/* <Title level={2}>Add Invoice</Title> */}
          
          {/* Phone Number Search Section */}
          <div className="search-section">
            <div className="search-label">
              <Title level={4} style={{ marginBottom: 16, textAlign: 'center', color: '#1890ff' }}>
                Search Users By Phone Number
              </Title>
            </div>
            
            <div className="search-form-container">
              <Form.Item
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number' }
                ]}
              >
                <Input
                  placeholder="Search User By Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={10}
                />
              </Form.Item>
              
              <div className="button-container">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleClearSearch}
                  disabled={!phoneNumber && !searchResult}
                  className="delete-button"
                  size="large"
                >
                  Delete
                </Button>
                
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handlePhoneSearch}
                  loading={isSearching}
                  className="search-button"
                  size="large"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Search Result Display */}
            {searchResult && (
              <div className="search-result">
                <Divider />
                <Title level={5}>User Details:</Title>
                <div className="user-details">
                  <p><strong>Name:</strong> {searchResult.name}</p>
                  <p><strong>Phone:</strong> {searchResult.phone}</p>
                  <p><strong>Email:</strong> {searchResult.email}</p>
                  <p><strong>Address:</strong> {searchResult.address}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
  );
};

export default AddInvoice;