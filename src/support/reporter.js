const report = require('multiple-cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

const reportsDir = path.join(process.cwd(), 'reports');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

report.generate({
  jsonDir: reportsDir,
  reportPath: path.join(reportsDir, 'html'),
  metadata: {
    browser: {
      name: process.env.BROWSER || 'chromium',
      version: 'latest',
    },
    device: 'Local test machine',
    platform: {
      name: process.platform,
      version: process.version,
    },
  },
  customData: {
    title: 'AI-Powered Test Run Info',
    data: [
      { label: 'Project', value: 'Playwright + Cucumber + AI Framework' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Execution Start Time', value: new Date().toLocaleString() },
      { label: 'AI Model', value: process.env.AI_MODEL || 'claude-opus-4-5' },
      { label: 'Base URL', value: process.env.BASE_URL || 'N/A' },
    ],
  },
  pageTitle: 'AI Test Automation Report',
  reportName: '🤖 Playwright + Cucumber + AI - Test Report',
  displayDuration: true,
  durationInMS: true,
  hideMetadata: false,
  openReportInBrowser: false,
});

console.log('✅ HTML Report generated at: reports/html/index.html');
