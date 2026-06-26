import { user as userImg } from '../../assets/index';
import './styles.scss';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import CommonSider from '../../components/commonSider';
import {
  DirectorAttendancePageRoute,
  DirectorBiometricAccessPageRoute,
  DirectorDetailPageRoute,
} from '../../routes/routepath';
import { useGetDirectorDetailQuery } from '../../services/director';

/* ─── Constants ──────────────────────────────────────────────────────── */

const MENU_ITEMS = [
  { id: 'attendance',      label: 'Attendance',       path: DirectorAttendancePageRoute      },
  { id: 'biometricAccess', label: 'Biometric Access', path: DirectorBiometricAccessPageRoute },
];

/* ─── Component ──────────────────────────────────────────────────────── */

const DirectorDetailPage = () => {
  const { id }   = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: directorData, error, isLoading, isError } =
    useGetDirectorDetailQuery(id as any, { skip: !id });

  const [expanded, setExpanded] = useState(false);

  const directorDetail: any = (directorData as any)?.data || {};

  const userInfo = {
    biometricId: directorDetail?.userId?.biometricId || '',
    name:        directorDetail.name    || '',
    email:       directorDetail.email   || '',
    phone:       directorDetail.number  || '',
    address:     directorDetail.address || '',
    status:      directorDetail.status  || directorDetail.userId?.status || 'ACTIVE',
  };

  const employeeInfo = {
    photo:      directorDetail.photo  || directorDetail.image || '',
    directorId: directorDetail._id   || '',
    role:       directorDetail.role?.name   || '',
    branch:     directorDetail.branch?.name || '',
    status:     directorDetail.status || directorDetail.userId?.status || 'ACTIVE',
  };

  const status   = employeeInfo.status?.toLowerCase() || 'active';
  const tabItems = MENU_ITEMS.map(item => ({ key: item.path, label: item.label }));

  const pathSegments = location.pathname.split('/');
  let currentTab = pathSegments[pathSegments.length - 1] || 'attendance';
  if (['membership-freezability', 'freezability', 'membership-days', 'days'].includes(currentTab)) {
    currentTab = 'membership';
  }
  const activeKey = MENU_ITEMS.find(item => currentTab === item.path.slice(1))?.id ?? MENU_ITEMS[0].id;

  if (isLoading) {
    return (
      <div className="director-detail-page loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="director-detail-page error-container">
        <p>Error loading director details: {(error as any)?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  return (
    <div className="director-detail-page">

      {/* ── PROFILE CARD ── */}
      <div className="profile-card">

        <div className="profile-left">
          <div className={`avatar-wrap ${status}`}>
            <img src={employeeInfo.photo || userImg} alt="director" />
            <span className={`status-dot ${status}`}>
              {employeeInfo.status
                ? employeeInfo.status.charAt(0).toUpperCase() + employeeInfo.status.slice(1)
                : 'Active'}
            </span>
          </div>
          <div className="profile-identity">
            <h3 className="profile-name">{userInfo.name || '—'}</h3>
            <div className="profile-tags">
              <span className="tag-branch">{employeeInfo.branch || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="profile-divider" />

        <div className="profile-right">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Mobile</span>
              <span className="info-val">{userInfo.phone || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-val">{userInfo.email || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="info-val">{employeeInfo.role || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Biometric ID</span>
              <span className="info-val">{userInfo.biometricId || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Branch</span>
              <span className="info-val">{employeeInfo.branch || '—'}</span>
            </div>
          </div>

          <div className={`profile-expand-wrapper ${expanded ? 'expanded' : ''}`}>
            <div className="info-grid expand-grid">
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-val">{userInfo.address || '—'}</span>
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
            if (item) navigate(`${DirectorDetailPageRoute}${id}/${item.path.slice(1)}`);
          }}
          mobileTabsProps={{
            tabItems,
            currentTab,
            onTabClick: ({ key }: { key: string }) =>
              navigate(`${DirectorDetailPageRoute}/${id}/${key}`),
          }}
        />
        <div className="employee-detail-content">
          <Outlet context={{ director: directorDetail, userInfo, employeeInfo }} />
        </div>
      </div>
    </div>
  );
};

export default DirectorDetailPage;
