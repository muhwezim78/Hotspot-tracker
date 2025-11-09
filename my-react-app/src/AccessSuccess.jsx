import React from 'react'
import {Table, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
const AccessSuccess = () => {
    const navigate = useNavigate();
    const handleRoute = () =>{
        navigate("/login")
    }
    
    return (
        <div className='success-container'>
            //access duration
            //accessId

            <Button
            onClick={handleRoute}>Home</Button>

        </div>
    );
};
export default AccessSuccess