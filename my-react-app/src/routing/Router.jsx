import React from "react";
import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "../components/ErrorBoundary";
import LoadingOverlay from "../components/LoadingOverlay";


const lazyWithPrefetch = (importFunc) => {
  const component = lazy(importFunc);

  if (import.meta.env.PROD) {
    const match = importFunc.toString().match(/['"](.*?)['"]/);
    if (match && match[1]) {
      const link = document.createElement("link");
      link.rel = "modulepreload";
      link.href = match[1];
      document.head.appendChild(link);
    }
  }

  return component;
};

// Lazy-loaded components
const App = lazyWithPrefetch(() => import("../App"));

const Login = lazyWithPrefetch(() => import("../Login"));
const SignUp = lazyWithPrefetch(() => import("../SignUp"));
const MikroTikLoginRoute = lazyWithPrefetch(() => import("../MikrotikLogin"));
const VoucherAccess = lazyWithPrefetch(() => import("../VoucherAccess"));
const WireguardConfig = lazyWithPrefetch(() => import("../WireguardConfig"));
const Logs = lazyWithPrefetch(() => import("../Logs"));
const RoutersConnected = lazyWithPrefetch(() => import("../RoutersConnected"))


const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes
        location={location}
        key={location.pathname.split("/")[1] || "home"}
      >
        {/* Public Routes */}
        <Route index element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="logs" element={<Logs />} />
        <Route path="mikrotik-login" element={<MikroTikLoginRoute />} />
        <Route path="access" element={<VoucherAccess />} />
        <Route path="wireguard-config" element={<WireguardConfig />} />
        <Route path="routers" element={<RoutersConnected />} />
        <Route path="app" element={<App />}/>
      </Routes>
    </AnimatePresence>
  );
};

const Router = () => {
  return (
    
      <ErrorBoundary fallback={<LoadingOverlay />}>
        <Suspense fallback={<LoadingOverlay />}>
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    
  );
};

export default Router;
