import React from 'react';
import { Button, Card, Typography, Form, Row, Col, Tag, Space, Divider, Avatar, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
    WifiOutlined, 
    PlusOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined,
    SettingOutlined,
    DashboardOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

// Mock data - replace with actual data from your API/state
const mockRouters = [
    {
        id: 1,
        name: 'Main Office Router',
        model: 'MikroTik RB4011',
        ipAddress: '192.168.1.1',
        status: 'connected',
        lastSeen: '2 minutes ago',
        location: 'Office Building A'
    },
    {
        id: 2,
        name: 'Branch Router',
        model: 'MikroTik hAP ac2',
        ipAddress: '192.168.2.1',
        status: 'connected',
        lastSeen: '5 minutes ago',
        location: 'Branch Office'
    },
    {
        id: 3,
        name: 'Warehouse Router',
        model: 'MikroTik RB2011',
        ipAddress: '192.168.3.1',
        status: 'disconnected',
        lastSeen: '1 hour ago',
        location: 'Warehouse'
    }
];

const RoutersConnected = () => {
    const navigate = useNavigate();

    const handleNewConnect = () => {
        navigate("/mikrotik-login");
    };

    const handleRouterClick = (routerId) => {
        navigate(`/router-details/${routerId}`);
    };

    const handleManageRouter = (routerId, e) => {
        e.stopPropagation();
        // Navigate to management page or open management modal
        console.log('Manage router:', routerId);
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            connected: {
                color: 'green',
                icon: <CheckCircleOutlined />,
                text: 'Connected'
            },
            disconnected: {
                color: 'red',
                icon: <CloseCircleOutlined />,
                text: 'Disconnected'
            },
            connecting: {
                color: 'blue',
                icon: <WifiOutlined />,
                text: 'Connecting'
            }
        };

        const config = statusConfig[status] || statusConfig.disconnected;
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    return (
        <div className='routers-container' style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ fontWeight: "bold", color: "#007bff", marginTop: "350px" }}>
                        <WifiOutlined style={{ marginRight: 8 }} />
                        Connected Routers
                    </Title>
                    <Text type="secondary" style={{ fontWeight: "bold", color: "#007bff", marginTop: "10px" }}>
                        Manage and monitor your MikroTik routers
                    </Text>
                </Col>
                <Col>
                    <Button
                    style={{marginTop: "10px"}}
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={handleNewConnect}
                    >
                        New Connection
                    </Button>
                </Col>
            </Row>

            <Divider />

            {/* Routers List */}
            <Row gutter={[16, 16]}>
                {mockRouters.map(router => (
                    <Col xs={24} sm={12} lg={8} key={router.id}>
                        <Card
                            className="router-card"
                            hoverable
                            onClick={() => handleRouterClick(router.id)}
                            style={{
                                borderLeft: `4px solid ${
                                    router.status === 'connected' ? '#52c41a' : 
                                    router.status === 'disconnected' ? '#ff4d4f' : '#1890ff'
                                }`,
                                height: '100%'
                            }}
                            actions={[
                                <SettingOutlined 
                                    key="manage" 
                                    onClick={(e) => handleManageRouter(router.id, e)}
                                />,
                                <DashboardOutlined 
                                    key="dashboard" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/router-dashboard/${router.id}`);
                                    }}
                                />
                            ]}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {/* Router Header */}
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Text strong style={{ fontSize: '16px' }}>
                                            {router.name}
                                        </Text>
                                    </Col>
                                    <Col>
                                        {getStatusTag(router.status)}
                                    </Col>
                                </Row>

                                {/* Router Details */}
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Row justify="space-between">
                                        <Text type="secondary">Model:</Text>
                                        <Text strong>{router.model}</Text>
                                    </Row>
                                    <Row justify="space-between">
                                        <Text type="secondary">IP Address:</Text>
                                        <Text code>{router.ipAddress}</Text>
                                    </Row>
                                    <Row justify="space-between">
                                        <Text type="secondary">Location:</Text>
                                        <Text>{router.location}</Text>
                                    </Row>
                                    <Row justify="space-between">
                                        <Text type="secondary">Last Seen:</Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {router.lastSeen}
                                        </Text>
                                    </Row>
                                </Space>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Empty State */}
            {mockRouters.length === 0 && (
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                    <WifiOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                    <Title level={4} type="secondary">
                        No Routers Connected
                    </Title>
                    <Text type="secondary">
                        Get started by adding your first MikroTik router
                    </Text>
                    <br />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleNewConnect}
                        style={{ marginTop: 16 }}
                    >
                        Add First Router
                    </Button>
                </Card>
            )}
        </div>
    );
};

export default RoutersConnected;