import { img, user as userImg } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import CommonSider from '../../components/commonSider';
import { useUserDetailDataQuery, useUpdateUserPhotoMutation } from '../../services/user';
import { useSiderMenuQuery } from '../../services/permissions';
import { useCountries } from '../../hooks/useCountries';
import usePermissions from '../../hooks/usePermissions';
import { usePushUserToBranchMutation } from '../../services/biometric';
import AvatarPhotoActions from '../../components/form/AvatarPhotoActions';

/* ─── Types ──────────────────────────────────────────────────────────── */

interface HealthInfo {
  emergencyContact?: { name?: string; phoneNumber?: string };
}

interface Member {
  photo?:                  string;
  memberId?:               string;
  maritalStatus?:          string;
  work?:                   string;
  companyName?:            string;
  countryCode?:            string;
  age?:                    string | number;
  dob?:                    string;
  gender?:                 string;
  idType?:                 string;
  idNumber?:               string;
  alternativePhoneNumber?: string;
  address?:                string;
  height?:                 string | number;
  weight?:                 string | number;
  healthInfo?:             HealthInfo;
  emergencyContactName?:   string;
  emergencyContactNumber?: string;
}

interface BranchRef { _id?: string; name?: string }

interface UserData {
  name?:        string;
  email?:       string;
  phoneNumber?: string;
  status?:      string;
  biometricId?: string;
  photo?:       string;
  branchIds?:   BranchRef[];
  member?:      Member;
}

interface MenuItem {
  id:      string;
  label:   string;
  path:    string;
  permKey: string | string[];
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const getLastPathSegment = (path: string): string => {
  const clean = path.replace(/\/$/, '');
  return clean.split('/').pop() ?? '';
};

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, refetch } = useUserDetailDataQuery(id as string, { refetchOnMountOrArgChange: true });
  const { data: siderData } = useSiderMenuQuery();
  const userData: UserData = (data as any)?.user || {};
  const member: Member = userData.member || {};

  const isSuperAdmin = (siderData as any)?.userType === 'SUPERADMIN';

  const userPermKeys = useMemo(() => {
    if (!(siderData as any)?.permissions) return null;
    return new Set<string>((siderData as any).permissions.map((p: { key: string }) => p.key));
  }, [siderData]);

  const hasTabPermission = (permKey: string | string[] | null | undefined): boolean => {
    if (!permKey) return true;
    if (!userPermKeys) return true;
    if (isSuperAdmin) return true;
    if (Array.isArray(permKey)) return permKey.some(k => userPermKeys.has(k));
    return userPermKeys.has(permKey);
  };

  const menuItems = useMemo(() => {
    const base = [
      { id: 'attendance',      label: 'Attendance',        path: 'attendance',       permKey: '9-ud-tab-attendance' },
      { id: 'memberId',        label: "Member's ID",        path: 'member-id',        permKey: '9-ud-tab-member-id' },
      { id: 'buyMembership',   label: 'Membership Invoice', path: 'buy-membership',   permKey: ['9-ud-tab-buy-membership', '9-ud-tab-view-membership', '9-ud-tab-create-membership'] },
      { id: 'addOnService',    label: 'Add On Service',     path: 'addon-service',    permKey: '9-ud-tab-addon' },
      { id: 'invoice',         label: 'Invoice',            path: 'invoice',          permKey: '9-ud-tab-invoice' },
      { id: 'assessment',      label: 'Assessment',         path: 'assessment',       permKey: '9-ud-tab-assessment' },
      { id: 'gymKit',          label: 'Gym Kit',            path: 'gym-kit',          permKey: '9-ud-tab-gym-kit' },
      { id: 'refundHistory',   label: 'Refund History',     path: 'refund-history',   permKey: '9-ud-tab-refund' },
      { id: 'parkingHistory',  label: 'Parking History',    path: 'parking-history',  permKey: '9-ud-tab-parking' },
      { id: 'dietsPlan',       label: 'Diets Plan',         path: 'diets-plan',       permKey: '9-ud-tab-diets' },
      { id: 'biometricAccess', label: 'Biometric Access',   path: 'biometric-access', permKey: '9-ud-tab-biometric' },
      { id: 'feedback',        label: 'Feedback',           path: 'user-feedback',    permKey: '9-ud-tab-feedback' },
    ];
    if (userData?.status?.toLowerCase() !== 'pending') {
      base.splice(1, 0, { id: 'membership', label: 'Membership Plans', path: 'membership', permKey: '9-ud-tab-membership' });
    }
    return base.filter(item => hasTabPermission(item.permKey));
  }, [userData.status, userPermKeys]);

  const siderLoaded = !!siderData;

  useEffect(() => {
    if (!siderLoaded || !menuItems.length) return;
    const seg = getLastPathSegment(location.pathname);
    const subRoutes = ['membership-freezability', 'freezability', 'membership-days', 'days', 'buy-plan', 'pay-due-amount', 'advance-renew', 'upgrade-plan'];
    const addonSubPaths = ['addon-upgrade', 'addon-renew', 'addon-clear-balance', 'select-addon-service', 'buy-addon-service', 'add-on-session-detail'];
    if (subRoutes.includes(seg)) return;
    if (addonSubPaths.some(p => location.pathname.includes(`/${p}`))) return;
    const isPermitted = menuItems.some(i => getLastPathSegment(i.path) === seg);
    if (!isPermitted) {
      navigate(`/user-detail/${id}/${getLastPathSegment(menuItems[0].path)}`, { replace: true });
    }
  }, [siderLoaded, menuItems, location.pathname, id, navigate]);

  const currentTab = useMemo(() => {
    const seg = getLastPathSegment(location.pathname);
    if (['membership-freezability', 'freezability', 'membership-days', 'days'].includes(seg)) return 'membership';
    if (['buy-plan', 'buy-membership', 'pay-due-amount', 'advance-renew', 'upgrade-plan'].includes(seg)) return 'buyMembership';
    if (['addon-upgrade', 'addon-renew', 'addon-clear-balance', 'select-addon-service', 'buy-addon-service', 'add-on-session-detail'].some(p => location.pathname.includes(`/${p}`))) return 'addOnService';
    return menuItems.find(i => getLastPathSegment(i.path) === seg)?.id ?? menuItems[0]?.id;
  }, [location.pathname, menuItems]);

  const [expanded,        setExpanded]        = useState(false);
  const [biometricModal,  setBiometricModal]  = useState(false);
  const [pushUserToBranch, { isLoading: pushingBiometric }] = usePushUserToBranchMutation();

  /* ── Profile photo edit / preview ── */
  const { hasPermission } = usePermissions();
  const [updateUserPhoto] = useUpdateUserPhotoMutation();

  const handlePhotoUploaded = async (photoUrl: string) => {
    try {
      await updateUserPhoto({ id: id as string, photo: photoUrl }).unwrap();
      refetch();
    } catch {
      /* error toast handled globally by badRequestHandler */
    }
  };

  const handleAddBiometric = () => setBiometricModal(true);

  const handleBiometricConfirm = async () => {
    try {
      await (pushUserToBranch as any)({ userId: id }).unwrap();
      // message.success('User pushed to biometric successfully');
      setBiometricModal(false);
    } catch {
      setBiometricModal(false);
    }
  };

  const status = userData?.status?.toLowerCase() || 'pending';

  const { dialCodeMap } = useCountries();

  const memberCountryCode = member?.countryCode || '';
  const countryInfo = memberCountryCode ? dialCodeMap.get(memberCountryCode) : null;

  const tabItems = menuItems.map(item => ({
    key: getLastPathSegment(item.path),
    label: item.label,
  }));

  return (
    <div className="user-detail-page">

      {/* ── PROFILE CARD ── */}
      <div className={`profile-card ${status}`}>

        {/* Left: avatar + identity */}
        <div className="profile-left">
          <div className={`avatar-wrap ${status}`}>
            <img src={userData.photo || member.photo || img} alt="user" />
            <AvatarPhotoActions
              photoUrl={userData.photo || member.photo || img}
              canEdit={hasPermission('UPDATE_USER_PHOTO')}
              onUploaded={handlePhotoUploaded}
            />
            <span className={`status-dot ${status}`}>{userData?.status}</span>
          </div>
          <div className="profile-identity">
            <h3 className="profile-name">{userData?.name || '—'}</h3>
            <div className="profile-tags">
              {/* <span className={`tag-status ${status}`}>{userData?.status || 'Unknown'}</span> */}
              <span className="tag-branch">{userData?.branchIds?.[0]?.name || 'N/A'}</span>
            </div>
            <Button
              size="small"
              className="add-biometric-btn"
              onClick={handleAddBiometric}
              loading={pushingBiometric}
            >
              Add Biometric
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="profile-divider" />

        {/* Right: info grid + expand */}
        <div className="profile-right">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Mobile</span>
              <span className="info-val">
                {countryInfo && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 6 }}>
                    {countryInfo.flag && (
                      <img src={countryInfo.flag} alt={countryInfo.name} style={{ width: 18, height: 13, objectFit: 'cover', borderRadius: 2, verticalAlign: 'middle' }} />
                    )}
                    <span style={{ fontSize: 11, opacity: 0.75 }}>{countryInfo.name} ({countryInfo.dial || memberCountryCode})</span>
                  </span>
                )}
                {!countryInfo && memberCountryCode && (
                  <span style={{ fontSize: 11, opacity: 0.75, marginRight: 4 }}>{memberCountryCode}</span>
                )}
                {userData?.phoneNumber || '—'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-val">{userData?.email || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member ID</span>
              <span className="info-val">{member?.memberId || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Age</span>
              <span className="info-val">{member?.age || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">DOB</span>
              <span className="info-val">{member?.dob || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-val" style={{ textTransform: 'capitalize' }}>{member?.gender || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{member?.idType || 'ID Type'}</span>
              <span className="info-val" style={{ textTransform: 'capitalize' }}>{member?.idNumber || '—'}</span>
            </div>
          </div>

          <div className={`profile-expand-wrapper ${expanded ? 'expanded' : ''}`}>
            <div className="info-grid expand-grid">
              <div className="info-item">
                <span className="info-label">Alt. Mobile</span>
                <span className="info-val">{member?.alternativePhoneNumber || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-val">{member?.address || '—'}</span>
              </div>
              {/* <div className="info-item">
                <span className="info-label">ID Type</span>
                <span className="info-val">{member?.idType || '—'}</span>
              </div> */}
              <div className="info-item">
                <span className="info-label">Biometric ID</span>
                <span className="info-val">{userData?.biometricId || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Marital Status</span>
                <span className="info-val" style={{ textTransform: 'capitalize' }}>{member?.maritalStatus || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Designation</span>
                <span className="info-val" style={{ textTransform: 'capitalize' }}>{member?.work || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Company Name</span>
                <span className="info-val" style={{ textTransform: 'capitalize' }}>{member?.companyName || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Height</span>
                <span className="info-val">{member?.height || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Weight</span>
                <span className="info-val">{member?.weight || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Emergency Name</span>
                <span className="info-val">{member?.healthInfo?.emergencyContact?.name || member?.emergencyContactName || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Emergency No.</span>
                <span className="info-val">{member?.healthInfo?.emergencyContact?.phoneNumber || member?.emergencyContactNumber || '—'}</span>
              </div>
            </div>
          </div>

          <button className="expand-toggle" onClick={() => setExpanded(p => !p)}>
            {expanded ? <UpOutlined /> : <DownOutlined />}
            <span>{expanded ? 'Hide Details' : 'Show More'}</span>
          </button>
        </div>
      </div>

      {/* ── TABS + CONTENT ── */}
      <div className="content">
        <CommonSider
          items={menuItems.map(item => ({
            key: item.id,
            label: item.label,
            icon: null,
            path: item.path,
          }))}
          activeKey={currentTab}
          onSelect={key => {
            const item = menuItems.find(i => i.id === key);
            if (item) navigate(`/user-detail/${id}/${getLastPathSegment(item.path)}`);
          }}
          mobileTabsProps={{
            tabItems,
            currentTab: getLastPathSegment(location.pathname),
            onTabClick: ({ key }) => navigate(`/user-detail/${id}/${key}`),
          }}
        />
        <div className="employee-detail-content">
          <Outlet context={{ userData }} />
        </div>
      </div>

      <Modal
        open={biometricModal}
        title="Add Biometric"
        okText="Confirm"
        cancelText="Cancel"
        onOk={handleBiometricConfirm}
        confirmLoading={pushingBiometric}
        onCancel={() => setBiometricModal(false)}
      >
        <p>Are you sure you want to push <strong>{userData?.name}</strong> to biometric?</p>
      </Modal>
    </div>
  );
};

export default UserDetailPage;
