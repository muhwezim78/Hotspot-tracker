import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  Alert,
  Space,
  Steps,
  Row,
  Col,
  Select,
  message
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  ShopOutlined,
  IdcardOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';


const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SignUp = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const steps = [
    {
      title: 'Personal Info',
      icon: <UserOutlined />
    },
    {
      title: 'Account Details',
      icon: <MailOutlined />
    },
    {
      title: 'Verification',
      icon: <IdcardOutlined />
    }
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Generate user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const userData = {
        userId,
        email: values.email,
        password: values.password,
        full_name: values.fullName,
        phone: values.phone,
        company_name: values.companyName,
        role: values.role || 'user'
      };

      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Registration successful! Please check your email for verification.');
        
        // Send verification code
        const verifyResponse = await fetch('/auth/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: values.email, user_id: userId }),
        });

        const verifyResult = await verifyResponse.json();
        if (verifyResult.success) {
          setVerificationSent(true);
          setCurrentStep(2);
          message.info('Verification code sent to your email!');
        }
      } else {
        message.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode) {
      message.error('Please enter verification code');
      return;
    }

    setLoading(true);
    try {

      const response = await fetch('/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.getFieldValue('email'),
          code: verificationCode
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Email verified successfully! You can now login.');
        navigate('/login');
      } else {
        message.error(result.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      message.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    try {
      const response = await fetch('/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.getFieldValue('email') }),
      });

      const result = await response.json();
      if (result.success) {
        message.success('Verification code resent!');
      } else {
        message.error(result.error || 'Failed to resend verification code.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      message.error('Failed to resend verification code.');
    }
  };

  const nextStep = () => {
    form.validateFields(steps[currentStep].fields)
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch(errorInfo => {
        console.log('Validation failed:', errorInfo);
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Define fields for each step for validation
  steps[0].fields = ['fullName', 'phone', 'companyName', 'role'];
  steps[1].fields = ['email', 'password', 'confirmPassword'];

  const passwordRules = [
    { required: true, message: 'Please input your password!' },
    { min: 8, message: 'Password must be at least 8 characters!' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain uppercase, lowercase and number!' }
  ];

  return (
    <div className="signup-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '20px' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card 
            className="signup-card"
            bordered={false}
            style={{ 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px'
            }}
          >
            <div className="signup-header">
              <Title level={2} style={{ textAlign: 'center', marginBottom: 8, color: '#1890ff' }}>
                Create Account
              </Title>
              <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 32 }}>
                Join our platform to manage your MikroTik routers and subscriptions
              </Paragraph>
            </div>

            <Steps 
              current={currentStep} 
              items={steps}
              style={{ marginBottom: 32 }}
              responsive={false}
            />

            <Form
              form={form}
              name="signup"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              disabled={loading}
            >
              {currentStep === 0 && (
                <div className="step-content">
                  <Title level={4}>Personal Information</Title>
                  <Form.Item
                    name="fullName"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please input your full name!' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Enter your full name"
                    />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                      { required: true, message: 'Please input your phone number!' },
                      { pattern: /^\+?[\d\s-]+$/, message: 'Please enter a valid phone number!' }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="Enter your phone number"
                    />
                  </Form.Item>

                  <Form.Item
                    name="companyName"
                    label="Company Name"
                  >
                    <Input 
                      prefix={<ShopOutlined />} 
                      placeholder="Enter your company name (optional)"
                    />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    label="Account Type"
                    rules={[{ required: true, message: 'Please select account type!' }]}
                  >
                    <Select placeholder="Select your account type">
                      <Option value="user">Individual User</Option>
                      <Option value="business">Business Account</Option>
                      <Option value="reseller">Reseller</Option>
                    </Select>
                  </Form.Item>
                </div>
              )}

              {currentStep === 1 && (
                <div className="step-content">
                  <Title level={4}>Account Details</Title>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="Enter your email address"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Password"
                    rules={passwordRules}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Create a strong password"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('The two passwords do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Confirm your password"
                    />
                  </Form.Item>

                  <Alert
                    message="Password Requirements"
                    description="Must be at least 8 characters with uppercase, lowercase letters and numbers."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="step-content">
                  <Title level={4}>Email Verification</Title>
                  <Alert
                    message="Verification Required"
                    description={`We've sent a verification code to ${form.getFieldValue('email')}. Please enter it below to complete your registration.`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <Form.Item
                    label="Verification Code"
                    required
                  >
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit verification code"
                      style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '18px' }}
                      maxLength={6}
                    />
                  </Form.Item>

                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Button type="link" onClick={resendVerificationCode}>
                      Resend verification code
                    </Button>
                  </div>
                </div>
              )}

              <div className="signup-actions">
                <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                  {currentStep > 0 && currentStep < 2 ? (
                    <Button 
                      onClick={prevStep}
                      icon={<ArrowLeftOutlined />}
                      disabled={loading}
                    >
                      Previous
                    </Button>
                  ) : (
                    <div></div> // Empty div for spacing
                  )}

                  {currentStep < 1 ? (
                    <Button 
                      type="primary" 
                      onClick={nextStep}
                      icon={<ArrowRightOutlined />}
                    >
                      Next
                    </Button>
                  ) : currentStep === 1 ? (
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={loading}
                    >
                      Register & Verify
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      onClick={handleVerificationSubmit}
                      loading={loading}
                      disabled={!verificationCode}
                    >
                      Verify & Complete
                    </Button>
                  )}
                </Space>
              </div>
            </Form>

            <Divider style={{ margin: '24px 0' }}>
              Or
            </Divider>

            <div className="signup-footer" style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: 600 }}>
                  Sign In
                </Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SignUp;