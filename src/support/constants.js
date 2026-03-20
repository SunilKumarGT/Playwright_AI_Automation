/**
 * Test Constants
 * Centralized constants used across the framework
 */

const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  VERY_LONG: 60000,
  PAGE_LOAD: 30000,
  ANIMATION: 1000,
};

const URLS = {
  BASE: process.env.BASE_URL || 'https://your-app.com',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
};

const TEST_USERS = {
  ADMIN: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'AdminPass123!',
    role: 'admin',
  },
  STANDARD: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
    role: 'user',
  },
  READONLY: {
    email: process.env.READONLY_EMAIL || 'readonly@example.com',
    password: process.env.READONLY_PASSWORD || 'ReadOnly123!',
    role: 'readonly',
  },
};

const MESSAGES = {
  LOGIN_SUCCESS: 'Welcome',
  LOGIN_FAILED: 'Invalid credentials',
  LOGOUT_SUCCESS: 'You have been logged out',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email',
  PASSWORD_TOO_SHORT: 'Password must be at least',
};

const BROWSERS = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
  WEBKIT: 'webkit',
};

const TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  AI: '@ai',
  POSITIVE: '@positive',
  NEGATIVE: '@negative',
  API: '@api',
  LOGIN: '@login',
  DASHBOARD: '@dashboard',
};

module.exports = {
  TIMEOUTS,
  URLS,
  TEST_USERS,
  MESSAGES,
  BROWSERS,
  TAGS,
};
