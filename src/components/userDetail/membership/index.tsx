import { Button, Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import MembershipCard from '../../card/memberShipCard';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUserMembershipQuery } from '../../../services/membership';
import './styles.scss';
import { UserDetailMembershipFreezabilityRoute, UserDetailMembershipDaysRoute, UserDetailRoute } from '../../../routes/routepath';
import usePermissions from '../../../hooks/usePermissions';

const UserMembership = () => {
  const navigate           = useNavigate();
  const { id }             = useParams<{ id: string }>();
  const { hasPermission }  = usePermissions();

  const { data: membershipData, isLoading } = useGetUserMembershipQuery(id);

  const handleFreezability = () => {
    const list: any[] = (membershipData as any)?.data || [];
    const active = list.find((m) => m.status === 'active' && m.type === 'membership') || list[0];
    const remSlots = active?.remainingFreezeSlots ?? 0;
    const remDays  = active?.remainingFreezeDays  ?? 0;

    if (remSlots <= 0 || remDays <= 0) {
      Modal.info({
        title: 'No Freeze Left',
        icon: <InfoCircleOutlined style={{ color: 'var(--accent)' }} />,
        content: 'This membership has already used up all its freeze slots and days — there’s nothing left to freeze right now. 🧊',
        okText: 'Got it',
      });
      return;
    }
    navigate(`${UserDetailRoute}/${id}${UserDetailMembershipFreezabilityRoute}`);
  };

  return (
    <div>
      <div className="membership-btn-group">
        <Button className="themed-btn primary">Sync Membership</Button>
        {hasPermission('9-ud-freeze-membership') && (
          <Button className="themed-btn" onClick={handleFreezability}>
            Freezability
          </Button>
        )}
        {hasPermission('9-ud-extend-days') && (
          <Button className="themed-btn" onClick={() => navigate(`${UserDetailRoute}/${id}${UserDetailMembershipDaysRoute}`)}>
            Days
          </Button>
        )}
      </div>
      <MembershipCard membershipData={membershipData as any} isLoading={isLoading} />
    </div>
  );
};

export default UserMembership;
