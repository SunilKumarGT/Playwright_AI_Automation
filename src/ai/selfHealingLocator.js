const aiClient = require('./aiClient');
const logger = require('../support/logger');

/**
 * Self-Healing Locator
 * Uses AI to automatically fix broken selectors during test execution
 */
class SelfHealingLocator {
  constructor(page) {
    this.page = page;
    this.healedSelectors = new Map(); // Cache healed selectors
    this.healingLog = [];
  }

  /**
   * Try to find an element with self-healing capability
   * @param {string} selector - Original selector
   * @param {string} description - Human-readable element description
   * @param {Object} options - Playwright locator options
   * @returns {Promise<Locator>}
   */
  async findElement(selector, description = 'unknown element', options = {}) {
    // Check if we have a cached healed selector
    if (this.healedSelectors.has(selector)) {
      const healedSelector = this.healedSelectors.get(selector);
      logger.info(`[SelfHeal] Using cached healed selector: ${healedSelector}`);
      return this.page.locator(healedSelector, options);
    }

    // Try original selector first
    try {
      const locator = this.page.locator(selector, options);
      await locator.waitFor({ timeout: 5000 });
      return locator;
    } catch (error) {
      logger.warn(`[SelfHeal] Selector failed: "${selector}" for "${description}". Attempting AI healing...`);
      return await this.healSelector(selector, description, options);
    }
  }

  /**
   * AI-powered selector healing
   */
  async healSelector(brokenSelector, description, options = {}) {
    try {
      // Get page HTML for context
      const pageHTML = await this.page.content();

      // Ask AI for a better selector
      const newSelector = await aiClient.healSelector(brokenSelector, pageHTML, description);
      const cleanSelector = newSelector.trim().replace(/^["']|["']$/g, '');

      logger.info(`[SelfHeal] AI suggested selector: "${cleanSelector}"`);

      // Try the healed selector
      const locator = this.page.locator(cleanSelector, options);
      await locator.waitFor({ timeout: 5000 });

      // Cache the successful healed selector
      this.healedSelectors.set(brokenSelector, cleanSelector);

      // Log the healing event
      this.healingLog.push({
        timestamp: new Date().toISOString(),
        original: brokenSelector,
        healed: cleanSelector,
        description,
        url: this.page.url(),
      });

      logger.info(`[SelfHeal] ✅ Successfully healed selector for "${description}"`);
      return locator;
    } catch (healError) {
      logger.error(`[SelfHeal] ❌ Failed to heal selector: ${healError.message}`);
      throw new Error(
        `Element not found: "${description}" (original: ${brokenSelector})\n` +
        `Self-healing also failed: ${healError.message}`
      );
    }
  }

  /**
   * Smart click with self-healing
   */
  async smartClick(selector, description, options = {}) {
    const element = await this.findElement(selector, description);
    await element.click(options);
  }

  /**
   * Smart fill with self-healing
   */
  async smartFill(selector, value, description, options = {}) {
    const element = await this.findElement(selector, description);
    await element.fill(value, options);
  }

  /**
   * Smart get text with self-healing
   */
  async smartGetText(selector, description) {
    const element = await this.findElement(selector, description);
    return await element.textContent();
  }

  /**
   * Get the healing log for reporting
   */
  getHealingLog() {
    return this.healingLog;
  }

  /**
   * Export healed selectors for updating the codebase
   */
  exportHealedSelectors() {
    const selectors = {};
    this.healedSelectors.forEach((healed, original) => {
      selectors[original] = healed;
    });
    return selectors;
  }
}

module.exports = SelfHealingLocator;
