const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const aiClient = require('../ai/aiClient');
const logger = require('../support/logger');

// ─── Navigation Steps ─────────────────────────────────────────────────────────

Given('I navigate to {string}', async function (path) {
  await this.page.goto(path);
  await this.page.waitForLoadState('networkidle');
  logger.info(`[Step] Navigated to: ${path}`);
});

Given('I am on the {string} page', async function (pageName) {
  await this.page.goto(`/${pageName.toLowerCase().replace(/\s+/g, '-')}`);
  await this.page.waitForLoadState('networkidle');
});

When('I go back', async function () {
  await this.page.goBack();
  await this.page.waitForLoadState('networkidle');
});

When('I refresh the page', async function () {
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
});

// ─── Interaction Steps ────────────────────────────────────────────────────────

When('I click on {string}', async function (text) {
  await this.page.getByText(text, { exact: false }).click();
  logger.info(`[Step] Clicked on text: "${text}"`);
});

When('I click the {string} button', async function (buttonName) {
  await this.page.getByRole('button', { name: buttonName }).click();
  logger.info(`[Step] Clicked button: "${buttonName}"`);
});

When('I click the {string} link', async function (linkText) {
  await this.page.getByRole('link', { name: linkText }).click();
  logger.info(`[Step] Clicked link: "${linkText}"`);
});

When('I type {string} into {string}', async function (text, fieldName) {
  const field = this.page
    .getByLabel(fieldName)
    .or(this.page.getByPlaceholder(fieldName))
    .or(this.page.locator(`[name="${fieldName}"]`));
  await field.fill(text);
  logger.info(`[Step] Typed "${text}" into "${fieldName}"`);
});

When('I clear and type {string} into {string}', async function (text, fieldName) {
  const field = this.page.getByLabel(fieldName).or(this.page.getByPlaceholder(fieldName));
  await field.clear();
  await field.fill(text);
});

When('I press {string}', async function (key) {
  await this.page.keyboard.press(key);
});

When('I select {string} from {string}', async function (value, dropdownName) {
  const dropdown = this.page.getByLabel(dropdownName).or(this.page.locator(`select[name="${dropdownName}"]`));
  await dropdown.selectOption(value);
});

When('I wait for {int} seconds', async function (seconds) {
  await this.page.waitForTimeout(seconds * 1000);
});

When('I scroll to the bottom of the page', async function () {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
});

// ─── Assertion Steps ──────────────────────────────────────────────────────────

Then('I should see {string}', async function (text) {
  await expect(this.page.getByText(text, { exact: false })).toBeVisible();
  logger.info(`[Step] Verified text visible: "${text}"`);
});

Then('I should not see {string}', async function (text) {
  await expect(this.page.getByText(text, { exact: false })).not.toBeVisible();
});

Then('the page title should be {string}', async function (expectedTitle) {
  await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
});

Then('the URL should contain {string}', async function (urlPart) {
  await expect(this.page).toHaveURL(new RegExp(urlPart));
});

Then('the URL should be {string}', async function (expectedUrl) {
  await expect(this.page).toHaveURL(expectedUrl);
});

Then('I should see a success message', async function () {
  const successSelectors = ['.success', '.alert-success', '[data-testid="success"]', '.toast-success'];
  let found = false;
  for (const selector of successSelectors) {
    if (await this.page.locator(selector).isVisible().catch(() => false)) {
      found = true;
      break;
    }
  }
  expect(found).toBe(true);
});

Then('the {string} field should have value {string}', async function (fieldName, expectedValue) {
  const field = this.page.getByLabel(fieldName).or(this.page.locator(`[name="${fieldName}"]`));
  await expect(field).toHaveValue(expectedValue);
});

Then('the {string} button should be disabled', async function (buttonName) {
  const button = this.page.getByRole('button', { name: buttonName });
  await expect(button).toBeDisabled();
});

Then('the {string} button should be enabled', async function (buttonName) {
  const button = this.page.getByRole('button', { name: buttonName });
  await expect(button).toBeEnabled();
});

Then('I take a screenshot', async function () {
  const screenshot = await this.page.screenshot({ fullPage: true });
  await this.attach(screenshot, 'image/png');
});

// ─── AI-Powered Steps ─────────────────────────────────────────────────────────

Then('AI validates the page shows {string}', async function (expectedContent) {
  const pageContent = await this.page.textContent('body');
  const validation = await aiClient.validatePageContent(pageContent, expectedContent);

  await this.attach(
    `🤖 AI Validation:\nExpected: ${expectedContent}\nValid: ${validation.valid}\nIssues: ${validation.issues.join(', ') || 'None'}`,
    'text/plain'
  );

  expect(validation.valid).toBe(true);
  logger.info(`[AI] Content validation: ${JSON.stringify(validation)}`);
});

When('AI generates test data for {string}', async function (dataType) {
  const data = await aiClient.generateTestData(dataType, 5);
  this.testData.generated = data;

  await this.attach(`🤖 Generated Test Data (${dataType}):\n${JSON.stringify(data, null, 2)}`, 'text/plain');
  logger.info(`[AI] Generated ${data.length} records for: ${dataType}`);
});

Then('AI checks accessibility of the page', async function () {
  const html = await this.page.content();
  const checks = await aiClient.generateAccessibilityChecks(html);

  await this.attach(
    `🤖 AI Accessibility Checks:\n${checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
    'text/plain'
  );

  logger.info(`[AI] Generated ${checks.length} accessibility checks`);
  // Note: actual assertions would be done per check item
});
