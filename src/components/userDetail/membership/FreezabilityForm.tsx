import { useState, useMemo } from 'react';
import { Button, Input, DatePicker, Spin, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './freezabilityForm.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { UserDetailMembershipRoute, UserDetailRoute } from '../../../routes/routepath';
import { useGetUserMembershipQuery, useFreezeMembershipMutation } from '../../../services/membership';

const FreezabilityForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reason, setReason] = useState('');

  const selectedDays = fromDate && toDate ? toDate.diff(fromDate, 'day') + 1 : 0;

  const { data, isLoading } = useGetUserMembershipQuery(id);
  const [freezeMembership, { isLoading: freezing }] = useFreezeMembershipMutation();

  const activeMembership = useMemo(() => {
    const list = data?.data || [];
    return list.find(m => m.status === 'active' && m.type === 'membership') || list[0] || null;
  }, [data]);

  const handleBack = () => {
    navigate(`${UserDetailRoute}/${id}/${UserDetailMembershipRoute}`);
  };

  const handleSave = async () => {
    if (!fromDate || !toDate || !activeMembership) return;
    try {
      await freezeMembership({
        membershipId: activeMembership._id,
        startDate: dayjs(fromDate).format('YYYY-MM-DD'),
        endDate: dayjs(toDate).format('YYYY-MM-DD'),
        reason: reason || undefined,
      }).unwrap();
      navigate(`${UserDetailRoute}/${id}/${UserDetailMembershipRoute}`);
    } catch (err) {
      console.error('Freeze error:', err);
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spin size="large" /></div>;
  }

  return (
    <div className="freezability-form-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="back-btn">
          Back
        </Button>
        {selectedDays > 0 && (
          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
            {selectedDays} {selectedDays === 1 ? 'Day' : 'Days'} Selected
          </Tag>
        )}
      </div>

      <div className="form-section">
        <div className="form-row">
          <div className="form-item">
            <label>Remaining Slot</label>
            <Input value={activeMembership?.freezableSlot ?? ''} disabled />
          </div>
          <div className="form-item">
            <label>Remaining Days</label>
            <Input value={activeMembership?.freezableDays ?? ''} disabled />
          </div>
        </div>
        <div className="form-row">
          <div className="form-item">
            <label>From</label>
            <DatePicker
              style={{ width: '100%', paddingBlock: '11px' }}
              placeholder="From date"
              value={fromDate}
              onChange={setFromDate}
              format="DD-MM-YYYY"
            />
          </div>
          <div className="form-item">
            <label>To</label>
            <DatePicker
              style={{ width: '100%', paddingBlock: '11px' }}
              placeholder="To date"
              value={toDate}
              onChange={setToDate}
              format="DD-MM-YYYY"
            />
          </div>
        </div>
        {/* <div className="form-row">
          <div className="form-item">
            <label>Reason</label>
            <Input
              placeholder="Enter reason (optional)"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
        </div> */}
      </div>
      <div className="action-buttons">
        <Button
          type="primary"
          loading={freezing}
          disabled={!fromDate || !toDate}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default FreezabilityForm;
