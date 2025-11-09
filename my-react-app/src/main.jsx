import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import { BrowserRouter } from 'react-router-dom'
import Router from '@routing/Router.jsx'
import VoucherAccess from './VoucherAccess.jsx'
import MikroTikLogin from './MikrotikLogin.jsx'
import WireguardConfig from './WireguardConfig.jsx'

createRoot(document.getElementById('root')).render(
   <BrowserRouter>
  <StrictMode>
    <Router />
  </StrictMode>
  </BrowserRouter>,
)
