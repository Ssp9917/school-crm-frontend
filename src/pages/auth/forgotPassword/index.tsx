import { useState } from 'react';
import { Form, Input, Button, message, notification } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { whiteLogo } from '../../../assets';
import { useForgotPasswordMutation, useVerifyOtpMutation, useResetPasswordMutation } from '../../../services/auth';
import { loginRoute } from '../../../routes/routepath';
import './styles.scss';

const STEP_EMAIL = 'email';
const STEP_OTP = 'otp';
const STEP_PASSWORD = 'password';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [forgotPassword, { isLoading: sendingOtp }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const handleSendOtp = async () => {
    if (!email) return;
    try {
      await forgotPassword({ email }).unwrap();
      message.success('OTP sent to your email');
      setStep(STEP_OTP);
    } catch (err) {
      message.error(err?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    try {
      await verifyOtp({ email, otp }).unwrap();
      message.success('OTP verified');
      setStep(STEP_PASSWORD);
    } catch (err) {
      message.error(err?.data?.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    try {
      await resetPassword({ email, newPassword, confirmPassword }).unwrap();
      message.success('Password reset successfully!');
      navigate(loginRoute);
    } catch (err) {
      message.error(err?.data?.message || 'Failed to reset password');
    }
  };

  const onFinishFailed = ({ errorFields }) => {
    if (!errorFields?.length) return;
    const labels = errorFields.map(f => {
      const name = Array.isArray(f.name) ? f.name[0] : f.name;
      return String(name).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    });
    const unique = [...new Set(labels)];
    notification.error({
      message: 'Required Fields Missing',
      description: unique.join(', '),
      placement: 'topRight',
      duration: 4,
    });
  };

  const stepConfig = {
    [STEP_EMAIL]: { title: 'Forgot Password', subtitle: 'Enter your email to receive a reset OTP.', action: handleSendOtp, loading: sendingOtp, btnText: 'Send OTP' },
    [STEP_OTP]:   { title: 'Verify OTP',       subtitle: `OTP sent to ${email}`,                   action: handleVerifyOtp,  loading: verifyingOtp, btnText: 'Verify OTP' },
    [STEP_PASSWORD]: { title: 'New Password',  subtitle: 'Set your new password.',                 action: handleResetPassword, loading: resetting, btnText: 'Reset Password' },
  };

  const current = stepConfig[step];

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="title">
          <img src={whiteLogo} alt="logo" />
        </div>

        <div className="card-box">
          <div className="logo-circle">F</div>
          <h2>{current.title}</h2>
          <p>{current.subtitle}</p>

          <div className="step-dots">
            {[STEP_EMAIL, STEP_OTP, STEP_PASSWORD].map((s) => (
              <span key={s} className={`dot ${step === s ? 'active' : ''} ${[STEP_EMAIL, STEP_OTP, STEP_PASSWORD].indexOf(s) < [STEP_EMAIL, STEP_OTP, STEP_PASSWORD].indexOf(step) ? 'done' : ''}`} />
            ))}
          </div>

          <Form layout="vertical" onFinish={current.action} onFinishFailed={onFinishFailed}>
            {step === STEP_EMAIL && (
              <Form.Item label="Email">
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>
            )}

            {step === STEP_OTP && (
              <Form.Item label="OTP">
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </Form.Item>
            )}

            {step === STEP_PASSWORD && (
              <>
                <Form.Item label="New Password">
                  <Input
                    prefix={<LockOutlined />}
                    suffix={
                      <span onClick={() => setShowNew(p => !p)} style={{ cursor: 'pointer', color: '#666' }}>
                        {showNew ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </span>
                    }
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Confirm Password">
                  <Input
                    prefix={<LockOutlined />}
                    suffix={
                      <span onClick={() => setShowConfirm(p => !p)} style={{ cursor: 'pointer', color: '#666' }}>
                        {showConfirm ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </span>
                    }
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Item>
              </>
            )}

            {step === STEP_OTP && (
              <div className="resend-row">
                <span onClick={handleSendOtp} className="resend-link">Resend OTP</span>
              </div>
            )}

            <Button
              type="primary"
              block
              className="submit-btn"
              htmlType="submit"
              loading={current.loading}
            >
              {current.btnText}
            </Button>
          </Form>

          <div className="back-to-login" onClick={() => navigate(loginRoute)}>
            Back to Login
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
