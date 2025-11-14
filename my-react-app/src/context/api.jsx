import axios from "axios";
import { io } from "socket.io-client";
import { message, notification } from "antd";

const getEnvVariable = (key, defaultValue) => {
  if (typeof window !== 'undefined') {
    
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[`VITE_${key}`] || defaultValue;
    }
    
    if (typeof process !== 'undefined' && process.env) {
      return process.env[`REACT_APP_${key}`] || defaultValue;
    }
    
    return window[`__ENV_${key}__`] || defaultValue;
  }
  
  return defaultValue;
};


const API_BASE = getEnvVariable('API_BASE', "http://localhost:5000");
const API_TIMEOUT = parseInt(getEnvVariable('API_TIMEOUT', "300000"));
const MAX_RETRIES = parseInt(getEnvVariable('MAX_RETRIES', "3"));
const RETRY_DELAY = parseInt(getEnvVariable('RETRY_DELAY', "1000"));

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 5 * 60 * 1000,
  maxSize: 100,
};

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = CACHE_CONFIG.maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttl = CACHE_CONFIG.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clear cache for specific pattern (e.g., all financial data)
  clearPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Create cache instance
const apiCache = new ApiCache();

// Configure axios defaults
const api = axios.create({
  baseURL: API_BASE,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens and caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add cache busting for GET requests if needed
    if (config.method === "get" && config.cacheBust) {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.config.method === "get" && response.config.cacheKey) {
      apiCache.set(
        response.config.cacheKey,
        response.data,
        response.config.cacheTTL
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      notification.warning({
        message: "Rate Limit Exceeded",
        description: "Please wait a moment before making another request.",
        duration: 5,
      });
    }

    if (
      (!error.response || error.response.status >= 500) &&
      originalRequest._retryCount < (originalRequest.maxRetries || MAX_RETRIES)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          (originalRequest.retryDelay || RETRY_DELAY) *
            originalRequest._retryCount
        )
      );

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// API Endpoints Configuration
const ENDPOINTS = {
  // Authentication & User Management
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    PASSWORD_RESET_INITIATE: "/auth/password/reset/initiate",
    PASSWORD_RESET_CONFIRM: "/auth/password/reset/confirm",
    ROUTER_CONNECT: "/auth/router/connect",
    ROUTERS: "/auth/routers",
    ROUTER_CREDENTIALS: (routerName) =>
      `/auth/router/${routerName}/credentials`,
    ROUTER_TEST: (routerName) => `/auth/router/${routerName}/test`,
    SUBSCRIPTION_GENERATE: "/auth/subscription/generate",
    SUBSCRIPTION_VERIFY: "/auth/subscription/verify",
    SUBSCRIPTION_STATUS: "/auth/subscription/status",
    SUBSCRIPTIONS: "/auth/subscriptions",
    ADMIN_USERS: "/auth/admin/users",
    ADMIN_DEACTIVATE_USER: (userId) => `/auth/admin/user/${userId}/deactivate`,
  },

  // Financial Endpoints
  FINANCIAL: {
    STATS: "/financial/stats",
    REVENUE_DATA: "/financial/revenue-data",
    PROFILE_STATS: "/financial/profile-stats",
    ACTIVE_REVENUE: "/financial/active-revenue",
  },

  // Voucher Endpoints
  VOUCHERS: {
    GENERATE: "/vouchers/generate",
    EXPIRED: "/vouchers/expired",
    DETAIL: (voucherCode) => `/vouchers/${voucherCode}`,
    PDF: (voucherCode) => `/vouchers/${voucherCode}/pdf`,
    BATCH_PDF: "/vouchers/batch/pdf",
    BULK_DELETE: "/vouchers/bulk-delete",
    STATS: "/vouchers/stats",
  },

  // User Endpoints
  USERS: {
    ALL: "/all-users",
    ACTIVE: "/active-users",
    EXPIRED: "/users/expired",
    DETAIL: (username) => `/users/${username}`,
    COMMENT: (username) => `/users/${username}/comments`,
    BULK_ACTIONS: "/users/bulk-actions",
    SESSIONS: (username) => `/users/${username}/sessions`,
  },

  // System Endpoints
  SYSTEM: {
    INFO: "/system/info",
    HEALTH: "/system/health",
    BACKUP: "/system/backup",
    RESTORE: "/system/restore",
    LOGS: "/system/logs",
  },

  // Pricing Endpoints
  PRICING: {
    RATES: "/pricing/rates",
    DISCOUNTS: "/pricing/discounts",
    BULK_UPDATE: "/pricing/bulk-update",
  },

  // Profile Endpoints
  PROFILES: {
    ENHANCED: "/profiles/enhanced",
    CREATE: "/profiles/create",
    UPDATE: (profileName) => `/profiles/${profileName}`,
    DELETE: (profileName) => `/profiles/${profileName}`,
    USAGE_STATS: (profileName) => `/profiles/${profileName}/usage`,
  },

  // Analytics Endpoints
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    REPORTS: "/analytics/reports",
    EXPORT: "/analytics/export",
  },
};

// Socket.IO Service with enhanced features
class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connectionCallbacks = [];
    this.disconnectionCallbacks = [];
    this.errorCallbacks = [];
    this.reconnectCallbacks = [];
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 10;
    this.autoReconnect = true;
  }

  connect(authToken = null) {
    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      const config = {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxConnectionAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
      };

      // Add auth token if provided
      if (authToken) {
        config.auth = { token: authToken };
      } else {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
          config.auth = { token: storedToken };
        }
      }

      this.socket = io(API_BASE, config);
      this.setupEventListeners();

      return this.socket;
    } catch (error) {
      console.error("Failed to initialize Socket.IO:", error);
      this.handleConnectionError(error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.connectionAttempts = 0;
      console.log("🔌 Socket.IO connected successfully");
      this.connectionCallbacks.forEach((callback) => callback());

      notification.success({
        message: "Real-time Connection Established",
        description: "Live updates are now active.",
        duration: 3,
      });
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log("🔌 Socket.IO disconnected:", reason);
      this.disconnectionCallbacks.forEach((callback) => callback(reason));

      if (reason === "io server disconnect") {
        // Server intentionally disconnected, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 Socket.IO connection error:", error);
      this.connectionAttempts++;
      this.errorCallbacks.forEach((callback) => callback(error));

      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        notification.error({
          message: "Connection Failed",
          description:
            "Unable to establish real-time connection. Please refresh the page.",
          duration: 5,
        });
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔌 Socket.IO reconnected after", attemptNumber, "attempts");
      this.isConnected = true;
      this.reconnectCallbacks.forEach((callback) => callback(attemptNumber));

      notification.info({
        message: "Connection Restored",
        description: `Reconnected after ${attemptNumber} attempts.`,
        duration: 3,
      });
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔌 Socket.IO reconnect attempt:", attemptNumber);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("🔌 Socket.IO reconnect error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("🔌 Socket.IO reconnect failed");
      this.isConnected = false;
      notification.error({
        message: "Connection Lost",
        description: "Unable to reconnect. Please refresh the page.",
        duration: 0, // Don't auto-close
      });
    });

    // Application-specific events
    this.socket.on("unauthorized", (error) => {
      console.error("🔌 Socket.IO unauthorized:", error);
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log("🔌 Socket.IO disconnected manually");
    }
  }

  on(event, callback) {
    if (!this.socket) this.connect();

    this.socket.on(event, callback);

    // Track listeners for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
        // Remove from tracked listeners
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
          const index = eventListeners.indexOf(callback);
          if (index > -1) {
            eventListeners.splice(index, 1);
          }
        }
      } else {
        this.socket.off(event);
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn("🔌 Socket not connected, cannot emit event:", event);
      if (callback) callback(new Error("Socket not connected"));
      return false;
    }

    try {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
      return true;
    } catch (error) {
      console.error("🔌 Error emitting socket event:", error);
      if (callback) callback(error);
      return false;
    }
  }

  // Promise-based emit with timeout
  emitWithAck(event, data, timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error(`Socket event ${event} timeout after ${timeout}ms`));
      }, timeout);

      this.socket.emit(event, data, (response) => {
        clearTimeout(timer);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Connection status management
  onConnect(callback) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  onDisconnect(callback) {
    this.disconnectionCallbacks.push(callback);
    return () => {
      this.disconnectionCallbacks = this.disconnectionCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  onError(callback) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  onReconnect(callback) {
    this.reconnectCallbacks.push(callback);
    return () => {
      this.reconnectCallbacks = this.reconnectCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Specific event handlers for your application
  onLiveData(callback) {
    return this.on("live_data", callback);
  }

  onUpdateVouchers(callback) {
    return this.on("update_vouchers", callback);
  }

  onUpdateUsers(callback) {
    return this.on("update_users", callback);
  }

  onSystemUpdate(callback) {
    return this.on("system_update", callback);
  }

  onUserConnected(callback) {
    return this.on("user_connected", callback);
  }

  onUserDisconnected(callback) {
    return this.on("user_disconnected", callback);
  }

  onVoucherGenerated(callback) {
    return this.on("voucher_generated", callback);
  }

  onVoucherUsed(callback) {
    return this.on("voucher_used", callback);
  }

  // Connection management
  getConnectionStatus() {
    return this.isConnected;
  }

  getConnectionAttempts() {
    return this.connectionAttempts;
  }

  setAutoReconnect(autoReconnect) {
    this.autoReconnect = autoReconnect;
    if (this.socket) {
      this.socket.io.reconnection(autoReconnect);
    }
  }

  // Cleanup all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    this.listeners.clear();
    this.connectionCallbacks = [];
    this.disconnectionCallbacks = [];
    this.errorCallbacks = [];
    this.reconnectCallbacks = [];
  }

  handleConnectionError(error) {
    console.error("🔌 Socket connection error:", error);
    this.errorCallbacks.forEach((callback) => callback(error));
  }
}

// Create singleton instance
const socketService = new SocketService();

// Enhanced API Service with caching and retry logic
const ApiService = {
  // Cache management
  cache: {
    get: (key) => apiCache.get(key),
    set: (key, data, ttl) => apiCache.set(key, data, ttl),
    delete: (key) => apiCache.delete(key),
    clear: () => apiCache.clear(),
    clearPattern: (pattern) => apiCache.clearPattern(pattern),
  },

  // Authentication & User Management
  auth: {
    register: async (userData) => {
      try {
        const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
        ApiService.cache.clearPattern("auth");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Registration failed");
      }
    },

    login: async (email, password, deviceInfo) => {
      try {
        const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
          email,
          password,
          device_info: deviceInfo,
        });

        if (response.data.success && response.data.token) {
          localStorage.setItem("authToken", response.data.token);
          // Reconnect socket with new auth
          socketService.connect(response.data.token);
          ApiService.cache.clear(); // Clear all cache on login
        }

        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Login failed");
      }
    },

    logout: async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.post(
          ENDPOINTS.AUTH.LOGOUT,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        localStorage.removeItem("authToken");
        socketService.disconnect();
        ApiService.cache.clear();
        return response.data;
      } catch (error) {
        localStorage.removeItem("authToken");
        socketService.disconnect();
        ApiService.cache.clear();
        throw ApiService.utils.handleError(error, "Logout failed");
      }
    },

    getProfile: async (useCache = true) => {
      const cacheKey = "auth_profile";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.AUTH.PROFILE);
        ApiService.cache.set(cacheKey, response.data, 2 * 60 * 1000); // 2 minutes
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to fetch profile");
      }
    },

    initiatePasswordReset: async (email) => {
      try {
        const response = await api.post(
          ENDPOINTS.AUTH.PASSWORD_RESET_INITIATE,
          { email }
        );
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Password reset initiation failed"
        );
      }
    },

    confirmPasswordReset: async (token, newPassword) => {
      try {
        const response = await api.post(ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, {
          token,
          new_password: newPassword,
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Password reset failed");
      }
    },

    connectRouter: async (routerData) => {
      try {
        const response = await api.post(
          ENDPOINTS.AUTH.ROUTER_CONNECT,
          routerData
        );
        ApiService.cache.clearPattern("routers");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Router connection failed");
      }
    },

    getUserRouters: async (useCache = true) => {
      const cacheKey = "user_routers";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.AUTH.ROUTERS);
        ApiService.cache.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to fetch routers");
      }
    },

    getRouterCredentials: async (routerName) => {
      try {
        const response = await api.get(
          ENDPOINTS.AUTH.ROUTER_CREDENTIALS(routerName)
        );
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch router credentials"
        );
      }
    },

    testRouterConnection: async (routerName) => {
      try {
        const response = await api.post(ENDPOINTS.AUTH.ROUTER_TEST(routerName));
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Router connection test failed"
        );
      }
    },

    generateSubscription: async (duration, packageType, quantity = 1) => {
      try {
        const response = await api.post(ENDPOINTS.AUTH.SUBSCRIPTION_GENERATE, {
          duration,
          package_type: packageType,
          quantity,
        });
        ApiService.cache.clearPattern("subscriptions");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to generate subscription codes"
        );
      }
    },

    verifySubscription: async (code) => {
      try {
        const response = await api.post(ENDPOINTS.AUTH.SUBSCRIPTION_VERIFY, {
          code,
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to verify subscription"
        );
      }
    },

    checkSubscriptionStatus: async () => {
      try {
        const response = await api.get(ENDPOINTS.AUTH.SUBSCRIPTION_STATUS);
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to check subscription status"
        );
      }
    },

    getUserSubscriptions: async () => {
      try {
        const response = await api.get(ENDPOINTS.AUTH.SUBSCRIPTIONS);
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to retrieve subscriptions"
        );
      }
    },

    // Admin functions
    getAllUsers: async () => {
      try {
        const response = await api.get(ENDPOINTS.AUTH.ADMIN_USERS);
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to retrieve users");
      }
    },

    deactivateUser: async (userId) => {
      try {
        const response = await api.post(
          ENDPOINTS.AUTH.ADMIN_DEACTIVATE_USER(userId)
        );
        ApiService.cache.clearPattern("users");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to deactivate user");
      }
    },
  },

  // Financial Data
  financial: {
    getStats: async (useCache = true) => {
      const cacheKey = "financial_stats";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.FINANCIAL.STATS, {
          cacheKey,
          cacheTTL: 2 * 60 * 1000, // 2 minutes
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch financial stats"
        );
      }
    },

    getRevenueData: async (days = 30, useCache = true) => {
      const cacheKey = `revenue_data_${days}`;

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(
          `${ENDPOINTS.FINANCIAL.REVENUE_DATA}?days=${days}`,
          {
            cacheKey,
            cacheTTL: 5 * 60 * 1000, // 5 minutes
          }
        );
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch revenue data"
        );
      }
    },

    getProfileStats: async (useCache = true) => {
      const cacheKey = "profile_stats";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.FINANCIAL.PROFILE_STATS, {
          cacheKey,
          cacheTTL: 3 * 60 * 1000, // 3 minutes
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch profile stats"
        );
      }
    },

    getActiveRevenue: async (useCache = false) => {
      // Don't cache real-time data
      try {
        const response = await api.get(ENDPOINTS.FINANCIAL.ACTIVE_REVENUE, {
          cacheBust: true, // Always get fresh data
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch active revenue data"
        );
      }
    },
  },

  // Voucher Management
  vouchers: {
    generate: async (voucherData) => {
      try {
        const response = await api.post(
          ENDPOINTS.VOUCHERS.GENERATE,
          voucherData
        );
        ApiService.cache.clearPattern("vouchers");
        // Emit socket event for real-time update
        socketService.emit("voucher_generated", response.data);
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to generate vouchers"
        );
      }
    },

    getExpired: async (useCache = true) => {
      const cacheKey = "expired_vouchers";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.VOUCHERS.EXPIRED, {
          cacheKey,
          cacheTTL: 2 * 60 * 1000, // 2 minutes
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch expired vouchers"
        );
      }
    },

    getDetail: async (voucherCode) => {
      try {
        const response = await api.get(ENDPOINTS.VOUCHERS.DETAIL(voucherCode));
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch voucher details"
        );
      }
    },

    generatePDF: async (voucherCode, style = "standard", download = true) => {
      try {
        const response = await api.get(ENDPOINTS.VOUCHERS.PDF(voucherCode), {
          params: { style, download: download.toString() },
          responseType: "blob",
          timeout: 60000, // Longer timeout for PDF generation
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to generate PDF");
      }
    },

    generateBatchPDF: async (voucherCodes, download = true) => {
      try {
        const response = await api.post(
          ENDPOINTS.VOUCHERS.BATCH_PDF,
          { voucher_codes: voucherCodes },
          {
            responseType: "blob",
            params: { download: download.toString() },
            timeout: 120000, // Even longer timeout for batch PDF
          }
        );
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to generate batch PDF"
        );
      }
    },

    bulkDelete: async (voucherCodes) => {
      try {
        const response = await api.post(ENDPOINTS.VOUCHERS.BULK_DELETE, {
          voucher_codes: voucherCodes,
        });
        ApiService.cache.clearPattern("vouchers");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to delete vouchers");
      }
    },

    getStats: async () => {
      try {
        const response = await api.get(ENDPOINTS.VOUCHERS.STATS);
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch voucher stats"
        );
      }
    },
  },

  // User Management
  users: {
    getAll: async (useCache = true) => {
      const cacheKey = "all_users";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.USERS.ALL, {
          cacheKey,
          cacheTTL: 2 * 60 * 1000, // 2 minutes
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to fetch users");
      }
    },

    getActive: async (useCache = false) => {
      // Don't cache active users (real-time)
      try {
        const response = await api.get(ENDPOINTS.USERS.ACTIVE, {
          cacheBust: true,
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch active users"
        );
      }
    },

    getExpired: async (useCache = true) => {
      const cacheKey = "expired_users";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.USERS.EXPIRED, {
          cacheKey,
          cacheTTL: 5 * 60 * 1000, // 5 minutes
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch expired users"
        );
      }
    },

    getDetail: async (username) => {
      try {
        const response = await api.get(ENDPOINTS.USERS.DETAIL(username));
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch user details"
        );
      }
    },

    updateComment: async (username, comment) => {
      try {
        const response = await api.put(ENDPOINTS.USERS.COMMENT(username), {
          comment,
        });
        ApiService.cache.clearPattern("users");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to update comment");
      }
    },

    getSessions: async (username) => {
      try {
        const response = await api.get(ENDPOINTS.USERS.SESSIONS(username));
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch user sessions"
        );
      }
    },

    bulkActions: async (action, userData) => {
      try {
        const response = await api.post(ENDPOINTS.USERS.BULK_ACTIONS, {
          action,
          ...userData,
        });
        ApiService.cache.clearPattern("users");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to perform bulk action"
        );
      }
    },
  },

  // System Information
  system: {
    getInfo: async (useCache = true) => {
      const cacheKey = "system_info";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.SYSTEM.INFO, {
          cacheKey,
          cacheTTL: 1 * 60 * 1000, // 1 minute (system info changes frequently)
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch system info"
        );
      }
    },

    getHealth: async () => {
      try {
        const response = await api.get(ENDPOINTS.SYSTEM.HEALTH, {
          cacheBust: true,
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch system health"
        );
      }
    },

    backup: async () => {
      try {
        const response = await api.post(ENDPOINTS.SYSTEM.BACKUP);
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to create backup");
      }
    },

    getLogs: async (lines = 100) => {
      try {
        const response = await api.get(
          `${ENDPOINTS.SYSTEM.LOGS}?lines=${lines}`
        );
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch system logs"
        );
      }
    },
  },

  // Pricing Management
  pricing: {
    getRates: async (useCache = true) => {
      const cacheKey = "pricing_rates";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.PRICING.RATES, {
          cacheKey,
          cacheTTL: 10 * 60 * 1000, // 10 minutes
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch pricing rates"
        );
      }
    },

    updateRates: async (rates) => {
      try {
        const response = await api.put(ENDPOINTS.PRICING.RATES, { rates });
        ApiService.cache.clearPattern("pricing");
        ApiService.cache.clearPattern("financial"); // Clear financial cache as rates affect revenue calculations
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to update pricing rates"
        );
      }
    },

    getDiscounts: async () => {
      try {
        const response = await api.get(ENDPOINTS.PRICING.DISCOUNTS);
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to fetch discounts");
      }
    },

    bulkUpdate: async (updates) => {
      try {
        const response = await api.post(ENDPOINTS.PRICING.BULK_UPDATE, updates);
        ApiService.cache.clearPattern("pricing");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to bulk update pricing"
        );
      }
    },
  },


  profiles: {
    getEnhanced: async (useCache = true) => {
      const cacheKey = "profiles_enhanced";

      if (useCache) {
        const cached = ApiService.cache.get(cacheKey);
        if (cached) return cached;
      }

      try {
        const response = await api.get(ENDPOINTS.PROFILES.ENHANCED, {
          cacheKey,
          cacheTTL: 5 * 60 * 1000,
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to fetch profiles");
      }
    },

    create: async (profileData) => {
      try {
        const response = await api.post(ENDPOINTS.PROFILES.CREATE, profileData);
        ApiService.cache.clearPattern("profiles");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to create profile");
      }
    },

    update: async (profileName, profileData) => {
      try {
        const response = await api.put(
          ENDPOINTS.PROFILES.UPDATE(profileName),
          profileData
        );
        ApiService.cache.clearPattern("profiles");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to update profile");
      }
    },

    delete: async (profileName) => {
      try {
        const response = await api.delete(
          ENDPOINTS.PROFILES.DELETE(profileName)
        );
        ApiService.cache.clearPattern("profiles");
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(error, "Failed to delete profile");
      }
    },

    getUsageStats: async (profileName) => {
      try {
        const response = await api.get(
          ENDPOINTS.PROFILES.USAGE_STATS(profileName)
        );
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch profile usage stats"
        );
      }
    },
  },

  analytics: {
    getDashboard: async () => {
      try {
        const response = await api.get(ENDPOINTS.ANALYTICS.DASHBOARD);
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch analytics dashboard"
        );
      }
    },

    getReports: async (reportType, params = {}) => {
      try {
        const response = await api.get(ENDPOINTS.ANALYTICS.REPORTS, {
          params: { report_type: reportType, ...params },
        });
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to fetch analytics reports"
        );
      }
    },

    exportData: async (exportType, params = {}) => {
      try {
        const response = await api.post(
          ENDPOINTS.ANALYTICS.EXPORT,
          {
            export_type: exportType,
            ...params,
          },
          {
            responseType: "blob",
          }
        );
        return response.data;
      } catch (error) {
        throw ApiService.utils.handleError(
          error,
          "Failed to export analytics data"
        );
      }
    },
  },

  socket: socketService,

  utils: {
    downloadBlob: (blob, filename) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },

    handleError: (error, customMessage = null) => {
      let errorMessage = customMessage || "An unexpected error occurred";
      let errorDetails = "";

      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.error || errorMessage;
        errorDetails = error.response.data?.details || "";
      } else if (error.request) {
        // Request made but no response received
        errorMessage = "Network error: Unable to connect to server";
        errorDetails = "Please check your internet connection and try again.";
      } else {
        // Something else happened
        errorDetails = error.message;
      }

      console.error("API Error:", {
        message: errorMessage,
        details: errorDetails,
        originalError: error,
      });

      // Show notification to user
      notification.error({
        message: errorMessage,
        description: errorDetails,
        duration: 5,
      });

      return {
        success: false,
        error: errorMessage,
        details: errorDetails,
        originalError: error,
      };
    },

    formatBytes: (bytes) => {
      if (!bytes || isNaN(bytes)) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    formatCurrency: (amount, currency = "UGX") => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
      }).format(amount);
    },

    // Validation helpers
    isValidEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    isValidPhone: (phone) => {
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      return phoneRegex.test(phone);
    },

    // Date helpers
    formatDate: (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    formatDateTime: (date) => {
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },

  // Batch operations
  batch: {
    execute: async (operations) => {
      try {
        const results = await Promise.allSettled(operations);

        const successful = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
        const failed = results
          .filter((result) => result.status === "rejected")
          .map((result) => result.reason);

        return {
          success: true,
          successful,
          failed,
          total: operations.length,
          successfulCount: successful.length,
          failedCount: failed.length,
        };
      } catch (error) {
        throw ApiService.utils.handleError(error, "Batch operation failed");
      }
    },
  },

  // Initialize application
  init: () => {
    // Auto-connect socket if user is authenticated
    const token = localStorage.getItem("authToken");
    if (token) {
      socketService.connect(token);
    }

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
    });

    console.log("🔌 API Service initialized");
  },
};

ApiService.init();

export default ApiService;
export { ENDPOINTS, API_BASE, socketService };
