import React, { useState } from "react";
import { Spin, Button, Tooltip, Modal, Form, Select, InputNumber, message, notification } from "antd";
import { DownOutlined, GiftOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import "./styles.scss";
import { logo, whiteLogo } from "../../../assets";
import { useTheme } from "../../../context/ThemeContext";
import { AddOnSessionDetailRoute, UserDetailRoute, InvoiceDetailRoute } from "../../../routes/routepath";
import { useUpdateCouponServicesMutation, useFreezeAddonMutation, useUnfreezeAddonMutation, useChangeTrainerMutation } from "../../../services/membership";
import { useGetOpenTrainersQuery } from "../../../services/trainer";
import { useSelector } from "react-redux";
import usePermissions from "../../../hooks/usePermissions";

/* ─── Domain types ─────────────────────────────────────────────────── */

interface Branch { _id: string; name?: string; }
interface PlanRef  { _id: string; name?: string; numberOfDays?: number; numberOfCoupons?: number; branchIds?: Branch[]; }
interface Invoice {
  _id: string;
  invoiceNumber?: string;
  paymentType?: string;
  planName?: string;
  salesPerson?: { name?: string };
  upgradedFromPlan?: { name?: string };
  upgradedToPlan?: { name?: string };
}
interface CouponService { serviceType: string; totalSessions: number; numberOfSessions?: number; remainingSessions?: number; }
interface ComplementaryService { remainingSessions: number; totalSessions: number; }
interface PurchasedPlan { name?: string; }
interface FreezeRecord {
  freezeStartDate?: string;
  freezeEndDate?: string;
  freezeDays?: number;
  previousExpiryDate?: string;
  newExpiryDate?: string;
  reason?: string | null;
}
interface ExtendRecord {
  previousExpiryDate?: string;
  newExpiryDate?: string;
  daysExtended?: number;
  extendedAt?: string;
  reason?: string | null;
}

interface Membership {
  _id: string;
  type?: 'addon' | 'membership' | string;
  addonType?: string;
  status?: string;
  isFrozen?: boolean;
  isBalanceClear?: boolean;
  isUpgraded?: boolean;
  isRenew?: boolean;
  startDate?: string;
  expiryDate?: string;
  originalExpiryDate?: string;
  currentExpiryDate?: string;
  previousExpiryDate?: string;
  newExpiryDate?: string;
  totalExtensions?: number;
  upgradeLabel?: string;
  daysExtended?: number;
  freezableSlot?: number;
  freezableDays?: number;
  usedFreezeSlots?: number;
  totalFreezeSlots?: number;
  usedFreezeDays?: number;
  totalFreezeDays?: number;
  totalFrozenDays?: number;
  freezeHistory?: FreezeRecord[];
  extendHistory?: ExtendRecord[];
  totalSessions?: number;
  remainingSessions?: number;
  coachId?: { _id?: string } | string;
  assignedTrainer?: string;
  planId?: PlanRef;
  invoices?: Invoice[];
  couponServices?: CouponService[];
  complementaryServices?: ComplementaryService[];
  purchasedPlans?: PurchasedPlan[];
}

interface MembershipCardProps {
  membershipData?: { data?: Membership[] };
  isLoading?: boolean;
  onAddSession?: (membership: Membership) => void;
  fallbackBranchName?: string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const SERVICE_OPTIONS = [
  { label: 'Personal Training', value: 'personal_training' },
  { label: 'Pilates',           value: 'pilates' },
  { label: 'Therapy',           value: 'therapy' },
  { label: 'EMS',               value: 'ems' },
  { label: 'MMA',               value: 'mma' },
];

const MAX_PER_SERVICE = 3;

/** Status → colour, matching the user status tags (active=green, inactive=red, freezed=blue, …). */
const statusColor = (status?: string): string => {
  switch (status) {
    case 'active':   return '#52c41a';
    case 'inactive': return '#ff4d4f';
    case 'freezed':  return '#1890ff';
    case 'pending':  return '#faad14';
    case 'block':    return '#fa541c';
    default:         return 'rgb(141 139 139)';
  }
};

/** Format an ISO date as D-M-YYYY (e.g. "16-8-2026") using the stored (UTC) date-part. */
const fmtFreezeDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return `${dt.getUTCDate()}-${dt.getUTCMonth() + 1}-${dt.getUTCFullYear()}`;
};

/* ─── Component ──────────────────────────────────────────────────────── */

const MembershipCard = ({ membershipData, isLoading, onAddSession, fallbackBranchName }: MembershipCardProps) => {
  const { hasPermission } = usePermissions();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id: userId } = useParams<{ id: string }>();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [bottomTab, setBottomTab] = useState<Record<string, 'freeze' | 'extend'>>({});
  const setTab = (id: string, tab: 'freeze' | 'extend') => setBottomTab((prev) => ({ ...prev, [id]: tab }));
  const [couponModalVisible, setCouponModalVisible]   = useState(false);
  const [couponMembership, setCouponMembership]       = useState<Membership | null>(null);
  const [couponForm] = Form.useForm();
  const [updateCouponServices, { isLoading: addingService }] = useUpdateCouponServicesMutation();
  const [freezeAddon,   { isLoading: freezing }]    = useFreezeAddonMutation();
  const [unfreezeAddon, { isLoading: unfreezing }]  = useUnfreezeAddonMutation();
  const [changeTrainer, { isLoading: changingTrainer }] = useChangeTrainerMutation();
  const [trainerModalVisible,  setTrainerModalVisible]  = useState(false);
  const [trainerConfirmVisible, setTrainerConfirmVisible] = useState(false);
  const [trainerMembership,    setTrainerMembership]    = useState<Membership | null>(null);
  const [selectedTrainerId,    setSelectedTrainerId]    = useState<string | null>(null);

  const branchId = useSelector((state: any) => state.branch.selectedBranch);
  const selectedBranchId: string | undefined =
    typeof branchId === 'object' ? (branchId?._id || branchId?.id) : branchId;
  const { data: trainersData } = useGetOpenTrainersQuery({ branchId: selectedBranchId || undefined, limit: 100 });

  const toggleCard = (membershipId: string) => {
    setExpandedCards(prev => ({ ...prev, [membershipId]: !prev[membershipId] }));
  };

  const handleChangeTrainerClick = (e: React.MouseEvent, membership: Membership) => {
    e.stopPropagation();
    setTrainerMembership(membership);
    const coachId = typeof membership.coachId === 'object'
      ? membership.coachId?._id
      : membership.coachId;
    setSelectedTrainerId(coachId || membership.assignedTrainer || null);
    setTrainerModalVisible(true);
  };

  const handleTrainerModalClose = () => {
    setTrainerModalVisible(false);
    setTrainerMembership(null);
    setSelectedTrainerId(null);
  };

  const handleTrainerSubmit = () => {
    if (!selectedTrainerId || !trainerMembership) return;
    setTrainerConfirmVisible(true);
  };

  const handleTrainerConfirm = async () => {
    if (!selectedTrainerId || !trainerMembership) return;
    try {
      await (changeTrainer as any)({ membershipId: trainerMembership._id, coachId: selectedTrainerId }).unwrap();
      setTrainerConfirmVisible(false);
      handleTrainerModalClose();
    } catch (err) {
      console.error('Change trainer error:', err);
    }
  };

  const handleFreezeToggle = async (e: React.MouseEvent, membership: Membership) => {
    e.stopPropagation();
    try {
      if (membership.isFrozen) {
        await (unfreezeAddon as any)(membership._id).unwrap();
      } else {
        await (freezeAddon as any)(membership._id).unwrap();
      }
    } catch (err) {
      console.error('Freeze/Unfreeze error:', err);
    }
  };

  const handleCouponTagClick = (e: React.MouseEvent, membership: Membership) => {
    e.stopPropagation();
    setCouponMembership(membership);
    couponForm.resetFields();
    setCouponModalVisible(true);
  };

  const handleCouponModalClose = () => {
    setCouponModalVisible(false);
    setCouponMembership(null);
    couponForm.resetFields();
  };

  const onFinishFailed = ({ errorFields }: { errorFields: { name: (string | number)[]; errors: string[] }[] }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    notification.error({
      message: 'Required Fields Missing',
      description: [...new Set(labels)].join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  const handleCouponSubmit = async (values: { services?: { serviceType: string; numberOfSessions: number }[] }) => {
    const services = values.services || [];
    if (services.length === 0) {
      message.warning('Please add at least one service');
      return;
    }
    const sessionsMap: Record<string, number> = {};
    for (const svc of services) {
      sessionsMap[svc.serviceType] = (sessionsMap[svc.serviceType] || 0) + (svc.numberOfSessions || 0);
      if (sessionsMap[svc.serviceType] > MAX_PER_SERVICE) {
        message.error(`"${svc.serviceType}" can only have ${MAX_PER_SERVICE} sessions total`);
        return;
      }
    }
    try {
      await (updateCouponServices as any)({
        membershipId: couponMembership?._id,
        totalCoupons: couponMembership?.planId?.numberOfCoupons || 0,
        couponServices: services.map(svc => ({
          serviceType: svc.serviceType,
          numberOfSessions: svc.numberOfSessions,
        })),
      }).unwrap();
      handleCouponModalClose();
    } catch (err) {
      console.error('Coupon submit error:', err);
    }
  };

  const handleCardClick = (membership: Membership) => {
    if (membership.type === 'addon') {
      if (!hasPermission('9-ud-addon-svc-session-detail')) return;
      navigate(`${UserDetailRoute}/${userId}/addon-service${AddOnSessionDetailRoute}/${membership._id}`);
    } else if (membership.type === 'membership') {
      if (!hasPermission('9-ud-membership-session-detail')) return;
      navigate(`${UserDetailRoute}/${userId}/membership${AddOnSessionDetailRoute}/${membership._id}`);
    }
  };

  // Format by the stored (UTC) date-part so the date reads exactly as saved
  // (…T18:30:00.000Z → e.g. 17/06/2027), avoiding the local-timezone +1 shift.
  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getUTCFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="membership-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const memberships: Membership[] = membershipData?.data || [];

  if (memberships.length === 0) {
    return (
      <div className="membership-card">
        <div className="card-body">
          <p style={{ textAlign: 'center', padding: '20px' }}>No membership found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="membership-cards-container">
        {memberships.map((membership) => {
          const isActive    = membership.status === 'active';
          const isExpanded  = expandedCards[membership._id];
          const statusClr   = statusColor(membership.status);
          const borderColor = `1px solid ${statusClr}`;
          const numberOfCoupons = membership.planId?.numberOfCoupons;

          return (
            <div
              key={membership._id}
              className={`membership-card ${isExpanded ? 'expanded' : 'collapsed'} ${membership.type === 'addon' ? 'addon-card' : ''}`}
              style={{ border: borderColor, cursor: 'pointer', '--card-status': statusClr } as React.CSSProperties}
              onClick={() => handleCardClick(membership)}
            >
              {isActive && <div className="ribbon"><span>★</span></div>}

              {membership.type === 'membership' && numberOfCoupons && numberOfCoupons > 0 && (
                <div className="coupon-tag" onClick={(e) => handleCouponTagClick(e, membership)}>
                  <GiftOutlined />
                  <span>{numberOfCoupons}</span>
                </div>
              )}

              <div className="card-header-collapsed">
                <div className="header-left">
                  <img src={theme === "light" ? logo : whiteLogo} alt="FitClub" className="logo" />
                  {(() => {
                    const branches = membership.planId?.branchIds || [];
                    if (branches.length === 0) return <p className="branch-name">{fallbackBranchName || 'N/A'}</p>;
                    const firstBranch    = branches[0]?.name || 'N/A';
                    const remainingCount = branches.length - 1;
                    const allBranchNames = branches.map(b => b?.name).filter(Boolean).join(', ');
                    if (remainingCount > 0) {
                      return <Tooltip title={allBranchNames}><p className="branch-name">{firstBranch} +{remainingCount}</p></Tooltip>;
                    }
                    return <p className="branch-name">{firstBranch}</p>;
                  })()}
                </div>
                <div className="header-right">
                  <div>
                    {membership.isUpgraded && (membership.purchasedPlans?.length ?? 0) >= 2 ? (
                      <h2 className="plan-title">
                        {membership.purchasedPlans![0]?.name}
                        <span style={{ margin: '0 8px', fontSize: '18px', fontWeight: '300' }}>→</span>
                        {membership.purchasedPlans![membership.purchasedPlans!.length - 1]?.name}
                      </h2>
                    ) : membership.invoices?.some(inv => inv.upgradedFromPlan && inv.upgradedToPlan) ? (
                      <h2 className="plan-title">
                        {membership.invoices.find(inv => inv.upgradedFromPlan && inv.upgradedToPlan)?.upgradedFromPlan?.name}
                        <span style={{ margin: '0 8px', fontSize: '18px', fontWeight: '300' }}>→</span>
                        {membership.invoices.find(inv => inv.upgradedFromPlan && inv.upgradedToPlan)?.upgradedToPlan?.name}
                      </h2>
                    ) : (
                      <h2 className="plan-title">{membership.planId?.name || 'N/A'}</h2>
                    )}
                    <p className="plan-type">
                      {membership.type === 'addon' && membership.addonType
                        ? membership.addonType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : membership.type || 'membership'}
                    </p>
                  </div>
                  <button
                    className="view-btn"
                    onClick={(e) => { e.stopPropagation(); toggleCard(membership._id); }}
                  >
                    View <DownOutlined style={{ fontSize: '12px', marginLeft: '4px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="card-body">
                  <div className="info">
                    {membership.invoices && membership.invoices.length > 0 && (
                      <div className="invoices-section">
                        {membership.invoices.map((invoice) => (
                          <div key={invoice._id} style={{ marginBottom: '12px' }}>
                            <p style={{ padding: 0, margin: 0 }}>
                              <strong>Invoice ({invoice.paymentType?.replace(/_/g, ' ') || 'N/A'}):</strong>
                              {hasPermission('9-ud-addon-view-invoice') ? (
                                <span
                                  style={{ cursor: 'pointer', color: '#1890ff', textDecoration: 'underline' }}
                                  onClick={(e) => { e.stopPropagation(); navigate(`${InvoiceDetailRoute}/${invoice._id}`); }}
                                >
                                  {invoice.invoiceNumber}
                                </span>
                              ) : (
                                <span onClick={(e) => e.stopPropagation()}>{invoice.invoiceNumber}</span>
                              )}
                            </p>
                            {invoice.planName && (
                              <p style={{ fontSize: '12px', color: '#7e7e7eff', margin: '2px 0' }}>
                                <strong>Plan:</strong> <span>{invoice.planName}</span>
                              </p>
                            )}
                            {membership.type !== 'addon' && invoice.salesPerson && (
                              <p style={{ fontSize: '12px', color: '#7e7e7eff', margin: '2px 0' }}>
                                <strong>Sales Person:</strong> <span>{invoice.salesPerson.name || 'N/A'}</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p><strong>Duration:</strong> <span>{membership.planId?.numberOfDays || 0} days</span></p>

                    {membership.type === 'addon' ? (
                      <>
                        <p>
                          <strong>Trainer:</strong>{' '}
                          <span>{(() => {
                            const coachId = typeof membership.coachId === 'object'
                              ? membership.coachId?._id
                              : membership.coachId;
                            const list: any[] = (trainersData as any)?.trainers || (trainersData as any)?.data || [];
                            const found = list.find((t: any) => t._id === coachId);
                            return found?.name || found?.user?.name || '-';
                          })()}</span>
                        </p>
                        <p><strong>Sessions:</strong> <span>{membership.totalSessions || 0}/{membership.remainingSessions || 0}</span></p>
                        {(membership.complementaryServices?.length ?? 0) > 0 && membership.complementaryServices!.map((svc, i) => (
                          <p key={i}>
                            <strong>Complementary </strong>{' '}
                            <span style={{ color: svc.remainingSessions > 0 ? '#52c41a' : '#999' }}>
                              {svc.remainingSessions}/{svc.totalSessions}
                            </span>
                          </p>
                        ))}
                      </>
                    ) : (
                      <>
                        <p><strong>Freeze Slots:</strong> <span>{membership.usedFreezeSlots ?? 0}/{membership.totalFreezeSlots ?? 0}</span></p>
                        <p><strong>Freeze Days:</strong> <span>{membership.usedFreezeDays ?? 0}/{membership.totalFreezeDays ?? 0}</span></p>
                        {(() => {
                          const extendDays = (membership.extendHistory?.reduce((s, e) => s + (e.daysExtended || 0), 0) || membership.daysExtended) ?? 0;
                          return extendDays > 0 ? (
                            <p><strong>Extended Days:</strong> <span style={{ color: '#52c41a' }}>{extendDays} {extendDays === 1 ? 'day' : 'days'}</span></p>
                          ) : null;
                        })()}
                      </>
                    )}

                    {membership.type === 'addon' && (
                      <p><strong>Frozen Days:</strong> <span>{membership.totalFrozenDays || 0}</span></p>
                    )}
                    <p><strong>Start:</strong>  <span>{formatDate(membership.startDate)}</span></p>
                    <p><strong>Expiry:</strong> <span>{formatDate(membership.previousExpiryDate || membership.originalExpiryDate)}</span></p>
                    {membership.type !== 'addon' && (() => {
                      const extendDays = (membership.extendHistory?.reduce((s, e) => s + (e.daysExtended || 0), 0) || membership.daysExtended) ?? 0;
                      const newExpiry = membership.currentExpiryDate || membership.newExpiryDate;
                      return extendDays > 0 && newExpiry ? (
                        <p><strong>New Expiry Date:</strong> <span style={{ color: '#52c41a' }}>{formatDate(newExpiry)}</span></p>
                      ) : null;
                    })()}
                    <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: statusClr }}>{membership.status}</span></p>
                    {membership.upgradeLabel && (
                      <p><strong>Label:</strong> <span style={{ textTransform: 'capitalize' }}>{membership.upgradeLabel.replace(/_/g, ' ')}</span></p>
                    )}

                    {membership.type === 'addon' && (
                      <>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                          {onAddSession && hasPermission('9-ud-addon-add-session') && (
                            <Button
                              onClick={(e) => { e.stopPropagation(); onAddSession(membership); }}
                              style={{ flex: 1, background: 'var(--hover-bg)', borderColor: 'var(--muted)', color: 'var(--sider-text)' }}
                            >
                              Add Session
                            </Button>
                          )}
                          {hasPermission('9-ud-addon-freeze') && (
                            <Button
                              type={membership.isFrozen ? 'default' : 'primary'}
                              danger={membership.isFrozen}
                              loading={freezing || unfreezing}
                              onClick={(e) => handleFreezeToggle(e, membership)}
                              style={membership.isFrozen ? { flex: 1, background: 'var(--hover-bg)', borderColor: '#ff4d4f', color: '#ff4d4f' } : { flex: 1 }}
                            >
                              {membership.isFrozen ? 'Unfreeze Add-On' : 'Freeze Add-On'}
                            </Button>
                          )}
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          {hasPermission('9-ud-addon-change-trainer') && (
                            <Button
                              onClick={(e) => handleChangeTrainerClick(e, membership)}
                              style={{ flex: 1, background: 'var(--hover-bg)', borderColor: 'var(--muted)', color: 'var(--sider-text)' }}
                            >
                              Change Trainer
                            </Button>
                          )}
                        </div>
                        {(membership.isBalanceClear || membership.isUpgraded || membership.isRenew) && (
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            {membership.isBalanceClear && hasPermission('9-ud-addon-clear-balance') && (
                              <Button
                                danger
                                onClick={(e) => { e.stopPropagation(); navigate(`${UserDetailRoute}/${userId}/addon-clear-balance/${membership._id}`); }}
                                style={{ flex: 1, background: 'var(--hover-bg)', borderColor: '#ff4d4f', color: '#ff4d4f' }}
                              >
                                Clear Balance
                              </Button>
                            )}
                            {membership.isUpgraded && hasPermission('9-ud-addon-upgrade') && (
                              <Button
                                onClick={(e) => { e.stopPropagation(); navigate(`${UserDetailRoute}/${userId}/addon-upgrade/${membership._id}`); }}
                                style={{ flex: 1, background: 'var(--hover-bg)', borderColor: 'var(--muted)', color: 'var(--sider-text)' }}
                              >
                                Upgrade
                              </Button>
                            )}
                            {membership.isRenew && hasPermission('9-ud-addon-renew') && (
                              <Button
                                onClick={(e) => { e.stopPropagation(); navigate(`${UserDetailRoute}/${userId}/addon-renew/${membership._id}`); }}
                                style={{ flex: 1, background: 'var(--hover-bg)', borderColor: 'var(--muted)', color: 'var(--sider-text)' }}
                              >
                                Renew
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {membership.type !== 'addon' && (() => {
                    const activeTab = bottomTab[membership._id] || 'freeze';
                    return (
                      <div className="card-tabs" onClick={(e) => e.stopPropagation()}>
                        <div className="card-tabs-head">
                          <button
                            className={`card-tab ${activeTab === 'freeze' ? 'active' : ''}`}
                            onClick={() => setTab(membership._id, 'freeze')}
                          >
                            Freeze Slots
                          </button>
                          <button
                            className={`card-tab ${activeTab === 'extend' ? 'active' : ''}`}
                            onClick={() => setTab(membership._id, 'extend')}
                          >
                            Extend Days
                          </button>
                        </div>

                        <div className="card-tabs-body">
                          {activeTab === 'freeze' ? (
                            (membership.freezeHistory?.length ?? 0) > 0 ? (
                              membership.freezeHistory!.map((f, i) => (
                                <div className="freeze-item" key={i}>
                                  <span className="freeze-idx">{i + 1}</span>
                                  <span className="freeze-range">
                                    {fmtFreezeDate(f.freezeStartDate)} - {fmtFreezeDate(f.freezeEndDate)}
                                  </span>
                                  {f.freezeDays != null && (
                                    <span className="freeze-days">{f.freezeDays} {f.freezeDays === 1 ? 'day' : 'days'}</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="freeze-empty">No freeze slots used</div>
                            )
                          ) : (
                            (membership.extendHistory?.length ?? 0) > 0 ? (
                              membership.extendHistory!.map((e, i) => (
                                <div className="freeze-item" key={i}>
                                  <span className="freeze-idx">{i + 1}</span>
                                  <span className="freeze-range">
                                    {fmtFreezeDate(e.previousExpiryDate)} → {fmtFreezeDate(e.newExpiryDate)}
                                  </span>
                                  {e.daysExtended != null && (
                                    <span className="freeze-days">+{e.daysExtended} {e.daysExtended === 1 ? 'day' : 'days'}</span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="freeze-empty">No days extended</div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Change Trainer Modal */}
      <Modal
        open={trainerModalVisible}
        onCancel={handleTrainerModalClose}
        title="Change Trainer"
        onOk={handleTrainerSubmit}
        okText="Save"
        confirmLoading={changingTrainer}
        okButtonProps={{ disabled: !selectedTrainerId }}
        width={400}
        destroyOnClose
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ marginBottom: 8 }}>Select Trainer</p>
          {(() => {
            const allTrainers: any[] = (trainersData as any)?.trainers || (trainersData as any)?.data || [];
            const addonType = trainerMembership?.addonType;
            const normalizeStr = (s: string) => s.toLowerCase().replace(/_/g, ' ').trim();
            const filtered = addonType
              ? allTrainers.filter(t => {
                  const specs: string[] = t.specialization || [];
                  return specs.some(s => normalizeStr(s) === normalizeStr(addonType));
                })
              : allTrainers;
            return (
              <Select
                style={{ width: '100%' }}
                placeholder="Select a trainer"
                value={selectedTrainerId}
                onChange={(val: string) => setSelectedTrainerId(val)}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={filtered.map(t => ({
                  value: t._id,
                  label: t.name || t.user?.name || t._id,
                }))}
                notFoundContent={
                  addonType && filtered.length === 0
                    ? `No trainers found for ${normalizeStr(addonType).replace(/\b\w/g, c => c.toUpperCase())}`
                    : undefined
                }
              />
            );
          })()}
        </div>
      </Modal>

      {/* Change Trainer Confirmation Modal */}
      <Modal
        open={trainerConfirmVisible}
        onCancel={() => setTrainerConfirmVisible(false)}
        title="Confirm Change"
        onOk={handleTrainerConfirm}
        okText="Yes, Change"
        cancelText="Cancel"
        confirmLoading={changingTrainer}
        centered
        width={360}
        okButtonProps={{ style: { background: '#22c55e', borderColor: '#22c55e' } }}
      >
        <p style={{ margin: '12px 0' }}>Are you sure you want to change the trainer ?</p>
      </Modal>

      {/* Complementary Services Modal */}
      <Modal
        open={couponModalVisible}
        onCancel={handleCouponModalClose}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GiftOutlined style={{ color: 'var(--accent)' }} />
            <span>Complementary Add-On Services</span>
            {couponMembership?.planId?.numberOfCoupons && (
              <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>
                ({couponMembership.planId.numberOfCoupons} coupons available)
              </span>
            )}
          </div>
        }
        footer={null}
        width={520}
        destroyOnClose
      >
        {(couponMembership?.couponServices?.length ?? 0) > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Already Added:</p>
            {couponMembership!.couponServices!.map((svc, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--card-bg)', borderRadius: 6, marginBottom: 4, fontSize: 13 }}>
                <span>{svc.serviceType}</span>
                <span style={{ color: '#999' }}>{svc.totalSessions} session{svc.totalSessions !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}

        <Form form={couponForm} onFinish={handleCouponSubmit} onFinishFailed={onFinishFailed} layout="vertical">
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingRight: 36 }}>
            <div style={{ flex: 2, fontSize: 13, fontWeight: 600 }}><span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>Service Type</div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}><span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>Sessions</div>
          </div>

          <Form.List name="services" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'self-start', marginBottom: 8 }}>
                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldValue }) => {
                        const allServices: any[] = getFieldValue('services') || [];
                        const existingSessionsMap: Record<string, number> = {};
                        for (const svc of couponMembership?.couponServices || []) {
                          existingSessionsMap[svc.serviceType] = (existingSessionsMap[svc.serviceType] || 0) + (svc.totalSessions || 0);
                        }
                        const selectedElsewhere = allServices.filter((_, i) => i !== name).map((s: any) => s?.serviceType).filter(Boolean);
                        const options = SERVICE_OPTIONS.map(opt => ({
                          ...opt,
                          disabled: selectedElsewhere.includes(opt.value) || (existingSessionsMap[opt.value] || 0) >= MAX_PER_SERVICE,
                        }));
                        return (
                          <Form.Item {...restField} name={[name, 'serviceType']} rules={[{ required: true, message: 'Select service' }]} style={{ flex: 2, marginBottom: 0 }}>
                            <Select placeholder="Select service" options={options} />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldValue }) => {
                        const allServices: any[] = getFieldValue('services') || [];
                        const currentType = allServices[name]?.serviceType;
                        const existingSessionsMap: Record<string, number> = {};
                        for (const svc of couponMembership?.couponServices || []) {
                          existingSessionsMap[svc.serviceType] = (existingSessionsMap[svc.serviceType] || 0) + (svc.totalSessions || 0);
                        }
                        const maxAllowed = currentType ? MAX_PER_SERVICE - (existingSessionsMap[currentType] || 0) : MAX_PER_SERVICE;
                        return (
                          <Form.Item {...restField} name={[name, 'numberOfSessions']} rules={[{ required: true, message: 'Required' }, { type: 'number', min: 1, max: maxAllowed, message: `Max ${maxAllowed}` }]} style={{ flex: 1, marginBottom: 0 }}>
                            <InputNumber placeholder={`1-${maxAllowed}`} min={1} style={{ width: '100%', height: '32px' }} />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>

                    <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} disabled={fields.length === 1} style={{ flexShrink: 0, width: 28, padding: 0 }} />
                  </div>
                ))}

                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => {
                    const allServices: any[] = getFieldValue('services') || [];
                    const selectedTypes = allServices.map((s: any) => s?.serviceType).filter(Boolean);
                    const existingSessionsMap: Record<string, number> = {};
                    for (const svc of couponMembership?.couponServices || []) {
                      existingSessionsMap[svc.serviceType] = (existingSessionsMap[svc.serviceType] || 0) + (svc.totalSessions || 0);
                    }
                    const hasMore = SERVICE_OPTIONS.some(opt => !selectedTypes.includes(opt.value) && (existingSessionsMap[opt.value] || 0) < MAX_PER_SERVICE);
                    return (
                      <Form.Item style={{ marginBottom: 8 }}>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={!hasMore}>
                          Add Another Service
                        </Button>
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldsError, getFieldValue }) => {
              const totalCoupons   = couponMembership?.planId?.numberOfCoupons || 0;
              const existingTotal  = (couponMembership?.couponServices || []).reduce((sum, s) => sum + (s?.totalSessions || 0), 0);
              const services: any[] = getFieldValue('services') || [];
              const formTotal      = services.reduce((sum: number, s: any) => sum + (s?.numberOfSessions || 0), 0);
              const allocated      = existingTotal + formTotal;
              const remaining      = totalCoupons - allocated;
              const hasErrors      = getFieldsError().some(f => f.errors.length > 0);
              const allFilled      = services.length > 0 && services.every((s: any) => s?.serviceType && s?.numberOfSessions);
              const isExact        = allocated === totalCoupons;

              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, marginBottom: 12, background: isExact ? 'rgba(82,196,26,0.08)' : remaining < 0 ? 'rgba(255,77,79,0.08)' : 'rgba(250,173,20,0.08)', border: `1px solid ${isExact ? '#52c41a' : remaining < 0 ? '#ff4d4f' : '#faad14'}` }}>
                    <span style={{ fontSize: 13 }}>Coupons allocated: <strong>{allocated}</strong> / <strong>{totalCoupons}</strong></span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: isExact ? '#52c41a' : remaining < 0 ? '#ff4d4f' : '#faad14' }}>
                      {isExact ? '✓ All coupons used' : remaining > 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over limit`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button onClick={handleCouponModalClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={addingService} disabled={hasErrors || !allFilled || !isExact}>Save</Button>
                  </div>
                </>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MembershipCard;
