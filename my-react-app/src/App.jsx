// src/App.js
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
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
  Empty,
  Switch,
  Radio,
  QRCode,
  Popover,
  message,
  Collapse,
  Watermark,
  Menu
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
  ExclamationCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  QrcodeOutlined,
  CopyOutlined,
  SecurityScanOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  IdcardOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Countdown, StatisticCard } = Statistic;
const { Panel } = Collapse;

const API_BASE = 'http://localhost:5000';

// Consistent API endpoints with perfect rhyming pattern
const API_ENDPOINTS = {
  // Financial
  FINANCIAL_STATS: '/financial/stats',
  FINANCIAL_REVENUE: '/financial/revenue-data',
  FINANCIAL_PROFILES: '/financial/profile-stats', // ✅ fixed
  
  // Vouchers
  VOUCHERS: '/vouchers',
  VOUCHERS_EXPIRED: '/vouchers/expired',
  VOUCHER_DETAIL: '/vouchers',

  // Users
  USERS: '/all-users', // ✅ backend route is /all-users, not /users/all-users
  USERS_ACTIVE: '/active-users', // ✅ backend route is /active-users, not /users/active-users
  USERS_EXPIRED: '/users/expired', // ✅ keep as is
  USER_DETAIL: '/users',
  USER_COMMENT: '/users',

  // System
  SYSTEM_INFO: '/system/info',

  // Pricing
  PRICING_RATES: '/pricing/rates',

  // Profiles
  PROFILES: '/profiles/enhanced' // ✅ fixed
};


function App() {
  const [financialStats, setFinancialStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [profileStats, setProfileStats] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [systemInfo, setSystemInfo] = useState({});
  const [expiredVouchers, setExpiredVouchers] = useState([]);
  const [expiredUsers, setExpiredUsers] = useState([]);
  const [pricingRates, setPricingRates] = useState({});
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [generatedVouchers, setGeneratedVouchers] = useState([]);
  const [voucherHistory, setVoucherHistory] = useState([]);
  const [form] = Form.useForm();
  const [pricingForm] = Form.useForm();
  const [voucherForm] = Form.useForm();

  const passwordOptions = [
    { label: 'Blank Password', value: 'blank' },
    { label: 'Same as Username', value: 'same' },
    { label: 'Custom Password', value: 'custom' }
  ];

  const voucherFormInitialState = {
    profile_name: '',
    quantity: 1,
    customer_name: '',
    customer_contact: '',
    password_type: 'blank'
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchData();
      }
    }, 10000); // Refresh every 1 second
    return () => clearInterval(interval);
  }, [autoRefresh]);

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
        expiredVouchersRes,
        pricingRes,
        allUsersRes,
        expiredUsersRes
      ] = await Promise.all([
        // Updated endpoints with consistent rhyming pattern
        fetch(`${API_BASE}${API_ENDPOINTS.FINANCIAL_STATS}`),
        fetch(`${API_BASE}${API_ENDPOINTS.FINANCIAL_REVENUE}?days=30`),
        fetch(`${API_BASE}${API_ENDPOINTS.PROFILES}`),
        fetch(`${API_BASE}${API_ENDPOINTS.FINANCIAL_PROFILES}`),
        fetch(`${API_BASE}${API_ENDPOINTS.USERS_ACTIVE}`),
        fetch(`${API_BASE}${API_ENDPOINTS.SYSTEM_INFO}`),
        fetch(`${API_BASE}${API_ENDPOINTS.VOUCHERS_EXPIRED}`),
        fetch(`${API_BASE}${API_ENDPOINTS.PRICING_RATES}`),
        fetch(`${API_BASE}${API_ENDPOINTS.USERS}`),
        fetch(`${API_BASE}${API_ENDPOINTS.USERS_EXPIRED}`)
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
      const expiredData = await expiredVouchersRes.json();
      setExpiredVouchers(expiredData.expired_users || []);
      const pricingData = await pricingRes.json();
      setPricingRates(pricingData.base_rates || {});
      const allUsersData = await allUsersRes.json();
      setAllUsers(allUsersData.all_users || []);
      const expiredUsersData = await expiredUsersRes.json();
      setExpiredUsers(expiredUsersData.expired_users || []);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data from server');
    } finally {
      setLoading(false);
    }
  };

  const generateVouchers = async (values) => {
    try {
      // Updated endpoint - POST to /vouchers instead of /vouchers/generate
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.VOUCHERS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        setGeneratedVouchers(result.vouchers || []);
        
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
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <Text code>{item.code}</Text>
                      <Text type="secondary">Password: {item.password}</Text>
                      <Button 
                        icon={<CopyOutlined />} 
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(`${item.code} | Password: ${item.password}`);
                          message.success('Copied to clipboard!');
                        }}
                      />
                    </Space>
                  </List.Item>
                )}
                style={{ marginTop: 8, marginBottom: 8 }}
              />
              <Divider />
              <Text strong>Total Amount: {result.total_price?.toLocaleString()} UGX</Text>
            </div>
          ),
          width: 600,
        });
        setShowVoucherForm(false);
        voucherForm.resetFields();
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
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.PRICING_RATES}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rates: values }),
      });

      if (response.ok) {
        message.success('Pricing rates updated successfully!');
        setShowPricingModal(false);
        fetchData();
      } else {
        message.error('Failed to update pricing rates');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error updating pricing rates');
    }
  };

  const getVoucherInfo = async (voucherCode) => {
    try {
      // Updated endpoint - GET /vouchers/{code} instead of /vouchers/{voucherCode}
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.VOUCHER_DETAIL}/${voucherCode}`);
      if (response.ok) {
        const voucherInfo = await response.json();
        setSelectedVoucher(voucherInfo);
        setVoucherModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching voucher info:', error);
      message.error('Failed to fetch voucher details');
    }
  };

  const getUserInfo = async (username) => {
    try {
      // Updated endpoint - GET /users/{username} 
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.USER_DETAIL}/${username}`);
      if (response.ok) {
        const userInfo = await response.json();
        setSelectedUser(userInfo);
        setUserModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      message.error('Failed to fetch user details');
    }
  };

  const updateUserComment = async (username, comment) => {
    try {
      // Updated endpoint - PUT /users/{username}/comments
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.USER_COMMENT}/${username}/comments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });

      if (response.ok) {
        message.success('Comment updated successfully!');
        fetchData();
      } else {
        message.error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error updating comment');
    }
  };

  const exportVouchers = () => {
    if (generatedVouchers.length === 0) {
      message.warning('No vouchers to export');
      return;
    }

    const content = generatedVouchers.map(v => 
      `${v.code}, Password: ${v.password}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vouchers-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    message.success('Vouchers exported successfully!');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const activeUsersColumns = [
    {
      title: 'Username',
      dataIndex: 'user',
      key: 'user',
      render: (text, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => getUserInfo(text)}
            icon={<EyeOutlined />}
          >
            <Tag 
              icon={<UserOutlined />} 
              color={text.startsWith('VOUCHER') ? 'blue' : 'purple'}
            >
              {text}
            </Tag>
          </Button>
          {text.startsWith('VOUCHER') && <Tag color="cyan">Voucher</Tag>}
        </Space>
      ),
    },
    {
      title: 'Profile',
      dataIndex: 'profile',
      key: 'profile',
      render: (text) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
      render: (uptime) => <Tag color="green">{uptime}</Tag>,
    },
    {
      title: 'Data Usage',
      key: 'data-usage',
      render: (_, record) => (
        <Text type="secondary">
          {((parseInt(record['bytes-in'] || 0) + parseInt(record['bytes-out'] || 0)) / (1024 * 1024)).toFixed(2)} MB
        </Text>
      ),
    },
    {
      title: 'Server',
      dataIndex: 'server',
      key: 'server',
    },
  ];

  const allUsersColumns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => getUserInfo(text)}
            icon={<EyeOutlined />}
          >
            <Text strong>{text}</Text>
          </Button>
          {record.is_voucher && <Tag color="blue">Voucher</Tag>}
          {record.password_type && (
            <Tag color={record.password_type === 'blank' ? 'green' : 'orange'}>
              {record.password_type.toUpperCase()}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Profile',
      dataIndex: 'profile_name',
      key: 'profile_name',
      render: (text) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Badge 
            status={record.is_active ? 'processing' : 'default'} 
            text={record.is_active ? 'Online' : 'Offline'} 
          />
          {record.is_expired && <Tag color="red">Expired</Tag>}
        </Space>
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_seen',
      key: 'last_seen',
      render: (text) => <Text type="secondary">{text ? new Date(text).toLocaleString() : 'Never'}</Text>,
    },
    {
      title: 'Uptime Limit',
      dataIndex: 'uptime_limit',
      key: 'uptime_limit',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => {
              const comment = prompt('Enter comment:', record.comment || '');
              if (comment !== null) {
                updateUserComment(record.username, comment);
              }
            }}
          >
            Comment
          </Button>
        </Space>
      ),
    },
  ];

  const expiredVouchersColumns = [
    {
      title: 'Voucher Code',
      dataIndex: 'voucher_code',
      key: 'voucher_code',
      render: (text) => <Text code strong>{text}</Text>,
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
      render: (text) => <Text type="secondary">{text ? new Date(text).toLocaleString() : 'N/A'}</Text>,
    },
    {
      title: 'Current Uptime',
      dataIndex: 'current_uptime',
      key: 'current_uptime',
      render: (text) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: 'Uptime Limit',
      dataIndex: 'uptime_limit',
      key: 'uptime_limit',
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
      style={{ marginBottom: 8, borderLeft: `4px solid ${getProfileColor(profile.name)}` }}
      actions={[
        <Text key="price" strong style={{ color: '#1890ff' }}>{profile.price?.toLocaleString()} UGX</Text>,
        <Text key="limit" type="secondary">{profile.time_limit}</Text>,
        <Tag key="uptime" color="blue">{profile.uptime_limit}</Tag>,
      ]}
    >
      <Card.Meta
        avatar={<ProfileOutlined style={{ fontSize: '24px', color: getProfileColor(profile.name) }} />}
        title={
          <Space>
            <Text strong>{profile.name}</Text>
            <Tag color={getProfileStatusColor(profile.name)}>
              {getProfileType(profile.name)}
            </Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text type="secondary">Rate Limit: {profile.rate_limit}</Text>
            <Text type="secondary">Data: {profile.data_limit}</Text>
            <Progress 
              percent={getProfileUsage(profile.name)} 
              size="small" 
              showInfo={false}
              status="active"
            />
          </Space>
        }
      />
    </Card>
  );

  const SystemStatusCard = () => (
    <Card 
      title={
        <Space>
          <CloudServerOutlined />
          System Status
          <Badge status="processing" />
        </Space>
      } 
      size="small" 
      extra={<WifiOutlined />}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Router">
            <Badge status="success" text={systemInfo.router_name || 'Unknown'} />
          </Descriptions.Item>
          <Descriptions.Item label="CPU Load">
            <Progress 
              percent={parseInt(systemInfo.cpu_load) || 0} 
              size="small" 
              status={parseInt(systemInfo.cpu_load) > 80 ? 'exception' : 'normal'}
              format={percent => `${percent}%`}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Memory Usage">
            <Progress 
              percent={parseInt(systemInfo.memory_usage) || 0} 
              size="small" 
              status={parseInt(systemInfo.memory_usage) > 80 ? 'exception' : 'normal'}
              format={percent => `${percent}%`}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Uptime">
            <Text code>{systemInfo.uptime || 'Unknown'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Version">
            <Tag color="blue">{systemInfo.version || 'Unknown'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="CPU Cores">
            <Tag>{systemInfo.cpu_count || '1'}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Card>
  );

  const QuickStatsCard = () => (
    <Card title="Quick Overview" size="small">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title="Total Users"
            value={allUsers.length}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Active Now"
            value={activeUsers.length}
            prefix={<ThunderboltOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Expired Users"
            value={expiredUsers.length}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Vouchers Today"
            value={financialStats.used_vouchers_today || 0}
            prefix={<RocketOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
      </Row>
    </Card>
  );

  // Helper functions
  const getProfileColor = (name) => {
    if (name.toLowerCase().includes('day')) return '#1890ff';
    if (name.toLowerCase().includes('week')) return '#52c41a';
    if (name.toLowerCase().includes('month')) return '#722ed1';
    return '#faad14';
  };

  const getProfileStatusColor = (name) => {
    if (name.toLowerCase().includes('day')) return 'blue';
    if (name.toLowerCase().includes('week')) return 'green';
    if (name.toLowerCase().includes('month')) return 'purple';
    return 'orange';
  };

  const getProfileType = (name) => {
    if (name.toLowerCase().includes('day')) return 'DAILY';
    if (name.toLowerCase().includes('week')) return 'WEEKLY';
    if (name.toLowerCase().includes('month')) return 'MONTHLY';
    return 'CUSTOM';
  };

  const getProfileUsage = (name) => {
    // Mock usage data - in real app, this would come from API
    return Math.floor(Math.random() * 100);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
              label: 'Profiles & Vouchers',
            },
            {
              key: 'users',
              icon: <TeamOutlined />,
              label: 'User Management',
            },
            {
              key: 'analytics',
              icon: <DatabaseOutlined />,
              label: 'Analytics',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Settings',
            },
          ]}
        />

        {!collapsed && (
          <div style={{ padding: '16px', borderTop: '1px solid #303030', marginTop: 'auto' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Switch 
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="Auto Refresh"
                unCheckedChildren="Manual Refresh"
              />
              {lastUpdated && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
            </Space>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'profiles' && 'Bandwidth Profiles & Voucher Management'}
            {activeTab === 'users' && 'User Management & Monitoring'}
            {activeTab === 'analytics' && 'Advanced Analytics'}
            {activeTab === 'settings' && 'System Settings & Configuration'}
          </Title>
          
          <Space>
            <Badge status="processing" text="Live" />
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

                  {/* System Overview */}
                  <Col xs={24} lg={8}>
                    <SystemStatusCard />
                  </Col>

                  <Col xs={24} lg={8}>
                    <QuickStatsCard />
                  </Col>

                  <Col xs={24} lg={8}>
                    <Card title="Recent Activity" size="small">
                      <Timeline>
                        <Timeline.Item color="green" dot={<ThunderboltOutlined />}>
                          <Text strong>System Operational</Text>
                          <br />
                          <Text type="secondary">All services running normally</Text>
                        </Timeline.Item>
                        <Timeline.Item color="blue" dot={<TeamOutlined />}>
                          <Text strong>{activeUsers.length} Active Connections</Text>
                          <br />
                          <Text type="secondary">{allUsers.length} total users in system</Text>
                        </Timeline.Item>
                        <Timeline.Item color="orange" dot={<RocketOutlined />}>
                          <Text strong>{financialStats.used_vouchers_today || 0} Vouchers Used Today</Text>
                          <br />
                          <Text type="secondary">{(financialStats.daily_revenue || 0).toLocaleString()} UGX revenue</Text>
                        </Timeline.Item>
                      </Timeline>
                    </Card>
                  </Col>

                  {/* Charts */}
                  <Col xs={24} lg={12}>
                    <Card title="Revenue Trend (Last 30 Days)" extra={<DollarOutlined />}>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value?.toLocaleString()} UGX`, 'Revenue']} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            name="Revenue (UGX)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="User Activity Overview" extra={<TeamOutlined />}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="voucher_count" fill="#82ca9d" name="Daily Vouchers" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
              )}

              {activeTab === 'profiles' && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={8}>
                    <Card 
                      title="Bandwidth Profiles" 
                      extra={
                        <Space>
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => setShowVoucherForm(true)}
                            size="small"
                          >
                            Generate Vouchers
                          </Button>
                        </Space>
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
                    <Card title="Profile Analytics & Management">
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
                              <Tooltip formatter={(value) => [`${value?.toLocaleString()} UGX`, 'Revenue']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </TabPane>
                        <TabPane tab="Sales Performance" key="sales">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={profileStats}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="profile_name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="total_sold" fill="#8884d8" name="Total Sold" />
                              <Bar dataKey="used_count" fill="#82ca9d" name="Used Count" />
                            </BarChart>
                          </ResponsiveContainer>
                        </TabPane>
                        <TabPane tab="Expired Vouchers" key="expired">
                          <Table
                            dataSource={expiredVouchers}
                            columns={expiredVouchersColumns}
                            rowKey="voucher_code"
                            pagination={{ pageSize: 10 }}
                            size="small"
                          />
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
                          Active Users Monitor
                          <Badge count={activeUsers.length} showZero color="green" />
                        </Space>
                      }
                      extra={
                        <Tag color={activeUsers.length > 0 ? 'green' : 'red'} icon={<ThunderboltOutlined />}>
                          {activeUsers.length > 0 ? 'Live Connections' : 'No Active Users'}
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
                        <Empty description="No active users connected" />
                      )}
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <Card title="All Users Database" extra={<DatabaseOutlined />}>
                      <Table
                        dataSource={allUsers}
                        columns={allUsersColumns}
                        rowKey="username"
                        pagination={{ pageSize: 10 }}
                        size="small"
                        scroll={{ x: 800 }}
                      />
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card title="Expired Users" size="small" extra={<ExclamationCircleOutlined />}>
                      <Table
                        dataSource={expiredUsers}
                        columns={[
                          {
                            title: 'Username',
                            dataIndex: 'username',
                            key: 'username',
                            render: (text) => <Text strong>{text}</Text>,
                          },
                          {
                            title: 'Profile',
                            dataIndex: 'profile_name',
                            key: 'profile_name',
                          },
                          {
                            title: 'Last Seen',
                            dataIndex: 'last_seen',
                            key: 'last_seen',
                          },
                          {
                            title: 'Type',
                            dataIndex: 'is_voucher',
                            key: 'is_voucher',
                            render: (isVoucher) => (
                              <Tag color={isVoucher ? 'blue' : 'purple'}>
                                {isVoucher ? 'Voucher' : 'Regular'}
                              </Tag>
                            ),
                          },
                        ]}
                        rowKey="username"
                        pagination={{ pageSize: 5 }}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              )}

              {activeTab === 'analytics' && (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Card title="Comprehensive Analytics Dashboard">
                      <Tabs>
                        <TabPane tab="Financial Analytics" key="financial">
                          <Row gutter={[16, 16]}>
                            <Col xs={24} lg={12}>
                              <Card title="Revenue Trend" size="small">
                                <ResponsiveContainer width="100%" height={250}>
                                  <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value} UGX`, 'Revenue']} />
                                    <Line 
                                      type="monotone" 
                                      dataKey="revenue" 
                                      stroke="#8884d8" 
                                      strokeWidth={2}
                                      dot={{ fill: '#8884d8' }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                              <Card title="Voucher Usage" size="small">
                                <ResponsiveContainer width="100%" height={250}>
                                  <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="voucher_count" fill="#82ca9d" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </Card>
                            </Col>
                          </Row>
                        </TabPane>
                        <TabPane tab="User Analytics" key="user">
                          <Row gutter={[16, 16]}>
                            <Col xs={24} lg={12}>
                              <Card title="User Distribution by Type" size="small">
                                <ResponsiveContainer width="100%" height={250}>
                                  <PieChart>
                                    <Pie
                                      data={[
                                        { name: 'Voucher Users', value: allUsers.filter(u => u.is_voucher).length },
                                        { name: 'Regular Users', value: allUsers.filter(u => !u.is_voucher).length },
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label
                                    >
                                      <Cell fill="#0088FE" />
                                      <Cell fill="#00C49F" />
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                              <Card title="Active vs Inactive Users" size="small">
                                <ResponsiveContainer width="100%" height={250}>
                                  <BarChart
                                    data={[
                                      {
                                        name: 'Users',
                                        Active: activeUsers.length,
                                        Inactive: allUsers.length - activeUsers.length,
                                      },
                                    ]}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Active" fill="#52c41a" />
                                    <Bar dataKey="Inactive" fill="#faad14" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </Card>
                            </Col>
                          </Row>
                        </TabPane>
                      </Tabs>
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
                          <Text strong style={{ fontSize: '16px' }}>{pricingRates.day?.toLocaleString() || 0} UGX</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Weekly Rate">
                          <Text strong style={{ fontSize: '16px' }}>{pricingRates.week?.toLocaleString() || 0} UGX</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Monthly Rate">
                          <Text strong style={{ fontSize: '16px' }}>{pricingRates.month?.toLocaleString() || 0} UGX</Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <SystemStatusCard />
                  </Col>

                  <Col xs={24}>
                    <Card title="System Information">
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label="Router Name" span={2}>
                          {systemInfo.router_name || 'Unknown'}
                        </Descriptions.Item>
                        <Descriptions.Item label="CPU Load">
                          {systemInfo.cpu_load || '0%'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Memory Usage">
                          {systemInfo.memory_usage || '0%'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Uptime">
                          {systemInfo.uptime || 'Unknown'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Version">
                          {systemInfo.version || 'Unknown'}
                        </Descriptions.Item>
                        <Descriptions.Item label="CPU Cores">
                          {systemInfo.cpu_count || '1'}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Content>
      </Layout>

      {/* Voucher Generation Modal */}
      <Modal
        title={
          <Space>
            <IdcardOutlined />
            Generate Vouchers
            <Tag color="blue">Advanced</Tag>
          </Space>
        }
        open={showVoucherForm}
        onCancel={() => {
          setShowVoucherForm(false);
          voucherForm.resetFields();
        }}
        onOk={() => voucherForm.submit()}
        okText="Generate Vouchers"
        cancelText="Cancel"
        width={700}
        confirmLoading={loading}
      >
        <Form
          form={voucherForm}
          layout="vertical"
          onFinish={generateVouchers}
          initialValues={voucherFormInitialState}
        >
          <Row gutter={16}>
            <Col span={12}>
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
                        <Tag color="blue">{profile.price?.toLocaleString()} UGX</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
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
                  placeholder="Number of vouchers"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password_type"
            label="Password Configuration"
            rules={[{ required: true, message: 'Please select password type' }]}
          >
            <Radio.Group optionType="button" buttonStyle="solid">
              {passwordOptions.map(option => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer_name"
                label="Customer Name (Optional)"
              >
                <Input placeholder="Enter customer name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_contact"
                label="Customer Contact (Optional)"
              >
                <Input placeholder="Enter contact information" size="large" />
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
        okText="Save Pricing Rates"
        cancelText="Cancel"
        width={500}
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
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
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
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
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
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Voucher Details Modal */}
      <Modal
        title={
          <Space>
            <IdcardOutlined />
            Voucher Details
            {selectedVoucher?.is_used && <Tag color="green">ACTIVE</Tag>}
          </Space>
        }
        open={voucherModalVisible}
        onCancel={() => setVoucherModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setVoucherModalVisible(false)}
            type="primary"
          >
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedVoucher && (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Voucher Code" span={2}>
              <Space>
                <Text code strong style={{ fontSize: '16px' }}>{selectedVoucher.code}</Text>
                <Popover content="Scan QR Code to connect">
                  <QRCode 
                    value={`WIFI:S:${selectedVoucher.code};T:WPA;P:${selectedVoucher.password_type === 'same' ? selectedVoucher.code : ''};;`} 
                    size={60}
                  />
                </Popover>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Profile">
              <Tag color="blue">{selectedVoucher.profile_name}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              <Tag color="green" style={{ fontSize: '14px' }}>
                {selectedVoucher.price?.toLocaleString()} UGX
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag 
                color={selectedVoucher.is_used ? 'green' : 'blue'} 
                icon={selectedVoucher.is_used ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              >
                {selectedVoucher.is_used ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Password Type">
              <Tag color={selectedVoucher.password_type === 'blank' ? 'green' : 'orange'}>
                {selectedVoucher.password_type?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Uptime Limit">
              {selectedVoucher.uptime_limit}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {selectedVoucher.created_at ? new Date(selectedVoucher.created_at).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Activated At">
              {selectedVoucher.activated_at ? new Date(selectedVoucher.activated_at).toLocaleString() : 'Not activated'}
            </Descriptions.Item>
            <Descriptions.Item label="Data Usage" span={2}>
              <Progress 
                percent={Math.min(100, (selectedVoucher.bytes_used / (100 * 1024 * 1024)) * 100)} 
                format={() => formatBytes(selectedVoucher.bytes_used)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Customer Info" span={2}>
              {selectedVoucher.customer_name ? (
                <Space direction="vertical">
                  <Text strong>{selectedVoucher.customer_name}</Text>
                  <Text type="secondary">{selectedVoucher.customer_contact}</Text>
                </Space>
              ) : (
                <Text type="secondary">No customer information</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* User Details Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            User Details
            {selectedUser?.is_active && <Badge status="processing" text="Online" />}
          </Space>
        }
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setUserModalVisible(false)}
            type="primary"
          >
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedUser && (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Username" span={2}>
              <Text strong style={{ fontSize: '16px' }}>{selectedUser.username}</Text>
              {selectedUser.is_voucher && <Tag color="blue" style={{ marginLeft: 8 }}>VOUCHER</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Profile">
              <Tag color="orange">{selectedUser.profile_name}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Space>
                <Badge status={selectedUser.is_active ? 'processing' : 'default'} />
                <Tag color={selectedUser.is_active ? 'green' : 'red'}>
                  {selectedUser.is_active ? 'Online' : 'Offline'}
                </Tag>
                {selectedUser.is_expired && <Tag color="red">Expired</Tag>}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Password Type">
              <Tag color={selectedUser.password_type === 'blank' ? 'green' : 'orange'}>
                <Space>
                  {selectedUser.password_type === 'blank' ? <UnlockOutlined /> : <LockOutlined />}
                  {selectedUser.password_type?.toUpperCase()}
                </Space>
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Uptime Limit">
              {selectedUser.uptime_limit}
            </Descriptions.Item>
            <Descriptions.Item label="Last Seen">
              {selectedUser.last_seen ? new Date(selectedUser.last_seen).toLocaleString() : 'Never'}
            </Descriptions.Item>
            <Descriptions.Item label="Current Usage" span={2}>
              {selectedUser.current_usage ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>Uptime: <Tag color="blue">{selectedUser.current_usage.uptime}</Tag></Text>
                  <Text>
                    Data: {formatBytes(selectedUser.current_usage.bytes_in + selectedUser.current_usage.bytes_out)}
                  </Text>
                </Space>
              ) : (
                <Text type="secondary">No usage data available</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Comment" span={2}>
              {selectedUser.comment ? (
                <Text>{selectedUser.comment}</Text>
              ) : (
                <Text type="secondary">No comments</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Layout>
  );
}


export default App;