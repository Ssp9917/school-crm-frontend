import React from "react";
import { Form, Input, Button, Typography, message, notification, AutoComplete } from "antd";
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import "./styles.scss";
import { whiteLogo } from "../../../assets";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmailCheckMutation, useLoginMutation } from "../../../services/auth";
import { forgotPasswordRoute } from "../../../routes/routepath";

const REMEMBERED_EMAILS_KEY = 'rememberedEmails';

const getRememberedEmails = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(REMEMBERED_EMAILS_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const rememberEmail = (email) => {
  try {
    const updated = [email, ...getRememberedEmails().filter(e => e !== email)].slice(0, 5);
    localStorage.setItem(REMEMBERED_EMAILS_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [savedEmails] = useState(getRememberedEmails);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const [emailCheck, { isLoading: checking }] = useEmailCheckMutation();
  const [loginMutation, { isLoading: logging }] = useLoginMutation();

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

  const handleContinue = async () => {
    if (!email) return;
    try {
      const res = await emailCheck({ email }).unwrap();
      // interpret truthy success flag or boolean response
      const ok = res?.success ?? res?.status ?? res?.exists ?? res === true;
      if (ok) {
        setRequiresPassword(true);
      } 
    } catch (err) {
     console.error('Email check failed', err);
    }
  };

  const handleLogin = async () => {
    if (!password) return;
    try {
      const res = await loginMutation({ email, password }).unwrap();
      message.success(res?.message || 'Login successful');
      rememberEmail(email);
      // store token and user data in localStorage if present
      if (res?.token) {
        try {
          localStorage.setItem('token', res.token);
        } catch (e) {
          console.warn('Failed to save token to localStorage', e);
        }
      }
      if (res?.user) {
        try {
          localStorage.setItem('user', JSON.stringify(res.user));
        } catch (e) {
          console.warn('Failed to save user to localStorage', e);
        }
      }
      // redirect to home/dashboard
      try {
        window.location.href = '/';
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Typography.Title level={2} className="title">
            <img src={whiteLogo} alt="" />
        </Typography.Title>

        <div className="card-box">
          <div className="logo-circle">F</div>
          <h2>Power Up Your Management</h2>
          <p>All member data, analytics, and tools in one place.</p>

          <Form layout="vertical" onFinish={requiresPassword ? handleLogin : handleContinue} onFinishFailed={onFinishFailed}>
            {!requiresPassword ? (
              <Form.Item label="Email">
                <AutoComplete
                  style={{ width: '100%' }}
                  options={savedEmails.map(e => ({ value: e }))}
                  value={email}
                  onChange={(val) => setEmail(val)}
                  filterOption={(input, option) =>
                    String(option?.value ?? '').toLowerCase().includes(String(input).toLowerCase())
                  }
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Enter Your Email"
                    autoComplete="email"
                  />
                </AutoComplete>
              </Form.Item>
            ) : (
              <Form.Item label="Password">
                <Input
                  prefix={<LockOutlined />}
                  suffix={
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer', color: '#666' }}
                    >
                      {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </span>
                  }
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Item>
            )}

            <div className="forgot" onClick={() => navigate(forgotPasswordRoute)}>Forgot Password?</div>

            <Button
              type="primary"
              block
              className="signin-btn"
              htmlType="submit"
              loading={requiresPassword ? logging : checking}
            >
              {requiresPassword ? 'Sign In' : 'Continue to Signin'}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
