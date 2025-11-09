import React from "react";
import { Form, Button, Col, Row, Card, Input, Typography, Divider } from "antd";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import SafeAlert from "@components/Alert";
import { useState, useContext } from "react";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [authError, setAuthError] = useState(null);
  const sessionExpired = searchParams.get("session_expired") === "true";
  const [apiError, setApiError] = useState(null);
  const loginError = apiError || authError;
  const [isSubmitting, setIsSubmitting] = useState(false);
   const navigate = useNavigate();

  const onFinish = async ({ email, password }) => {};
  const handleLogin = () =>{
    navigate("/routers")
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      <Card className="login-card">
        {sessionExpired && (
          <SafeAlert
            message="Session Expired"
            description="Please login again  to continue..."
            showIcon
            closable
          />
        )}
        {loginError && (
          <SafeAlert
            message="Login failed"
            description={
              typeof loginError === "string"
                ? loginError
                : "An unexpected error occurred. Please try again."
            }
            type="error"
            showIcon
            closable
          />
        )}
        <div className="login-form">
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label={
                <span style={{ fontWeight: "bold", color: "#007bff" }}>
                  Email
                </span>
              }
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                placeholder="Enter your email"
                autoComplete="email"
                aria-label="Email"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={
                <span style={{ fontWeight: "bold", color: "#007bff" }}>
                  Password
                </span>
              }
            >
              <Input.Password
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-label="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
              onClick={handleLogin}
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                block
                size="large"
                aria-label="Log in"
              >
                Log in
              </Button>
            </Form.Item>

            <div className="auth-links">
              <Text>
                <Link to="/forgot-password">Forgot password?</Link>
              </Text>
              <br />
              <Text className="txt" style={{ color: "#666" }}>
                {
                  <span style={{ color: "#f90633ff" }}>
                    {" "}
                    Don't have an account?{" "}
                  </span>
                }
                <br />
                <Link to="/signup">Register</Link>
              </Text>
            </div>
            <Divider/>
            <Card>
              <Link to="/access">Subscribe Now</Link>
            </Card>
          </Form>
        </div>
      </Card>
    </div>
  );
};
export default Login;
