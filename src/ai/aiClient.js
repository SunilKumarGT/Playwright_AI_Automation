require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../support/logger');

/**
 * AI Client - Integrates Anthropic Claude into test automation
 * Provides intelligent test generation, self-healing, and analysis
 */
class AIClient {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.AI_MODEL || 'claude-opus-4-5';
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 4096;
  }

  /**
   * Send a prompt to Claude and get a response
   * @param {string} systemPrompt - System context for the AI
   * @param {string} userPrompt - User message/request
   * @returns {Promise<string>} AI response text
   */
  async ask(systemPrompt, userPrompt) {
    try {
      logger.info(`[AI] Sending request to Claude: ${userPrompt.substring(0, 100)}...`);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const response = message.content[0].text;
      logger.info(`[AI] Response received: ${response.substring(0, 100)}...`);
      return response;
    } catch (error) {
      logger.error(`[AI] Error communicating with Claude: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate test steps from a plain English description
   * @param {string} description - Plain English test description
   * @returns {Promise<string>} Generated Gherkin steps
   */
  async generateTestSteps(description) {
    const systemPrompt = `You are an expert QA automation engineer specializing in Playwright and Cucumber BDD.
Your task is to generate Gherkin feature file content (scenarios with Given/When/Then steps) 
from plain English descriptions. Output only valid Gherkin syntax, no explanations.`;

    const userPrompt = `Generate a Gherkin scenario for: "${description}"
    
Format:
  Scenario: [descriptive name]
    Given [precondition]
    When [action]
    Then [expected result]
    And [additional checks]`;

    return await this.ask(systemPrompt, userPrompt);
  }

  /**
   * Self-heal a broken selector by analyzing the page structure
   * @param {string} brokenSelector - The selector that failed
   * @param {string} pageHTML - Current page HTML snapshot
   * @param {string} elementDescription - What the element is supposed to be
   * @returns {Promise<string>} New working selector
   */
  async healSelector(brokenSelector, pageHTML, elementDescription) {
    const systemPrompt = `You are an expert in CSS selectors and Playwright locators.
Analyze HTML and suggest the best working selector for a broken one.
Output ONLY the selector string, no explanation.`;

    const userPrompt = `The selector "${brokenSelector}" is broken for element: "${elementDescription}".
    
Here is the relevant HTML:
${pageHTML.substring(0, 3000)}

Suggest a better Playwright-compatible selector (prefer: role, text, testid, then CSS).
Output only the selector string.`;

    return await this.ask(systemPrompt, userPrompt);
  }

  /**
   * Analyze a test failure and suggest fixes
   * @param {string} errorMessage - The error from the failed test
   * @param {string} stepDefinition - The step definition code
   * @param {string} screenshot - Base64 screenshot (optional)
   * @returns {Promise<string>} Analysis and fix suggestion
   */
  async analyzeFailure(errorMessage, stepDefinition, context = '') {
    const systemPrompt = `You are a senior QA automation engineer. 
Analyze test failures and provide clear, actionable fixes.
Be concise and specific.`;

    const userPrompt = `Test failure analysis request:

ERROR: ${errorMessage}

STEP CODE:
${stepDefinition}

CONTEXT: ${context}

Please:
1. Identify the root cause
2. Suggest a specific fix
3. Note any related risks`;

    return await this.ask(systemPrompt, userPrompt);
  }

  /**
   * Generate test data using AI
   * @param {string} dataDescription - Description of data needed
   * @param {number} count - Number of records to generate
   * @returns {Promise<Object[]>} Generated test data array
   */
  async generateTestData(dataDescription, count = 5) {
    const systemPrompt = `You are a test data generator. 
Return ONLY valid JSON array, no markdown, no explanation.`;

    const userPrompt = `Generate ${count} realistic test data records for: "${dataDescription}"
Output format: JSON array only. Example: [{"field1": "value1"}, ...]`;

    const response = await this.ask(systemPrompt, userPrompt);
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      logger.error('[AI] Failed to parse test data JSON');
      return [];
    }
  }

  /**
   * Validate page content against expected behavior
   * @param {string} pageContent - Current page text/HTML
   * @param {string} expectedBehavior - What should be on the page
   * @returns {Promise<{valid: boolean, issues: string[]}>}
   */
  async validatePageContent(pageContent, expectedBehavior) {
    const systemPrompt = `You are a QA validator. Analyze page content against expected behavior.
Return ONLY valid JSON: {"valid": boolean, "issues": ["issue1", "issue2"], "confidence": 0-100}`;

    const userPrompt = `Expected behavior: "${expectedBehavior}"

Page content:
${pageContent.substring(0, 2000)}

Does the page match the expected behavior? Return JSON only.`;

    const response = await this.ask(systemPrompt, userPrompt);
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { valid: false, issues: ['Parse error'] };
    } catch {
      return { valid: false, issues: ['Failed to parse AI response'] };
    }
  }

  /**
   * Generate accessibility test assertions
   * @param {string} pageHTML - Page HTML content
   * @returns {Promise<string[]>} List of accessibility checks to perform
   */
  async generateAccessibilityChecks(pageHTML) {
    const systemPrompt = `You are an accessibility expert (WCAG 2.1 AA).
Analyze HTML and list specific Playwright accessibility assertions.
Return ONLY a JSON array of check descriptions.`;

    const userPrompt = `Identify accessibility issues to test in this HTML:
${pageHTML.substring(0, 2000)}

Return JSON array: ["check1", "check2", ...]`;

    const response = await this.ask(systemPrompt, userPrompt);
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  }
}

module.exports = new AIClient();
