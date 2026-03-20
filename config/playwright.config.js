require('dotenv').config();

const config = {
  // Browser configuration
  browser: process.env.BROWSER || 'chromium',
  headless: process.env.HEADED !== 'true',
  slowMo: parseInt(process.env.SLOW_MO) || 0,
  timeout: parseInt(process.env.TIMEOUT) || 30000,

  // Viewport
  viewport: { width: 1280, height: 720 },

  // Base URL
  baseURL: process.env.BASE_URL || 'https://your-app.com',

  // Screenshots & Videos
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'retain-on-failure',

  // Retries
  retries: 1,

  // Output directories
  outputDir: 'test-results/',

  // Launch options
  launchOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};

module.exports = config;
