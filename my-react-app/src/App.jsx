// src/App.js
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Tag,
  Alert,
  Spin,
  Space,
  Typography,
  Divider,
  List,
  Descriptions,
  Progress,
  Tabs,
  Badge,
  Timeline,
  Empty
} from 'antd';
import {
  DollarOutlined,
  UserOutlined,
  RocketOutlined,
  FireOutlined,
  PlusOutlined,
  ReloadOutlined,
  WifiOutlined,
  ProfileOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const API_BASE = 'http://localhost:8000';

function App() {
  const [financialStats, setFinancialStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [profileStats, setProfileStats] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [systemInfo, setSystemInfo] = useState({});
  const [expiredVouchers, setExpiredVouchers] = useState([]);
  const [pricingRates, setPricingRates] = useState({});
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [form] = Form.useForm();
  const [pricingForm] = Form.useForm();

  const voucherFormInitialState = {
    profile_name: '',
    quantity: 1,
    customer_name: '',
    customer_contact: ''
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(false);
      const [
        statsRes, 
        revenueRes, 
        profilesRes, 
        profileStatsRes, 
        activeRes,
        systemRes,
        expiredRes,
        pricingRes
      ] = await Promise.all([
        fetch(`${API_BASE}/financial/stats`),
        fetch(`${API_BASE}/financial/revenue-data?days=7`),
        fetch(`${API_BASE}/profiles`),
        fetch(`${API_BASE}/financial/profile-stats`),
        fetch(`${API_BASE}/active-users`),
        fetch(`${API_BASE}/system/info`),
        fetch(`${API_BASE}/vouchers/expired`),
        fetch(`${API_BASE}/pricing/rates`)
      ]);

      setFinancialStats(await statsRes.json());
      const revenue = await revenueRes.json();
      setRevenueData(revenue.revenue_data || []);
      const profilesData = await profilesRes.json();
      setProfiles(profilesData.profiles || []);
      const profileStatsData = await profileStatsRes.json();
      setProfileStats(profileStatsData.profile_stats || []);
      const activeData = await activeRes.json();
      setActiveUsers(activeData.active_users || []);
      const systemData = await systemRes.json();
      setSystemInfo(systemData.system_info || {});
      const expiredData = await expiredRes.json();
      setExpiredVouchers(expiredData.expired_vouchers || []);
      const pricingData = await pricingRes.json();
      setPricingRates(pricingData.base_rates || {});
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateVouchers = async (values) => {
    try {
      const response = await fetch(`${API_BASE}/vouchers/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        Modal.success({
          title: 'Vouchers Generated Successfully!',
          content: (
            <div>
              <p><strong>{result.message}</strong></p>
              <Divider />
              <Text strong>Generated Vouchers:</Text>
              <List
                size="small"
                dataSource={result.vouchers}
                renderItem={item => <Text code>{item}</Text>}
                style={{ marginTop: 8 }}
              />
              <Divider />
              <Text strong>Total Amount: {result.total_price} UGX</Text>
            </div>
          ),
          width: 600,
        });
        setShowVoucherForm(false);
        form.resetFields();
        fetchData();
      } else {
        Modal.error({
          title: 'Error',
          content: result.error || 'Failed to generate vouchers',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Modal.error({
        title: 'Error',
        content: 'Error generating vouchers',
      });
    }
  };

  const updatePricingRates = async (values) => {
    try {
      const response = await fetch(`${API_BASE}/pricing/rates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base_rates: values }),
      });

      if (response.ok) {
        Modal.success({
          title: 'Success',
          content: 'Pricing rates updated successfully!',
        });
        setShowPricingModal(false);
        fetchData();
      } else {
        Modal.error({
          title: 'Error',
          content: 'Failed to update pricing rates',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Modal.error({
        title: 'Error',
        content: 'Error updating pricing rates',
      });
    }
  };

  const getVoucherInfo = async (voucherCode) => {
    try {
      const response = await fetch(`${API_BASE}/vouchers/${voucherCode}`);
      if (response.ok) {
        const voucherInfo = await response.json();
        setSelectedVoucher(voucherInfo);
        setVoucherModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching voucher info:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const activeUsersColumns = [
    {
      title: 'Username',
      dataIndex: 'user',
      key: 'user',
      render: (text) => (
        <Button type="link" onClick={() => getVoucherInfo(text)}>
          <Tag icon={<UserOutlined />} color="blue">{text}</Tag>
        </Button>
      ),
    },
    {
      title: 'Server',
      dataIndex: 'server',
      key: 'server',
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
      render: (uptime) => <Tag color="green">{uptime}</Tag>,
    },
    {
      title: 'Bytes In',
      dataIndex: 'bytes-in',
      key: 'bytes-in',
      render: (bytes) => <Text type="secondary">{(bytes / (1024 * 1024)).toFixed(2)} MB</Text>,
    },
    {
      title: 'Bytes Out',
      dataIndex: 'bytes-out',
      key: 'bytes-out',
      render: (bytes) => <Text type="secondary">{(bytes / (1024 * 1024)).toFixed(2)} MB</Text>,
    },
  ];

  const expiredVouchersColumns = [
    {
      title: 'Voucher Code',
      dataIndex: 'voucher_code',
      key: 'voucher_code',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Profile',
      dataIndex: 'profile_name',
      key: 'profile_name',
    },
    {
      title: 'Activated At',
      dataIndex: 'activated_at',
      key: 'activated_at',
    },
    {
      title: 'Expiry Time',
      dataIndex: 'expiry_time',
      key: 'expiry_time',
    },
    {
      title: 'Status',
      dataIndex: 'is_expired',
      key: 'is_expired',
      render: (isExpired) => (
        <Tag color={isExpired ? 'red' : 'green'} icon={isExpired ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}>
          {isExpired ? 'Expired' : 'Active'}
        </Tag>
      ),
    },
  ];

  const ProfileCard = ({ profile }) => (
    <Card 
      size="small" 
      style={{ marginBottom: 8 }}
      actions={[
        <Text key="price">{profile.price} UGX</Text>,
        <Text key="limit">{profile.time_limit}</Text>,
      ]}
    >
      <Card.Meta
        avatar={<ProfileOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
        title={profile.name}
        description={
          <Space direction="vertical" size={0}>
            <Text type="secondary">Rate: {profile.rate_limit}</Text>
            <Text type="secondary">Data: {profile.data_limit}</Text>
            <Text type="secondary">Validity: {profile.validity_period}h</Text>
          </Space>
        }
      />
    </Card>
  );

  const SystemStatusCard = () => (
    <Card title="System Status" size="small" extra={<WifiOutlined />}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Router">
            <Badge status="processing" text={systemInfo.router_name || 'Unknown'} />
          </Descriptions.Item>
          <Descriptions.Item label="CPU Load">
            <Progress 
              percent={parseInt(systemInfo.cpu_load) || 0} 
              size="small" 
              status={parseInt(systemInfo.cpu_load) > 80 ? 'exception' : 'normal'}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Uptime">
            <Text code>{systemInfo.uptime || 'Unknown'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Version">
            <Tag color="blue">{systemInfo.version || 'Unknown'}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #303030' }}>
          <WifiOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: 8 }} />
          {!collapsed && (
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              MikroTik Manager
            </Title>
          )}
        </div>
        
        <Menu
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key)}
          items={[
            {
              key: 'dashboard',
              icon: <BarChartOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'profiles',
              icon: <ProfileOutlined />,
              label: 'Profiles',
            },
            {
              key: 'users',
              icon: <TeamOutlined />,
              label: 'Active Users',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Settings',
            },
          ]}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'profiles' && 'Bandwidth Profiles'}
            {activeTab === 'users' && 'Active Users'}
            {activeTab === 'settings' && 'System Settings'}
          </Title>
          
          <Space>
            {lastUpdated && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Updated: {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              loading={loading}
              size="small"
            >
              Refresh
            </Button>
            {activeTab === 'profiles' && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowVoucherForm(true)}
                size="small"
              >
                Generate Vouchers
              </Button>
            )}
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#f0f2f5',
          minHeight: 280,
          overflow: 'initial'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Loading MikroTik data...</Text>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Row gutter={[16, 16]}>
                  {/* Stats Overview */}
                  <Col xs={24}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} lg={6}>
                        <Card>
                          <Statistic
                            title="Total Revenue"
                            value={financialStats.total_revenue || 0}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                            suffix="UGX"
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card>
                          <Statistic
                            title="Today's Revenue"
                            value={financialStats.daily_revenue || 0}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                            suffix="UGX"
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card>
                          <Statistic
                            title="Active Vouchers"
                            value={financialStats.active_vouchers || 0}
                            prefix={<RocketOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card>
                          <Statistic
                            title="Used Today"
                            value={financialStats.used_vouchers_today || 0}
                            prefix={<FireOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Col>

                  {/* Charts */}
                  <Col xs={24} lg={12}>
                    <Card title="Revenue Trend (Last 7 Days)">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} UGX`, 'Revenue']} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#8884d8" 
                            name="Revenue (UGX)" 
                            strokeWidth={2}
                            dot={{ fill: '#8884d8' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="Profile Performance">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={profileStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="profile_name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total_revenue" fill="#8884d8" name="Revenue (UGX)" />
                          <Bar dataKey="total_sold" fill="#82ca9d" name="Vouchers Sold" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>

                  {/* System Status */}
                  <Col xs={24} lg={12}>
                    <SystemStatusCard />
                  </Col>

                  {/* Recent Activity */}
                  <Col xs={24} lg={12}>
                    <Card title="Recent Activity" size="small">
                      <Timeline>
                        <Timeline.Item color="green">
                          <Text strong>System Started</Text>
                          <br />
                          <Text type="secondary">{new Date().toLocaleString()}</Text>
                        </Timeline.Item>
                        <Timeline.Item color="blue">
                          <Text strong>{activeUsers.length} Active Users</Text>
                          <br />
                          <Text type="secondary">Currently connected</Text>
                        </Timeline.Item>
                        <Timeline.Item color="orange">
                          <Text strong>{financialStats.used_vouchers_today || 0} Vouchers Used Today</Text>
                        </Timeline.Item>
                      </Timeline>
                    </Card>
                  </Col>
                </Row>
              )}

              {activeTab === 'profiles' && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={8}>
                    <Card 
                      title="Available Profiles" 
                      extra={
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => setShowVoucherForm(true)}
                          size="small"
                        >
                          Generate
                        </Button>
                      }
                    >
                      {profiles.length > 0 ? (
                        <List
                          dataSource={profiles}
                          renderItem={profile => <ProfileCard profile={profile} />}
                        />
                      ) : (
                        <Empty description="No profiles found" />
                      )}
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={16}>
                    <Card title="Profile Analytics">
                      <Tabs>
                        <TabPane tab="Revenue Distribution" key="revenue">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={profileStats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ profile_name, percent }) => `${profile_name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="total_revenue"
                                nameKey="profile_name"
                              >
                                {profileStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} UGX`, 'Revenue']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </TabPane>
                        <TabPane tab="Sales Distribution" key="sales">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={profileStats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ profile_name, percent }) => `${profile_name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="total_sold"
                                nameKey="profile_name"
                              >
                                {profileStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </TabPane>
                      </Tabs>
                    </Card>
                  </Col>
                </Row>
              )}

              {activeTab === 'users' && (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Card 
                      title={
                        <Space>
                          <TeamOutlined />
                          Active Users
                          <Badge count={activeUsers.length} showZero color="blue" />
                        </Space>
                      }
                      extra={
                        <Tag color={activeUsers.length > 0 ? 'green' : 'red'}>
                          {activeUsers.length > 0 ? 'Live' : 'No Active Users'}
                        </Tag>
                      }
                    >
                      {activeUsers.length > 0 ? (
                        <Table
                          dataSource={activeUsers}
                          columns={activeUsersColumns}
                          rowKey={(record, index) => index}
                          pagination={{ pageSize: 10 }}
                          size="middle"
                        />
                      ) : (
                        <Empty description="No active users" />
                      )}
                    </Card>
                  </Col>
                  
                  <Col xs={24}>
                    <Card title="Expired Vouchers" size="small">
                      <Table
                        dataSource={expiredVouchers}
                        columns={expiredVouchersColumns}
                        rowKey="voucher_code"
                        pagination={{ pageSize: 5 }}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              )}

              {activeTab === 'settings' && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card 
                      title="Pricing Configuration" 
                      extra={
                        <Button 
                          icon={<SettingOutlined />}
                          onClick={() => {
                            pricingForm.setFieldsValue(pricingRates);
                            setShowPricingModal(true);
                          }}
                        >
                          Configure Pricing
                        </Button>
                      }
                    >
                      <Descriptions bordered column={1}>
                        <Descriptions.Item label="Daily Rate">
                          <Text strong>{pricingRates.day || 0} UGX</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Weekly Rate">
                          <Text strong>{pricingRates.week || 0} UGX</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Monthly Rate">
                          <Text strong>{pricingRates.month || 0} UGX</Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <SystemStatusCard />
                  </Col>
                </Row>
              )}
            </>
          )}
        </Content>
      </Layout>

      {/* Voucher Generation Modal */}
      <Modal
        title="Generate Vouchers"
        open={showVoucherForm}
        onCancel={() => {
          setShowVoucherForm(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Generate"
        cancelText="Cancel"
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={generateVouchers}
          initialValues={voucherFormInitialState}
        >
          <Form.Item
            name="profile_name"
            label="Bandwidth Profile"
            rules={[{ required: true, message: 'Please select a profile' }]}
          >
            <Select placeholder="Select Profile" size="large">
              {profiles.map(profile => (
                <Option key={profile.name} value={profile.name}>
                  <Space>
                    <Text strong>{profile.name}</Text>
                    <Text type="secondary">- {profile.rate_limit}</Text>
                    <Tag color="blue">{profile.price} UGX</Tag>
                    <Tag color="green">{profile.time_limit}</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber
              min={1}
              max={100}
              style={{ width: '100%' }}
              size="large"
              placeholder="Number of vouchers to generate"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer_name"
                label="Customer Name"
              >
                <Input placeholder="Optional customer name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_contact"
                label="Customer Contact"
              >
                <Input placeholder="Optional contact information" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Pricing Configuration Modal */}
      <Modal
        title="Configure Pricing Rates"
        open={showPricingModal}
        onCancel={() => setShowPricingModal(false)}
        onOk={() => pricingForm.submit()}
        okText="Save Rates"
        cancelText="Cancel"
      >
        <Form
          form={pricingForm}
          layout="vertical"
          onFinish={updatePricingRates}
        >
          <Form.Item
            name="day"
            label="Daily Rate (UGX)"
            rules={[{ required: true, message: 'Please enter daily rate' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              size="large"
              placeholder="1000"
            />
          </Form.Item>
          
          <Form.Item
            name="week"
            label="Weekly Rate (UGX)"
            rules={[{ required: true, message: 'Please enter weekly rate' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              size="large"
              placeholder="6000"
            />
          </Form.Item>
          
          <Form.Item
            name="month"
            label="Monthly Rate (UGX)"
            rules={[{ required: true, message: 'Please enter monthly rate' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              size="large"
              placeholder="25000"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Voucher Details Modal */}
      <Modal
        title="Voucher Details"
        open={voucherModalVisible}
        onCancel={() => setVoucherModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setVoucherModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedVoucher && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Voucher Code">
              <Text code>{selectedVoucher.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Profile">
              {selectedVoucher.profile_name}
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              <Tag color="green">{selectedVoucher.price} UGX</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedVoucher.is_used ? 'green' : 'blue'} icon={selectedVoucher.is_used ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
                {selectedVoucher.is_used ? 'Used' : 'Active'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {selectedVoucher.created_at}
            </Descriptions.Item>
            <Descriptions.Item label="Activated At">
              {selectedVoucher.activated_at || 'Not activated'}
            </Descriptions.Item>
            <Descriptions.Item label="Data Usage">
              {(selectedVoucher.bytes_used / (1024 * 1024)).toFixed(2)} MB
            </Descriptions.Item>
            <Descriptions.Item label="Session Time">
              {Math.floor(selectedVoucher.session_time / 3600)}h {Math.floor((selectedVoucher.session_time % 3600) / 60)}m
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Layout>
  );
}

// Menu component for the sidebar
const Menu = ({ selectedKeys, onClick, items }) => (
  <div style={{ padding: '16px 0' }}>
    {items.map(item => (
      <div
        key={item.key}
        onClick={() => onClick({ key: item.key })}
        style={{
          padding: '12px 24px',
          cursor: 'pointer',
          background: selectedKeys.includes(item.key) ? '#1890ff' : 'transparent',
          color: selectedKeys.includes(item.key) ? 'white' : 'rgba(255,255,255,0.65)',
          margin: '4px 0',
          borderRadius: '0 4px 4px 0',
          borderRight: selectedKeys.includes(item.key) ? '3px solid #52c41a' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 0.3s'
        }}
      >
        {item.icon}
        <span>{item.label}</span>
      </div>
    ))}
  </div>
);

export default App;