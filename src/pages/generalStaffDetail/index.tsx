import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button, Modal } from 'antd';
import CommonSider from '../../components/commonSider';
import { useGetGeneralStaffDetailQuery } from '../../services/generalStaff';
import { useUpdateUserPhotoMutation } from '../../services/user';
import { usePushUserToBranchMutation } from '../../services/biometric';
import usePermissions from '../../hooks/usePermissions';
import AvatarPhotoActions from '../../components/form/AvatarPhotoActions';

const menuItems = [
  { id: 'attendance',      label: 'Attendance',         path: 'attendance' },
  { id: 'generalStaffId',  label: 'General Staff ID',   path: 'general-staff-id' },
  { id: 'salary',          label: 'Salary',             path: 'salary' },
  { id: 'biometricAccess', label: 'Biometric Access',   path: 'biometric-access' },
];

const GeneralStaffDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, refetch } = useGetGeneralStaffDetailQuery(id);
  const staff    = data?.data || {};
  const userInfo = staff.user || {};

  const status = userInfo.status?.toLowerCase() || 'active';

  /* ── Add biometric (push user to branch) ── */
  const [biometricModal, setBiometricModal] = useState(false);
  const [pushUserToBranch, { isLoading: pushingBiometric }] = usePushUserToBranchMutation();

  const handleAddBiometric = () => setBiometricModal(true);

  const handleBiometricConfirm = async () => {
    try {
      await (pushUserToBranch as any)({ userId: userInfo._id || id }).unwrap();
      setBiometricModal(false);
    } catch {
      setBiometricModal(false);
    }
  };

  /* ── Profile photo edit / preview ── */
  const { hasPermission } = usePermissions();
  const [updateUserPhoto] = useUpdateUserPhotoMutation();

  const handlePhotoUploaded = async (photoUrl: string) => {
    try {
      await updateUserPhoto({ id: userInfo._id || id, photo: photoUrl }).unwrap();
      refetch();
    } catch {
      /* error toast handled globally by badRequestHandler */
    }
  };

  const tabItems = menuItems.map(item => ({
    key: item.path,
    label: item.label,
  }));

  const pathSegments = location.pathname.split('/');
  const currentTab  = pathSegments[pathSegments.length - 1] || menuItems[0].path;
  const activeKey   = menuItems.find(item => currentTab === item.path)?.id ?? menuItems[0].id;

  return (
    <div className="general-staff-detail-page">

      {/* ── PROFILE CARD ── */}
      <div className="profile-card">

        <div className="profile-left">
          <div className={`avatar-wrap ${status}`}>
            <img src={userInfo.photo || staff?.photo || user} alt="general-staff" />
            <AvatarPhotoActions
              photoUrl={userInfo.photo || staff?.photo || user}
              canEdit={hasPermission('UPDATE_EMPLOYEE_PHOTO')}
              onUploaded={handlePhotoUploaded}
            />
            <span className={`status-dot ${status}`}>
              {userInfo.status
                ? userInfo.status.charAt(0).toUpperCase() + userInfo.status.slice(1)
                : 'Active'}
            </span>
          </div>
          <div className="profile-identity">
            <h3 className="profile-name">{userInfo.name || '—'}</h3>
            <div className="profile-tags">
              <span className="tag-branch">
                {userInfo.branchIds?.[0]?.name || 'N/A'}
              </span>
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

        <div className="profile-divider" />

        <div className="profile-right">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Mobile</span>
              <span className="info-val">{userInfo.phoneNumber || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Staff ID</span>
              <span className="info-val">{staff.staffId || staff.generalStaffId || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Biometric ID</span>
              <span className="info-val">{staff.biometricId || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="info-val">{staff.department || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Branch</span>
              <span className="info-val">{userInfo.branchIds?.[0]?.name || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-val">{staff.address || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="content">
        <CommonSider
          items={menuItems.map(item => ({
            key: item.id,
            label: item.label,
            icon: null,
            path: item.path,
          }))}
          activeKey={activeKey}
          onSelect={key => {
            const item = menuItems.find(i => i.id === key);
            if (item) navigate(`/general-staff-detail/${id}/${item.path}`);
          }}
          mobileTabsProps={{
            tabItems,
            currentTab,
            onTabClick: ({ key }) => navigate(`/general-staff-detail/${id}/${key}`),
          }}
        />
        <div className="general-staff-detail-content">
          <Outlet context={{ staff }} />
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
        <p>Are you sure you want to push <strong>{userInfo.name}</strong> to biometric?</p>
      </Modal>
    </div>
  );
};

export default GeneralStaffDetailPage;
