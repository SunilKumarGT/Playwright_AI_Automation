/**
 * World Configuration
 * Extends the Cucumber World with shared state and utilities
 * Note: The main World class is defined in hooks.js via setWorldConstructor
 * This file provides additional world-level helpers and data stores
 */

const { Before, After } = require('@cucumber/cucumber');
const logger = require('../support/logger');

/**
 * Scenario-level test context
 * These are added to `this` in each step definition
 */

// Initialize scenario-specific test data store
Before(function () {
  this.testData = {
    users: [],
    products: [],
    orders: [],
    generated: [],
    lastResponse: null,
  };

  this.scenarioContext = {
    startTime: Date.now(),
    tags: [],
  };
});

// Log scenario duration after each test
After(function (scenario) {
  const duration = Date.now() - (this.scenarioContext?.startTime || Date.now());
  logger.info(`[World] Scenario duration: ${(duration / 1000).toFixed(2)}s`);
});
