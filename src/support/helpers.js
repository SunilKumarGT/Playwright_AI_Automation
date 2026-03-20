const logger = require('./logger');

/**
 * Common test helper utilities
 */
class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    logger.info('[Helper] Page fully loaded');
  }

  /**
   * Safe click - waits for element then clicks
   */
  async safeClick(selector, options = {}) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    await element.scrollIntoViewIfNeeded();
    await element.click(options);
    logger.info(`[Helper] Clicked: ${selector}`);
  }

  /**
   * Safe type - clears and types
   */
  async safeType(selector, text, options = {}) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    await element.clear();
    await element.fill(text, options);
    logger.info(`[Helper] Typed in: ${selector}`);
  }

  /**
   * Get element text safely
   */
  async getText(selector) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 10000 });
    const text = await element.textContent();
    return text?.trim() || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for URL to contain a pattern
   */
  async waitForURL(pattern, timeout = 15000) {
    await this.page.waitForURL(pattern, { timeout });
    logger.info(`[Helper] URL matched: ${pattern}`);
  }

  /**
   * Scroll to element
   */
  async scrollTo(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Select dropdown value
   */
  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
    logger.info(`[Helper] Selected option: ${value} in ${selector}`);
  }

  /**
   * Upload a file
   */
  async uploadFile(selector, filePath) {
    await this.page.setInputFiles(selector, filePath);
    logger.info(`[Helper] Uploaded file: ${filePath}`);
  }

  /**
   * Take and save a screenshot
   */
  async screenshot(name) {
    const path = `reports/screenshots/${name}_${Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: true });
    logger.info(`[Helper] Screenshot saved: ${path}`);
    return path;
  }

  /**
   * Dismiss dialog (alert/confirm)
   */
  async dismissDialog() {
    this.page.once('dialog', (dialog) => dialog.dismiss());
  }

  /**
   * Accept dialog and optionally type
   */
  async acceptDialog(text = '') {
    this.page.once('dialog', async (dialog) => {
      if (text) await dialog.accept(text);
      else await dialog.accept();
    });
  }

  /**
   * Get all items from a list/table
   */
  async getListItems(selector) {
    const items = await this.page.locator(selector).allTextContents();
    return items.map((i) => i.trim()).filter(Boolean);
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForSpinner(spinnerSelector = '.spinner, .loading, [data-loading="true"]') {
    try {
      await this.page.waitForSelector(spinnerSelector, { state: 'visible', timeout: 2000 });
      await this.page.waitForSelector(spinnerSelector, { state: 'hidden', timeout: 30000 });
    } catch {
      // Spinner may not appear, that's fine
    }
  }

  /**
   * Retry an action up to N times
   */
  async retry(action, maxRetries = 3, delay = 1000) {
    for (let i = 1; i <= maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        if (i === maxRetries) throw error;
        logger.warn(`[Helper] Retry ${i}/${maxRetries}: ${error.message}`);
        await this.page.waitForTimeout(delay);
      }
    }
  }

  /**
   * Generate random string
   */
  randomString(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * Generate random email
   */
  randomEmail() {
    return `test_${this.randomString(6)}@example.com`;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
  }
}

module.exports = TestHelpers;
