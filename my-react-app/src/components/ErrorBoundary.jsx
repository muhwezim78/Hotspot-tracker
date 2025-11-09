import React from 'react';
import { Result, Button, Card, Space, Typography, Divider } from 'antd';
import { 
  ReloadOutlined, 
  HomeOutlined, 
  BugOutlined,
  WifiOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';


const { Title, Text, Paragraph } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOnline: navigator.onLine,
      timestamp: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error,
      timestamp: new Date().toISOString()
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      timestamp: new Date().toISOString()
    });

    // Log to error reporting service
    this.logErrorToService(error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
  }

  handleOnlineStatus = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  logErrorToService = (error, errorInfo) => {
    // Example: Send to your error logging service
    // console.log('Logging to service:', error, errorInfo);
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null
    });
    
    // Optionally trigger a callback for retry logic
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  handleReportBug = () => {
    // Implement bug reporting logic
    const errorDetails = {
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: this.state.timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.log('Report bug with details:', errorDetails);
    // Your bug reporting implementation here
  };

  renderErrorContent() {
    const { isOnline, error, errorInfo } = this.state;
    const { customMessage, showDetails = process.env.NODE_ENV === 'development' } = this.props;

    if (!isOnline) {
      return (
        <Result
          icon={<WifiOutlined style={{ color: '#ff4d4f', fontSize: '72px' }} />}
          title="Connection Lost"
          subTitle="Please check your internet connection and try again."
          extra={
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={this.handleRetry}
              disabled={!isOnline}
            >
              Retry Connection
            </Button>
          }
        />
      );
    }

    return (
      <Card 
        style={{ 
          maxWidth: 800, 
          margin: '40px auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ExclamationCircleOutlined 
            style={{ 
              fontSize: 64, 
              color: '#ff4d4f',
              marginBottom: 16
            }} 
          />
          <Title level={2} style={{ color: '#ff4d4f', marginBottom: 8 }}>
            Oops! Something Went Wrong
          </Title>
          <Paragraph type="secondary" style={{ fontSize: '16px', marginBottom: 8 }}>
            {customMessage || "We're sorry, but something unexpected happened. Our team has been notified of the issue."}
          </Paragraph>
          <Text type="secondary">
            Error ID: {this.state.timestamp}
          </Text>
        </div>

        <Divider />

        <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="large">
          <div>
            <Text strong>Error Message:</Text>
            <Paragraph code style={{ marginTop: 8, background: '#f5f5f5', padding: 8 }}>
              {error?.toString() || 'Unknown error occurred'}
            </Paragraph>
          </div>

          {showDetails && errorInfo && (
            <Card 
              size="small" 
              title={
                <Space>
                  <BugOutlined />
                  Error Details (Development)
                </Space>
              }
              style={{ background: '#fff2f0' }}
            >
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '12px',
                margin: 0,
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {errorInfo.componentStack}
              </pre>
            </Card>
          )}
        </Space>

        <Divider />

        <Space size="middle" style={{ justifyContent: 'center', width: '100%' }}>
          <Button 
            type="primary" 
            size="large"
            icon={<ReloadOutlined />}
            onClick={this.handleRetry}
          >
            Try Again
          </Button>
          
          <Button 
            size="large"
            icon={<HomeOutlined />}
            onClick={this.handleGoHome}
          >
            Go Home
          </Button>
          
          {this.props.showReportButton && (
            <Button 
              size="large"
              icon={<BugOutlined />}
              onClick={this.handleReportBug}
            >
              Report Issue
            </Button>
          )}
        </Space>

        {this.props.contactSupport && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text type="secondary">
              Need help? Contact our support team at {this.props.contactSupport}
            </Text>
          </div>
        )}
      </Card>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorContent();
    }

    return this.props.children;
  }
}

// Default props
ErrorBoundary.defaultProps = {
  showReportButton: true,
  contactSupport: null,
  customMessage: null,
  showDetails: process.env.NODE_ENV === 'development'
};

export default ErrorBoundary;