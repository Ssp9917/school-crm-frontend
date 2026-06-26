import { Button, Card } from 'antd';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import './styles.scss';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface CurrentMembership {
  isBalanceClear?: boolean;
}

interface UserData {
  hasMembership?: boolean;
  status?: string;
  isAdvanceRenewal?: boolean;
  isUpgrade?: boolean;
  totalDueAmount?: number;
  currentMembership?: CurrentMembership;
}

interface UserOutletContext {
  userData?: UserData;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const BuyMembership = () => {
  const navigate          = useNavigate();
  const { id }            = useParams<{ id: string }>();
  const { userData }      = useOutletContext<UserOutletContext>();

  if (!userData?.hasMembership || userData?.status === 'inactive') {
    return (
      <div className="buy-membership-container">
        <Card className="membership-card">
          <h2>Buy Membership</h2>
          <p className="description">Purchase your first membership to get started</p>
          <div className="action-buttons single">
            <Button
              type="primary"
              size="large"
              className="buy-plan-btn"
              onClick={() => navigate(`/user-detail/${id}/buy-plan`)}
            >
              {userData?.status === 'inactive' ? 'Renew Membership' : 'Buy Membership'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleUpgrade      = () => navigate(`/user-detail/${id}/upgrade-plan`);
  const handleAdvanceRenew = () => navigate(`/user-detail/${id}/advance-renew`);
  const handlePayDueAmount = () => navigate(`/user-detail/${id}/pay-due-amount`);

  const hasDueAmount   = userData?.currentMembership?.isBalanceClear === true && (userData?.totalDueAmount ?? 0) > 0;
  const isAdvanceRenewal = userData?.isAdvanceRenewal === true;
  const isUpgrade        = userData?.isUpgrade === true;
  const hasNoActions     = !isUpgrade && !isAdvanceRenewal && !hasDueAmount;

  return (
    <div className="buy-membership-container">
      <Card className="membership-card">
        {!hasNoActions && (
          <>
            <h2>Select Membership Action</h2>
            <p className="description">Choose an option to manage your membership</p>
          </>
        )}

        {hasNoActions ? (
          <div className="no-actions-message">
            <div className="icon">✓</div>
            <h3>All Set!</h3>
            <p>Your membership is active and up to date. No actions are required at this time.</p>
            <p className="sub-text">You'll be notified when renewal or upgrade options become available.</p>
          </div>
        ) : (
          <div className="action-buttons">
            {isUpgrade && (
              <Button type="primary" size="large" className="upgrade-btn" onClick={handleUpgrade}>
                Upgrade
              </Button>
            )}

            {isAdvanceRenewal && (
              <Button type="primary" size="large" className="renew-btn" onClick={handleAdvanceRenew}>
                Advance Renew
              </Button>
            )}

            {hasDueAmount && (
              <Button type="primary" size="large" className="pay-due-btn" onClick={handlePayDueAmount} danger>
                Pay Due Amount (₹{(userData?.totalDueAmount ?? 0).toLocaleString()})
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BuyMembership;
