const {
  BeforeAll,
  AfterAll,
  Before,
  After,
  BeforeStep,
  AfterStep,
  Status,
  setWorldConstructor,
  setDefaultTimeout,
} = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('playwright');
const playwrightConfig = require('../../config/playwright.config');
const SelfHealingLocator = require('../ai/selfHealingLocator');
const aiClient = require('../ai/aiClient');
const logger = require('../support/logger');
const fs = require('fs');
const path = require('path');

// Set default timeout
setDefaultTimeout(playwrightConfig.timeout);

// ─── Custom World ─────────────────────────────────────────────────────────────
class CustomWorld {
  constructor({ attach, parameters }) {
    this.attach = attach;
    this.parameters = parameters;
    this.page = null;
    this.context = null;
    this.browser = null;
    this.healer = null;
    this.testData = {};
    this.aiAnalysis = null;
  }

  /**
   * Smart element interaction using self-healing locator
   */
  async findElement(selector, description) {
    return await this.healer.findElement(selector, description);
  }

  /**
   * Attach screenshot to Cucumber report
   */
  async attachScreenshot(name = 'screenshot') {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, 'image/png');
    return screenshot;
  }

  /**
   * Use AI to validate current page state
   */
  async aiValidatePage(expectedBehavior) {
    const content = await this.page.textContent('body');
    return await aiClient.validatePageContent(content, expectedBehavior);
  }
}

setWorldConstructor(CustomWorld);

// ─── Browser Management ────────────────────────────────────────────────────────
let sharedBrowser = null;

BeforeAll(async function () {
  logger.info('🚀 Starting test suite...');

  // Ensure report directories exist
  ['reports', 'test-results', 'reports/screenshots'].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const browserType = playwrightConfig.browser;
  const browsers = { chromium, firefox, webkit };

  logger.info(`Launching browser: ${browserType}`);
  sharedBrowser = await (browsers[browserType] || chromium).launch({
    headless: playwrightConfig.headless,
    slowMo: playwrightConfig.slowMo,
    ...playwrightConfig.launchOptions,
  });

  logger.info('✅ Browser launched successfully');
});

AfterAll(async function () {
  if (sharedBrowser) {
    await sharedBrowser.close();
    logger.info('🛑 Browser closed');
  }
});

// ─── Scenario Setup ────────────────────────────────────────────────────────────
Before(async function (scenario) {
  logger.info(`\n▶ Starting: "${scenario.pickle.name}"`);

  this.browser = sharedBrowser;

  // Create isolated browser context per scenario
  this.context = await this.browser.newContext({
    viewport: playwrightConfig.viewport,
    baseURL: playwrightConfig.baseURL,
    recordVideo: { dir: 'test-results/videos/' },
    ignoreHTTPSErrors: true,
  });

  this.page = await this.context.newPage();

  // Initialize self-healing locator
  this.healer = new SelfHealingLocator(this.page);

  // Set page timeout
  this.page.setDefaultTimeout(playwrightConfig.timeout);

  // Log all console messages
  this.page.on('console', (msg) => {
    if (msg.type() === 'error') {
      logger.warn(`[Browser Console ERROR] ${msg.text()}`);
    }
  });

  // Capture network failures
  this.page.on('requestfailed', (request) => {
    logger.warn(`[Network] Failed: ${request.url()}`);
  });
});

// ─── Step Monitoring ──────────────────────────────────────────────────────────
BeforeStep(async function ({ pickleStep }) {
  logger.info(`  ⏩ Step: ${pickleStep.text}`);
});

AfterStep(async function ({ pickleStep, result }) {
  if (result.status === Status.FAILED) {
    logger.error(`  ❌ FAILED: ${pickleStep.text}`);

    // Capture screenshot on step failure
    if (this.page) {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');

      // AI failure analysis
      try {
        const analysis = await aiClient.analyzeFailure(
          result.message || 'Step failed',
          pickleStep.text,
          `URL: ${this.page.url()}`
        );
        await this.attach(`🤖 AI Analysis:\n${analysis}`, 'text/plain');
        logger.info(`[AI] Failure analysis: ${analysis}`);
      } catch (aiError) {
        logger.warn(`[AI] Could not analyze failure: ${aiError.message}`);
      }
    }
  } else {
    logger.info(`  ✅ Passed: ${pickleStep.text}`);
  }
});

// ─── Scenario Teardown ────────────────────────────────────────────────────────
After(async function (scenario) {
  const status = scenario.result?.status;

  // Attach self-healing log if any healing occurred
  if (this.healer && this.healer.getHealingLog().length > 0) {
    const healLog = JSON.stringify(this.healer.getHealingLog(), null, 2);
    await this.attach(`🔧 Self-Healing Log:\n${healLog}`, 'text/plain');
    logger.info(`[SelfHeal] ${this.healer.getHealingLog().length} selector(s) healed`);
  }

  // Final screenshot on failure
  if (status === Status.FAILED && this.page) {
    const screenshotPath = path.join(
      'reports/screenshots',
      `${scenario.pickle.name.replace(/\s+/g, '_')}_${Date.now()}.png`
    );
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info(`Screenshot saved: ${screenshotPath}`);
  }

  // Close context (saves video)
  if (this.context) {
    await this.context.close();
  }

  logger.info(`◀ Finished: "${scenario.pickle.name}" [${status}]\n`);
});
