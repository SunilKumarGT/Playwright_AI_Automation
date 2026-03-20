const { Given, When, Then, Before } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const aiClient = require('../ai/aiClient');
const logger = require('../support/logger');

// Page object instances per scenario
let loginPage;
let dashboardPage;

Before(function () {
  loginPage = new LoginPage(this.page);
  dashboardPage = new DashboardPage(this.page);
});

// ─── Given Steps ──────────────────────────────────────────────────────────────

Given('I am on the login page', async function () {
  await loginPage.navigate();
  await loginPage.assertOnLoginPage();
});

Given('I am logged in as {string} with password {string}', async function (email, password) {
  await loginPage.login(email, password);
  await dashboardPage.assertOnDashboard();
});

Given('I am logged in as a test user', async function () {
  await loginPage.loginWithTestCredentials();
  await dashboardPage.assertOnDashboard();
});

Given('I have valid user credentials', function () {
  this.testData.email = process.env.TEST_USER_EMAIL || 'test@example.com';
  this.testData.password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
  logger.info('[Step] Valid credentials prepared');
});

// ─── When Steps ───────────────────────────────────────────────────────────────

When('I enter email {string}', async function (email) {
  await loginPage.enterEmail(email);
});

When('I enter password {string}', async function (password) {
  await loginPage.enterPassword(password);
});

When('I click the login button', async function () {
  await loginPage.clickLoginButton();
});

When('I submit the login form with {string} and {string}', async function (email, password) {
  await loginPage.enterEmail(email);
  await loginPage.enterPassword(password);
  await loginPage.clickLoginButton();
});

When('I log in with valid credentials', async function () {
  await loginPage.enterEmail(this.testData.email);
  await loginPage.enterPassword(this.testData.password);
  await loginPage.clickLoginButton();
  await loginPage.page.waitForLoadState('networkidle');
});

When('I click forgot password', async function () {
  await loginPage.clickForgotPassword();
});

When('I check the Remember Me checkbox', async function () {
  await loginPage.checkRememberMe();
});

When('I log out', async function () {
  await dashboardPage.logout();
});

// ─── Then Steps ───────────────────────────────────────────────────────────────

Then('I should be redirected to the dashboard', async function () {
  await dashboardPage.assertOnDashboard();
});

Then('I should see a welcome message', async function () {
  await dashboardPage.assertVisible(dashboardPage.selectors.welcomeMessage);
});

Then('I should see an error message {string}', async function (expectedError) {
  const errorText = await loginPage.getErrorMessage();
  expect(errorText.toLowerCase()).toContain(expectedError.toLowerCase());
  logger.info(`[Step] Error message verified: "${errorText}"`);
});

Then('I should see an error message', async function () {
  const isErrorDisplayed = await loginPage.isErrorDisplayed();
  expect(isErrorDisplayed).toBe(true);
});

Then('I should remain on the login page', async function () {
  await loginPage.assertOnLoginPage();
});

Then('I should be on the login page', async function () {
  await loginPage.assertOnLoginPage();
});

Then('I should see the forgot password page', async function () {
  await loginPage.page.waitForLoadState('networkidle');
  expect(loginPage.getURL()).toMatch(/forgot|reset|password/i);
});

// ─── AI-Powered Steps ─────────────────────────────────────────────────────────

When('AI validates the login page is correct', async function () {
  const pageContent = await this.page.textContent('body');
  const validation = await aiClient.validatePageContent(
    pageContent,
    'A login page with email and password fields, a login button, and forgot password link'
  );

  await this.attach(
    `🤖 AI Page Validation:\nValid: ${validation.valid}\nConfidence: ${validation.confidence}%\nIssues: ${validation.issues.join(', ') || 'None'}`,
    'text/plain'
  );

  expect(validation.valid).toBe(true);
  logger.info(`[AI Step] Page validation: ${JSON.stringify(validation)}`);
});

Then('AI confirms login was successful', async function () {
  const pageContent = await this.page.textContent('body');
  const validation = await aiClient.validatePageContent(
    pageContent,
    'User is logged in and on the dashboard. Should show user menu, navigation, and main content.'
  );

  await this.attach(
    `🤖 AI Login Confirmation:\nValid: ${validation.valid}\nConfidence: ${validation.confidence}%`,
    'text/plain'
  );

  expect(validation.valid).toBe(true);
});

Given('AI generates test user data', async function () {
  const testUsers = await aiClient.generateTestData('user accounts with email, username, and role', 3);
  this.testData.generatedUsers = testUsers;
  await this.attach(`🤖 AI Generated Test Data:\n${JSON.stringify(testUsers, null, 2)}`, 'text/plain');
  logger.info(`[AI Step] Generated ${testUsers.length} test users`);
});
