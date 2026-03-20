const { expect } = require('@playwright/test');
const logger = require('../support/logger');

/**
 * Base Page Object - All page objects extend this class
 * Provides common Playwright interactions and utilities
 */
class BasePage {
  constructor(page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'https://your-app.com';
  }

  /**
   * Navigate to a path
   */
  async goto(path = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
    logger.info(`[Page] Navigated to: ${path}`);
  }

  /**
   * Navigate to full URL
   */
  async gotoURL(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    logger.info(`[Page] Navigated to URL: ${url}`);
  }

  /**
   * Get current page URL
   */
  getURL() {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Click element by various strategies
   */
  async click(selector, options = {}) {
    await this.page.locator(selector).click(options);
  }

  /**
   * Click by text content
   */
  async clickByText(text, options = {}) {
    await this.page.getByText(text, { exact: false }).click(options);
  }

  /**
   * Click by role
   */
  async clickByRole(role, name, options = {}) {
    await this.page.getByRole(role, { name }).click(options);
  }

  /**
   * Fill an input field
   */
  async fill(selector, value) {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Select a dropdown option
   */
  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check a checkbox
   */
  async check(selector) {
    await this.page.locator(selector).check();
  }

  /**
   * Uncheck a checkbox
   */
  async uncheck(selector) {
    await this.page.locator(selector).uncheck();
  }

  /**
   * Get text content of an element
   */
  async getText(selector) {
    return (await this.page.locator(selector).textContent())?.trim() || '';
  }

  /**
   * Get input value
   */
  async getValue(selector) {
    return await this.page.locator(selector).inputValue();
  }

  /**
   * Assert element is visible
   */
  async assertVisible(selector, message) {
    await expect(this.page.locator(selector), message).toBeVisible();
  }

  /**
   * Assert element is not visible
   */
  async assertNotVisible(selector) {
    await expect(this.page.locator(selector)).not.toBeVisible();
  }

  /**
   * Assert text content
   */
  async assertText(selector, expectedText) {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  /**
   * Assert URL contains pattern
   */
  async assertURL(pattern) {
    await expect(this.page).toHaveURL(pattern);
  }

  /**
   * Assert page title
   */
  async assertTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementHidden(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot
   */
  async screenshot(name) {
    const screenshotPath = `reports/screenshots/${name}_${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info(`[Page] Screenshot: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Press keyboard key
   */
  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  /**
   * Hover over an element
   */
  async hover(selector) {
    await this.page.locator(selector).hover();
  }

  /**
   * Count elements matching selector
   */
  async count(selector) {
    return await this.page.locator(selector).count();
  }

  /**
   * Check if element exists
   */
  async exists(selector) {
    return (await this.page.locator(selector).count()) > 0;
  }
}

module.exports = BasePage;
