import {
  Card, Table, Tag, Progress, Button, Row, Col, Statistic, List,
  Typography, Divider, Space
} from 'antd';
import React from 'react';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  StarOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  GiftOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const userSubscriptionData = {
  currentPackage: 'Premium',
  timeRemaining: '15 days 6 hours',
  lastSubscribed: '2025-10-15',
  renewalDate: '2025-11-15',
  progress: 65,
  status: 'active'
};

const packagesData = [
  {
    key: '1',
    name: 'Basic',
    price: 'UGX 20,000/month',
    originalPrice: 'UGX 25,000',
    duration: '1 month',
    benefits: [
      'Up to 1 devices',
      'Basic support',
      'Income Tracking',
      'Full time Monitoring'
    ],
    popular: false,
    recommended: false,
  },
  {
    key: '2',
    name: 'Premium',
    price: 'UGX 45,000/month',
    originalPrice: 'UGX 50,000',
    duration: '1 month',
    benefits: [
      'Up to 5 devices',
      'Priority support',
      'Income Tracking',
      'Advanced analytics'
    ],
    popular: true,
    recommended: false,
    current: true
  },
  {
    key: '3',
    name: 'Professional',
    price: 'UGX 100,000/month',
    originalPrice: 'UGX 120,000',
    duration: '1 month',
    benefits: [
      'Unlimited devices',
      '24/7 premium support',
      'Maximum speed',
      'Advanced analytics',
      'Income Tracking',
      'Notifications'
    ],
    recommended: true
  }
];

const AccessStatus = () => {
  const columns = [
    {
      title: 'Package Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Text strong>{record.name}</Text>
          {record.current && (
            <Tag color="blue" icon={<CheckCircleOutlined />}>Current</Tag>
          )}
          {record.popular && (
            <Tag color="orange" icon={<StarOutlined />}>Popular</Tag>
          )}
          {record.recommended && (
            <Tag color="green" icon={<CrownOutlined />}>Recommended</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
            {record.price}
          </Text>
          <Text delete type="secondary" style={{ fontSize: 12 }}>
            {record.originalPrice}
          </Text>
        </Space>
      )
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => <Tag>{duration}</Tag>
    },
    {
      title: 'Benefits',
      dataIndex: 'benefits',
      key: 'benefits',
      render: (benefits) => (
        <List
          size="small"
          dataSource={benefits}
          renderItem={(item) => (
            <List.Item><Text style={{ fontSize: 12 }}>• {item}</Text></List.Item>
          )}
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.current ? (
            <Button disabled>Current Plan</Button>
          ) : (
            <Button
              type={record.recommended ? 'primary' : 'default'}
              icon={record.recommended ? <RocketOutlined /> : <GiftOutlined />}
            >
              {record.recommended ? 'Upgrade' : 'Subscribe'}
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        title={<Space><CrownOutlined />Current Subscription Status</Space>}
        extra={<Tag color="green">{userSubscriptionData.status.toUpperCase()}</Tag>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={6}>
            <Statistic
              title="Time Remaining"
              prefix={<ClockCircleOutlined />}
              value={userSubscriptionData.timeRemaining}
            />
          </Col>
          <Col xs={24} md={6}>
            <Statistic
              title="Last Subscribed"
              prefix={<CalendarOutlined />}
              value={userSubscriptionData.lastSubscribed}
            />
          </Col>
          <Col xs={24} md={6}>
            <Statistic
              title="Current Package"
              prefix={<CrownOutlined />}
              value={userSubscriptionData.currentPackage}
            />
          </Col>
          <Col xs={24} md={6}>
            <Statistic
              title="Renewal Date"
              prefix={<CalendarOutlined />}
              value={userSubscriptionData.renewalDate}
            />
          </Col>
        </Row>

        <Divider />

        <Text strong>Subscription Progress</Text>
        <Progress
          percent={userSubscriptionData.progress}
          status="active"
          strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
        />
      </Card>

      <Card
        title={<Space><ThunderboltOutlined />Available Packages</Space>}
        extra={<Text type="secondary">Choose the plan that fits your needs</Text>}
      >
        <Table
          columns={columns}
          dataSource={packagesData}
          pagination={false}
          scroll={{ x: 1000 }}
          rowClassName={(record) => record.current ? 'current-package-row' : ''}
        />
      </Card>
    </div>
  );
};

export default AccessStatus;
