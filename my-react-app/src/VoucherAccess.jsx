import React, { useState } from "react";
import { Form, Button, Col, Row, Card, Input, Typography, Divider } from "antd";
import SafeAlert from "@components/Alert";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;

const VoucherAccess = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessError, setAccessError] = useState(null);

  const handleStatus = () => {
    navigate("/status");
  };

  return (
    <div className="voucher-access-container">
      <div className="voucher-access-header">
        <h1>Access</h1>
        <p>Please enter your subscription voucher code to gain access.</p>
      </div>
      <Card className="voucher-access-card">
        {accessError && (
          <SafeAlert
            message="Authentication failed"
            description={
              typeof accessError === "string"
                ? accessError
                : "An unexpected error occurred. Please try again."
            }
            type="error"
            showIcon
            closable
          />
        )}
        <Form>
          <Form.Item
            name="voucher-code"
            label={
              <span style={{ fontWeight: "bold", color: "#007bff" }}>
                Subscription Voucher Code
              </span>
            }
            rules={[
              { required: true, message: "Please input your access code!" },
              {
                type: "access-code",
                message: "Please enter a valid access code!",
              },
            ]}
          >
            <Input
              placeholder="Enter your access code"
              autoComplete="access-code"
              aria-label="Access Code"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              block
              size="large"
              aria-label="Authenticate"
            >
              Authenticate
            </Button>
            <Divider/>
            <Text style={{ fontSize: "bold", color: "white" }}>Check Access Status</Text>
            <Button onClick={handleStatus}>Status</Button>
          </Form.Item>
          .
        </Form>
      </Card>
    </div>
  );
};
export default VoucherAccess;
