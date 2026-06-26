import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useGetTrainersDetailQuery } from '../../services/trainer';
import { useUpdateUserPhotoMutation } from '../../services/user';
import { usePushUserToBranchMutation } from '../../services/biometric';
import usePermissions from '../../hooks/usePermissions';
import CommonSider from '../../components/commonSider';
import AvatarPhotoActions from '../../components/form/AvatarPhotoActions';
import {
  TrainerDetailAttendanceRoute,
  TrainerDetailCoachIdRoute,
  TrainerDetailClassesRoute,
  TrainerDetailTransactionsRoute,
  TrainerDetailParkingHistoryRoute,
  TrainerDetailBiometricAccessRoute,
} from '../../routes/routepath';

/* ─── Constants ──────────────────────────────────────────────────────── */

const MENU_ITEMS = [
  { id: 'attendance',      label: 'Attendance',       path: TrainerDetailAttendanceRoute      },
  { id: 'coachId',         label: 'Coach ID',         path: TrainerDetailCoachIdRoute         },
  { id: 'classes',         label: 'Classes',          path: TrainerDetailClassesRoute         },
  { id: 'transactions',    label: 'Transactions',     path: TrainerDetailTransactionsRoute    },
  { id: 'parkingHistory',  label: 'Parking History',  path: TrainerDetailParkingHistoryRoute  },
  { id: 'biometricAccess', label: 'Biometric Access', path: TrainerDetailBiometricAccessRoute },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const TrainerDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { data, refetch } = useGetTrainersDetailQuery(id as any);
  const trainer:  any = (data as any)?.data || {};
  const userInfo: any = trainer.user || {};

  const [expanded, setExpanded] = useState(false);

  const status = (userInfo.status as string | undefined)?.toLowerCase() || 'active';

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
      await updateUserPhoto({ id: userInfo._id || (id as string), photo: photoUrl }).unwrap();
      refetch();
    } catch {
      /* error toast handled globally by badRequestHandler */
    }
  };

  const tabItems = MENU_ITEMS.map(item => ({
    key:   item.path.slice(1),
    label: item.label,
  }));

  const pathSegments = location.pathname.split('/');
  const currentTab   = pathSegments[pathSegments.length - 1] || TrainerDetailAttendanceRoute.slice(1);
  const activeKey    = MENU_ITEMS.find(item => currentTab === item.path.slice(1))?.id ?? MENU_ITEMS[0].id;

  return (
    <div className="trainer-detail-page">

      {/* ── PROFILE CARD ── */}
      <div className="profile-card">
        <div className="profile-left">
          <div className={`avatar-wrap ${status}`}>
            <img src={userInfo.photo || trainer.photo || user} alt="trainer" />
            <AvatarPhotoActions
              photoUrl={userInfo.photo || trainer.photo || user}
              canEdit={hasPermission('UPDATE_TRAINER_PHOTO')}
              onUploaded={handlePhotoUploaded}
            />
            <span className={`status-dot ${status}`}>
              {userInfo.status
                ? String(userInfo.status).charAt(0).toUpperCase() + String(userInfo.status).slice(1)
                : 'Active'}
            </span>
          </div>
          <div className="profile-identity">
            <h3 className="profile-name">{userInfo.name || '—'}</h3>
            <div className="profile-tags">
              <span className="tag-branch">
                {Array.isArray(userInfo.branchIds) && userInfo.branchIds.length > 0
                  ? userInfo.branchIds[0].name
                  : 'N/A'}
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
              <span className="info-label">Expertise</span>
              <span className="info-val">
                {Array.isArray(trainer.specialization) && trainer.specialization.length > 0
                  ? trainer.specialization.join(', ')
                  : '—'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Experience</span>
              <span className="info-val">
                {trainer.experience
                  ? `${trainer.experience} ${trainer.experience === 1 ? 'Year' : 'Years'}`
                  : '—'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Biometric ID</span>
              <span className="info-val">{userInfo.biometricId || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Branch</span>
              <span className="info-val">
                {Array.isArray(userInfo.branchIds) && userInfo.branchIds.length > 0
                  ? userInfo.branchIds.map((b: any) => b.name).join(', ')
                  : '—'}
              </span>
            </div>
          </div>

          <div className={`profile-expand-wrapper ${expanded ? 'expanded' : ''}`}>
            <div className="info-grid expand-grid">
              <div className="info-item">
                <span className="info-label">Branch ID</span>
                <span className="info-val">
                  {Array.isArray(userInfo.branchIds) && userInfo.branchIds.length > 0
                    ? userInfo.branchIds.map((b: any) => b.branchId).join(', ')
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <button className="expand-toggle" onClick={() => setExpanded(p => !p)}>
            {expanded ? <UpOutlined /> : <DownOutlined />}
            <span>{expanded ? 'Hide Details' : 'Show More'}</span>
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="content">
        <CommonSider
          items={MENU_ITEMS.map(item => ({
            key:   item.id,
            label: item.label,
            icon:  null,
            path:  item.path.slice(1),
          }))}
          activeKey={activeKey}
          onSelect={(key: string) => {
            const item = MENU_ITEMS.find(i => i.id === key);
            if (item) navigate(`/trainer-detail/${id}/${item.path.slice(1)}`);
          }}
          mobileTabsProps={{
            tabItems,
            currentTab,
            onTabClick: ({ key }: { key: string }) => navigate(`/trainer-detail/${id}/${key}`),
          }}
        />
        <div className="trainer-detail-content">
          <Outlet context={{ trainer }} />
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

export default TrainerDetailPage;
