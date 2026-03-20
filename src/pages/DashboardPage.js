const BasePage = require('./BasePage');
const logger = require('../support/logger');

/**
 * Dashboard Page Object
 */
class DashboardPage extends BasePage {
  constructor(page) {
    super(page);

    this.selectors = {
      welcomeMessage: '[data-testid="welcome-msg"], .welcome, h1',
      userMenu: '[data-testid="user-menu"], .user-menu, .avatar',
      logoutBtn: '[data-testid="logout"], button:has-text("Logout"), a:has-text("Sign out")',
      sidebar: '[data-testid="sidebar"], .sidebar, nav',
      mainContent: '[data-testid="main-content"], main, .content',
      notificationBell: '[data-testid="notifications"], .notification-bell',
      searchBar: '[data-testid="search"], input[placeholder*="search" i]',
      profileLink: '[data-testid="profile"], a:has-text("Profile")',
      settingsLink: '[data-testid="settings"], a:has-text("Settings")',
      loadingSpinner: '.spinner, [data-loading="true"], .loading',
    };
  }

  /**
   * Navigate to dashboard
   */
  async navigate() {
    await this.goto('/dashboard');
    await this.waitForPageLoad();
    logger.info('[DashboardPage] Navigated to dashboard');
  }

  /**
   * Wait for dashboard to fully load
   */
  async waitForPageLoad() {
    try {
      await this.waitForElementHidden(this.selectors.loadingSpinner, 10000);
    } catch {
      // Spinner may not appear
    }
    await this.waitForElement(this.selectors.mainContent, 15000);
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage() {
    return await this.getText(this.selectors.welcomeMessage);
  }

  /**
   * Open user menu
   */
  async openUserMenu() {
    await this.click(this.selectors.userMenu);
    logger.info('[DashboardPage] User menu opened');
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.openUserMenu();
    await this.click(this.selectors.logoutBtn);
    await this.waitForNavigation();
    logger.info('[DashboardPage] Logged out successfully');
  }

  /**
   * Navigate to profile page
   */
  async goToProfile() {
    await this.openUserMenu();
    await this.click(this.selectors.profileLink);
    await this.waitForNavigation();
  }

  /**
   * Navigate to settings
   */
  async goToSettings() {
    await this.click(this.selectors.settingsLink);
    await this.waitForNavigation();
  }

  /**
   * Search for content
   */
  async search(query) {
    await this.fill(this.selectors.searchBar, query);
    await this.pressKey('Enter');
    await this.waitForNavigation();
    logger.info(`[DashboardPage] Searched for: ${query}`);
  }

  /**
   * Assert user is on dashboard
   */
  async assertOnDashboard() {
    await this.assertURL(/dashboard/);
    await this.assertVisible(this.selectors.mainContent);
    logger.info('[DashboardPage] Verified on dashboard');
  }

  /**
   * Assert welcome message contains username
   */
  async assertWelcomeMessage(username) {
    const message = await this.getWelcomeMessage();
    const { expect } = require('@playwright/test');
    expect(message.toLowerCase()).toContain(username.toLowerCase());
  }
}

module.exports = DashboardPage;
