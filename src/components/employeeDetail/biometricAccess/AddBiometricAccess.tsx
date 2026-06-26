import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmployeeDetailBiometricAccessRoute } from '../../../routes/routepath';
import { Select, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './addBiometricAccess.scss';

const branchOptions = [
  { label: 'Gurgaon - Ground Floor', value: 'gurgaon-ground' },
  { label: 'Gurgaon - First Floor', value: 'gurgaon-first' },
  { label: 'Delhi - Main', value: 'delhi-main' },
  // Add more branches as needed
];

const AddBiometricAccess = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedBranches, setSelectedBranches] = useState([]);

  const handleChange = (value) => {
    setSelectedBranches(value);
  };

  return (
    <div className="add-biometric-access-page">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/employee-detail/${id}${EmployeeDetailBiometricAccessRoute}`)}
        className="back-btn"
      >
        Back
      </Button>
      <h2>Add Biometric Access</h2>
      <div className="form-section">
        <label>Select Branch Machines</label>
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder="Select branches/machines"
          value={selectedBranches}
          onChange={handleChange}
          options={branchOptions}
        />
      </div>
      <div className="action-buttons">
        <Button type="primary">Save</Button>
        <Button danger style={{ marginLeft: 8 }}>Delete</Button>
      </div>
    </div>
  );
};

export default AddBiometricAccess;
