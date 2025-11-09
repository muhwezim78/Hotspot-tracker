import React from 'react'
import {Form, Button, Col, Row, Card, Input} from 'antd'
import { useNavigate } from 'react-router-dom';

const MikroTikLogin = () =>{
    const navigate = useNavigate();

    const handleWireguardConfig = () =>{
        navigate("/wireguard-config")
    }
    return (
        <div className='mikrotik-login-container'>
            <div className='container-header'>
                <h1 style={{ fontWeight: "bold", color: "#007bff"  }}>MikroTik Login</h1>
                <p style={{ fontWeight: "bold", color: "#007bff"  }}>Please enter your MikroTik router credentials to proceed.</p>
            </div>
            <Card className='mikrotik-login-card'>
                <Form className='mikrotik-login-form'>
                    <Form.Item
                    name="host"
                    label={ <span style={{ fontWeight: "bold", color: "#007bff" }}>Host</span>}
                    rules={[{ required: true, message: 'Please input the host!' }]}
                    ><Input placeholder='Enter MikroTik Host'/>
                    </Form.Item>
                    <Form.Item
                    name="username"
                    label={ <span style={{ fontWeight: "bold", color: "#007bff" }}>Username</span>}
                    rules={[{ required: true, message: 'Please input the username!' }]}
                    ><Input placeholder='Enter MikroTik Username'/>
                    </Form.Item>
                    <Form.Item
                    name="password"
                    label={ <span style={{ fontWeight: "bold", color: "#007bff" }}>Password</span>}
                    rules={[{ required: true, message: 'Please input the password!' }]}
                    ><Input.Password placeholder='Enter MikroTik Password'/>
                    </Form.Item>
                    <Form.Item>
                        <Button
                        onClick={handleWireguardConfig}
                         type="primary" htmlType="submit" block size="large" aria-label="Login to MikroTik">
                            Login to MikroTik
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};
export default MikroTikLogin;