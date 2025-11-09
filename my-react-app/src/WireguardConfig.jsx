import React from "react";
import { Form, Button, Col, Row, Card, Typography, Input, Divider } from "antd";
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const WireguardConfig = () => {
    const navigate = useNavigate();

    const handleConfig = ()=>{
        navigate("/app");
    }
  return (
    <div className="wireguard-container">
      <div className="container-header">
        <h1 style={{ color: "white"}}>Wireguard</h1>
        <p style={{ color: "white"}}>Please enter your wireguard configuration to proceed.</p>
      </div>
      <Card className="wireguard-card">
        <Form className="wireguard-form">
          <Text level={1} style={{ fontWeight: "bold", color: "red", fontSize: "24px" }}>Interface</Text>
          <Form.Item name="name" label={<span style={{ fontWeight: "bold", color: "#007bff" }}>Name</span>}>
            <Input placeholder="Name" aria-label="Name" autoComplete="Name" />
          </Form.Item>
          <Form.Item name="public-key" label={<span style={{ fontWeight: "bold", color: "#007bff" }}>Public Key</span>}>
            <Input placeholder="Public Key" aria-label="Public Key" />
          </Form.Item>
          <Form.Item name="addresses" label={<span style={{ fontWeight: "bold", color: "#007bff" }}>Addresses</span>}>
            <Input placeholder="Address" aria-label="Addresses" />
          </Form.Item>
          <Form.Item name="dns-servers" label={<span style={{ fontWeight: "bold", color: "#007bff" }}>DNS Servers</span>}>
            <Input placeholder="DNS Server" aria-label="DNS SErver" />
          </Form.Item>
          <Divider />
          <Text level={1} style={{ fontWeight: "bold", color: "red", fontSize: "24px" }}>Peer</Text>
          <Form.Item name="peer-public-key" label={<span style={{ fontWeight: "bold", color: "#007bff" }}>Public Key</span>}>
            <Input placeholder="Public Key" aria-label="Public Key" />
          </Form.Item>
          <Form.Item name="allowed-ips" label={<span style={{ fontWeight: "bold", color: "#007bff" }}>Allowed IPs</span>}>
            <Input placeholder="Enter Allowed IP" aria-label="Allowed IP" />
          </Form.Item>
          <Form.Item name="endpoint" label={<span style={{ fontWeight: "bold", color: "#007bff" }}>Endpoint</span>}>
            <Input placeholder="Enter your endpoint" aria-label="Public Key" />
          </Form.Item>
          <Form.Item
            name="persistent-keepalive"
            label={<span style={{ fontWeight: "bold", color: "#007bff" }}>Persistent Keepalive</span>}
          >
            <Input placeholder="" aria-label="Public Key" />
            <Text style={{ fontWeight: "bold", color: "#007bff" }}>seconds</Text>
            
          </Form.Item>
          <Form.Item>
            <Button
            onClick={handleConfig}
            >Connect</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WireguardConfig;
