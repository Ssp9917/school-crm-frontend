import { user } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button, Modal } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import {
  EmployeeDetailAttendanceRoute,
  EmployeeDetailBiometricAccessRoute,
  EmployeeDetailEmployeeIdRoute,
  EmployeeDetailParkingHistoryRoute,
  EmployeeDetailSalaryRoute,
  EmployeeDetailSalesHistoryRoute,
} from '../../routes/routepath';
import { useGetEmployeeDetailQuery } from '../../services/employee';
import { useUpdateUserPhotoMutation } from '../../services/user';
import { usePushUserToBranchMutation } from '../../services/biometric';
import usePermissions from '../../hooks/usePermissions';
import CommonSider from '../../components/commonSider';
import AvatarPhotoActions from '../../components/form/AvatarPhotoActions';

const menuItems = [
  { id: 'attendance',      label: 'Attendance',       path: EmployeeDetailAttendanceRoute },
  { id: 'employeeId',      label: 'Employee ID',      path: EmployeeDetailEmployeeIdRoute },
  { id: 'salary',          label: 'Salary',           path: EmployeeDetailSalaryRoute },
  { id: 'salesHistory',    label: 'Sales History',    path: EmployeeDetailSalesHistoryRoute },
  { id: 'parkingHistory',  label: 'Parking History',  path: EmployeeDetailParkingHistoryRoute },
  { id: 'biometricAccess', label: 'Biometric Access', path: EmployeeDetailBiometricAccessRoute },
];

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, refetch } = useGetEmployeeDetailQuery(id);
  const employee  = data?.data || {};
  const userInfo  = employee.user || {};
  const [expanded, setExpanded] = useState(false);
  const [biometricModal, setBiometricModal] = useState(false);
  const [pushUserToBranch, { isLoading: pushingBiometric }] = usePushUserToBranchMutation();

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

  const handleAddBiometric = () => setBiometricModal(true);

  const handleBiometricConfirm = async () => {
    try {
      await (pushUserToBranch as any)({ userId: userInfo._id || id }).unwrap();
      setBiometricModal(false);
    } catch {
      setBiometricModal(false);
    }
  };

  const status = userInfo.status?.toLowerCase() || 'active';

  const tabItems = menuItems.map(item => ({
    key: item.path.slice(1),
    label: item.label,
  }));

  const pathSegments = location.pathname.split('/');
  const currentTab  = pathSegments[pathSegments.length - 1] || EmployeeDetailAttendanceRoute.slice(1);
  const activeKey   = menuItems.find(item => currentTab === item.path.slice(1))?.id ?? menuItems[0].id;

  return (
    <div className="employee-detail-page">

      {/* ── PROFILE CARD ── */}
      <div className="profile-card">

        <div className="profile-left">
          <div className={`avatar-wrap ${status}`}>
            <img src={userInfo.photo || employee.photo || user} alt="employee" />
            <AvatarPhotoActions
              photoUrl={userInfo.photo || employee.photo || user}
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
              <span className="info-label">Email</span>
              <span className="info-val">{userInfo.email || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Employee ID</span>
              <span className="info-val">{employee.employeeId || id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Biometric ID</span>
              <span className="info-val">{userInfo.biometricId || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-val">{employee.address || '—'}</span>
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
            path: item.path.slice(1),
          }))}
          activeKey={activeKey}
          onSelect={key => {
            const item = menuItems.find(i => i.id === key);
            if (item) navigate(`/employee-detail/${id}/${item.path.slice(1)}`);
          }}
          mobileTabsProps={{
            tabItems,
            currentTab,
            onTabClick: ({ key }) => navigate(`/employee-detail/${id}/${key}`),
          }}
        />
        <div className="employee-detail-content">
          <Outlet context={{ employee }} />
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

export default EmployeeDetailPage;
