const BasePage = require('./BasePage');
const logger = require('../support/logger');

/**
 * Login Page Object
 * Handles all login page interactions
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Selectors
    this.selectors = {
      emailInput: '[data-testid="email-input"], #email, input[type="email"]',
      passwordInput: '[data-testid="password-input"], #password, input[type="password"]',
      loginButton: '[data-testid="login-btn"], button[type="submit"], .login-btn',
      rememberMe: '[data-testid="remember-me"], #remember-me',
      forgotPasswordLink: '[data-testid="forgot-password"], a:has-text("Forgot")',
      errorMessage: '[data-testid="error-message"], .error, .alert-danger',
      successMessage: '[data-testid="success-message"], .success, .alert-success',
      googleLoginBtn: '[data-testid="google-login"], .google-login',
      registerLink: 'a:has-text("Register"), a:has-text("Sign up")',
    };
  }

  /**
   * Navigate to login page
   */
  async navigate() {
    await this.goto('/login');
    logger.info('[LoginPage] Navigated to login page');
  }

  /**
   * Enter email address
   */
  async enterEmail(email) {
    await this.fill(this.selectors.emailInput, email);
    logger.info(`[LoginPage] Email entered: ${email}`);
  }

  /**
   * Enter password
   */
  async enterPassword(password) {
    await this.fill(this.selectors.passwordInput, password);
    logger.info('[LoginPage] Password entered');
  }

  /**
   * Click login button
   */
  async clickLoginButton() {
    await this.click(this.selectors.loginButton);
    logger.info('[LoginPage] Login button clicked');
  }

  /**
   * Complete login with credentials
   */
  async login(email, password) {
    await this.navigate();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLoginButton();
    await this.waitForNavigation();
    logger.info(`[LoginPage] Login attempted for: ${email}`);
  }

  /**
   * Login with default test credentials from env
   */
  async loginWithTestCredentials() {
    await this.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'TestPassword123!'
    );
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    await this.waitForElement(this.selectors.errorMessage, 5000);
    return await this.getText(this.selectors.errorMessage);
  }

  /**
   * Check if error is displayed
   */
  async isErrorDisplayed() {
    return await this.exists(this.selectors.errorMessage);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.click(this.selectors.forgotPasswordLink);
  }

  /**
   * Toggle remember me checkbox
   */
  async checkRememberMe() {
    await this.check(this.selectors.rememberMe);
  }

  /**
   * Assert login page is displayed
   */
  async assertOnLoginPage() {
    await this.assertURL(/login/);
    await this.assertVisible(this.selectors.emailInput);
    await this.assertVisible(this.selectors.passwordInput);
    logger.info('[LoginPage] Verified on login page');
  }

  /**
   * Assert login was successful (redirected away from login)
   */
  async assertLoginSuccessful() {
    await this.page.waitForURL((url) => !url.includes('/login'), { timeout: 10000 });
    logger.info('[LoginPage] Login successful - redirected from login page');
  }

  /**
   * Assert login failed with error
   */
  async assertLoginFailed(expectedError = '') {
    const error = await this.getErrorMessage();
    if (expectedError) {
      const { expect } = require('@playwright/test');
      expect(error.toLowerCase()).toContain(expectedError.toLowerCase());
    }
    logger.info(`[LoginPage] Login failed as expected: ${error}`);
  }
}

module.exports = LoginPage;
