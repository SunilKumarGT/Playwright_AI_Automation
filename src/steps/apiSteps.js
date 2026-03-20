const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const logger = require('../support/logger');

// ─── API Request Steps ────────────────────────────────────────────────────────

Given('I send a GET request to {string}', async function (endpoint) {
  const baseURL = process.env.BASE_URL || 'https://your-app.com';
  const response = await this.page.request.get(`${baseURL}${endpoint}`);
  this.testData.lastResponse = {
    status: response.status(),
    body: await response.text(),
    headers: response.headers(),
  };
  logger.info(`[API Step] GET ${endpoint} → ${response.status()}`);
});

Given('I send a POST request to {string} with body:', async function (endpoint, docString) {
  const baseURL = process.env.BASE_URL || 'https://your-app.com';
  const body = JSON.parse(docString);
  const response = await this.page.request.post(`${baseURL}${endpoint}`, { data: body });
  this.testData.lastResponse = {
    status: response.status(),
    body: await response.json().catch(() => response.text()),
    headers: response.headers(),
  };
  logger.info(`[API Step] POST ${endpoint} → ${response.status()}`);
});

Then('the response status should be {int}', async function (expectedStatus) {
  expect(this.testData.lastResponse.status).toBe(expectedStatus);
  logger.info(`[API Step] Status verified: ${expectedStatus}`);
});

Then('the response body should contain {string}', async function (expectedText) {
  const body = JSON.stringify(this.testData.lastResponse.body);
  expect(body).toContain(expectedText);
});

Then('the response should have header {string}', async function (headerName) {
  const headers = this.testData.lastResponse.headers;
  expect(headers).toHaveProperty(headerName.toLowerCase());
});

Then('I log the API response', async function () {
  const response = this.testData.lastResponse;
  await this.attach(
    `API Response:\nStatus: ${response.status}\nBody: ${JSON.stringify(response.body, null, 2)}`,
    'text/plain'
  );
});
