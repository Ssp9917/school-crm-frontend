import { useState, useMemo } from 'react';
import { Button, Input, DatePicker, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './daysForm.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { UserDetailMembershipRoute, UserDetailRoute } from '../../../routes/routepath';
import { useGetUserMembershipQuery, useExtendMembershipExpiryMutation } from '../../../services/membership';

const DaysForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [extraDays, setExtraDays] = useState('');

  const { data, isLoading } = useGetUserMembershipQuery(id);
  const [extendExpiry, { isLoading: extending }] = useExtendMembershipExpiryMutation();

  const activeMembership = useMemo(() => {
    const list = data?.data || [];
    return list.find(m => m.status === 'active' && m.type === 'membership') || list[0] || null;
  }, [data]);

  const oldExpiry = activeMembership?.expiryDate ? dayjs(activeMembership.expiryDate) : null;

  const newExpiry = oldExpiry && extraDays && Number(extraDays) > 0
    ? oldExpiry.add(Number(extraDays), 'day')
    : oldExpiry;

  const handleBack = () => {
    navigate(`${UserDetailRoute}/${id}/${UserDetailMembershipRoute}`);
  };

  const handleSave = async () => {
    if (!activeMembership || !extraDays || Number(extraDays) <= 0) return;
    try {
      await extendExpiry({
        membershipId: activeMembership._id,
        days: Number(extraDays),
      }).unwrap();
      navigate(`${UserDetailRoute}/${id}/${UserDetailMembershipRoute}`);
    } catch (err) {
      console.error('Extend expiry error:', err);
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spin size="large" /></div>;
  }

  return (
    <div className="days-form-page">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="back-btn"
      >
        Back
      </Button>
      <div className="form-section">
        <div className="form-row">
          <div className="form-item">
            <label>Extra Days</label>
            <Input
              placeholder="Enter extra days"
              type="number"
              min={1}
              value={extraDays}
              onChange={e => setExtraDays(e.target.value)}
            />
          </div>
          <div className="form-item" />
        </div>
        <div className="form-row">
          <div className="form-item">
            <label>Old Expiry Date</label>
            <DatePicker
              style={{ width: '100%' }}
              value={oldExpiry}
              format="DD-MM-YYYY"
              disabled
            />
          </div>
          <div className="form-item">
            <label>New Expiry Date</label>
            <DatePicker
              style={{ width: '100%' }}
              value={newExpiry}
              format="DD-MM-YYYY"
              disabled
            />
          </div>
        </div>
      </div>
      <div className="action-buttons">
        <Button
          type="primary"
          loading={extending}
          disabled={!extraDays || Number(extraDays) <= 0}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default DaysForm;
