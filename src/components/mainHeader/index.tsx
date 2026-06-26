import { useState, useEffect } from "react";
import { IoMenuOutline } from "react-icons/io5";
import { FiMoon, FiSun } from "react-icons/fi";
import { Select, Avatar, Dropdown, Modal, Form, Input, Button, message, notification } from "antd";
import { UserOutlined, LogoutOutlined, KeyOutlined } from "@ant-design/icons";
import { useTheme } from "../../context/ThemeContext";
import { useGetBranchesQuery } from "../../services/branches";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedBranch } from "../../services/branchSlice";
import { useSelfChangePasswordMutation } from "../../services/auth";
import "./styles.scss";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface UserBranch {
  _id: string;
  name?: string;
}

interface StoredUser {
  name?: string;
  userType?: string;
  branchIds?: UserBranch[];
  roleId?: { name?: string };
}

interface PasswordValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface MainHeaderProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isMobile: boolean;
  toggleMobileDrawer: () => void;
}

/* ─── Component ──────────────────────────────────────────────────────── */

const MainHeader = ({ collapsed, setCollapsed, isMobile, toggleMobileDrawer }: MainHeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const dispatch = useDispatch();
  const selectedBranch = useSelector((state: any) => state.branch.selectedBranch);

  const [selfChangePassword, { isLoading: changingPassword }] = useSelfChangePasswordMutation();
  const { data: branchData, isLoading: branchLoading }        = useGetBranchesQuery();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm]                            = Form.useForm<PasswordValues>();
  const [userData, setUserData]                   = useState<StoredUser | null>(null);
  const [isUserDataLoaded, setIsUserDataLoaded]   = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const raw = localStorage.getItem('user');
        setUserData(raw ? (JSON.parse(raw) as StoredUser) : null);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUserData(null);
      } finally {
        setIsUserDataLoaded(true);
      }
    };

    loadUserData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') loadUserData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const userName     = userData?.name       || 'Loading...';
  const userBranches = userData?.branchIds  || [];
  const userType     = userData?.userType;
  const roleId       = userData?.roleId?.name;

  const shouldDisableBranchSelector = userType !== 'SUPERADMIN' && userBranches.length <= 1;

  useEffect(() => {
    if (isUserDataLoaded && userType !== 'SUPERADMIN' && userBranches.length === 1 && !selectedBranch) {
      dispatch(setSelectedBranch(userBranches[0]._id));
    }
  }, [userBranches, selectedBranch, dispatch, userType, isUserDataLoaded]);

  const handleMenuClick = () => {
    if (isMobile) toggleMobileDrawer();
    else setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('siderMenuData');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage on logout', e);
    }
    window.location.replace('/login');
  };

  const profileMenu = {
    items: [
      {
        key: '1',
        label: (
          <div className="profile-name">
            {isUserDataLoaded ? userName : 'Loading...'}
            <br />
            <span style={{ color: 'gray', fontSize: '11px', textTransform: 'capitalize' }}>
              {isUserDataLoaded ? roleId : 'Loading...'}
            </span>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' as const },
      {
        key: '2',
        label: (
          <div className="change-password-item" onClick={() => setShowPasswordModal(true)}>
            <KeyOutlined /> Change Password
          </div>
        ),
      },
      {
        key: '3',
        label: (
          <div className="logout-item" onClick={handleLogout}>
            <LogoutOutlined /> Logout
          </div>
        ),
      },
    ],
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

  const handlePasswordSubmit = async (values: PasswordValues) => {
    try {
      await (selfChangePassword as any)({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();
      setShowPasswordModal(false);
      passwordForm.resetFields();
      const rememberedEmails = localStorage.getItem('rememberedEmails');
      localStorage.clear();
      if (rememberedEmails) localStorage.setItem('rememberedEmails', rememberedEmails);
      window.location.replace('/login');
    } catch (error: any) {
      message.error(error?.data?.message);
    }
  };

  const handlePasswordModalCancel = () => {
    setShowPasswordModal(false);
    passwordForm.resetFields();
  };

  const validateConfirmPassword = ({ getFieldValue }: { getFieldValue: (name: string) => string }) => ({
    validator(_: unknown, value: string) {
      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
      return Promise.reject(new Error('Passwords do not match!'));
    },
  });

  return (
    <>
      <header className="main-header">
        <div className="left-section">
          <button className="menu-btn" onClick={handleMenuClick}>
            <IoMenuOutline />
          </button>

          <Select
            value={selectedBranch || undefined}
            className="dark-select"
            classNames={{ popup: { root: 'dark-select-dropdown' } }}
            style={{ minWidth: 180 }}
            loading={branchLoading}
            placeholder="Select Branch"
            onChange={val => dispatch(setSelectedBranch(val))}
            optionFilterProp="children"
            showSearch
            disabled={shouldDisableBranchSelector}
          >
            {(userType === 'SUPERADMIN' || userBranches.length > 1) && (
              <Select.Option value="all">All Branches</Select.Option>
            )}
            {userType === 'SUPERADMIN'
              ? (branchData as any)?.data?.map((branch: UserBranch) => (
                  <Select.Option key={branch._id} value={branch._id}>{branch.name}</Select.Option>
                ))
              : userBranches.map(branch => (
                  <Select.Option key={branch._id} value={branch._id}>{branch.name}</Select.Option>
                ))
            }
          </Select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Switch theme">
            {isLight ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <Dropdown menu={profileMenu} placement="bottomRight" arrow>
            <Avatar
              size={40}
              className="profile-avatar"
              icon={<UserOutlined />}
              style={{ backgroundColor: 'var(--accent)', color: 'var(--sider-text)' }}
            />
          </Dropdown>
        </div>
      </header>

      <Modal
        title="Change Password"
        open={showPasswordModal}
        onCancel={handlePasswordModalCancel}
        footer={null}
        width={500}
        className="change-password-modal"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
          onFinishFailed={onFinishFailed}
          className="password-form"
        >
          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[
              { required: true, message: 'Please enter your current password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm new password' },
              validateConfirmPassword(passwordForm as any),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <div className="modal-actions">
            <Button type="default" onClick={handlePasswordModalCancel} className="cancel-btn">Cancel</Button>
            <Button type="primary" htmlType="submit" className="submit-btn" loading={changingPassword}>Change Password</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default MainHeader;
