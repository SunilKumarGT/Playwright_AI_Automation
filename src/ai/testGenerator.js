const fs = require('fs');
const path = require('path');
const aiClient = require('./aiClient');
const logger = require('../support/logger');

/**
 * AI Test Generator
 * Generates test scenarios, step definitions, and page objects using AI
 */
class AITestGenerator {
  constructor() {
    this.featuresDir = path.join(process.cwd(), 'features');
    this.stepsDir = path.join(process.cwd(), 'src/steps');
    this.pagesDir = path.join(process.cwd(), 'src/pages');
  }

  /**
   * Generate a complete feature file from a description
   * @param {string} featureName - Name of the feature
   * @param {string} description - What to test
   * @param {string[]} scenarios - List of scenario descriptions
   */
  async generateFeatureFile(featureName, description, scenarios = []) {
    const systemPrompt = `You are a senior QA engineer expert in BDD and Gherkin.
Generate complete, realistic Cucumber feature files.
Use descriptive scenario names and clear Given/When/Then/And/But steps.
Include scenario outlines with examples tables where appropriate.
Include tags like @smoke, @regression, @ai.`;

    const userPrompt = `Create a complete Gherkin feature file for:

Feature Name: ${featureName}
Description: ${description}
Scenarios to cover:
${scenarios.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Generate a complete .feature file with Feature description, Background (if needed), 
and all the Scenarios/Scenario Outlines.`;

    const featureContent = await aiClient.ask(systemPrompt, userPrompt);

    const fileName = featureName.toLowerCase().replace(/\s+/g, '_') + '.feature';
    const filePath = path.join(this.featuresDir, fileName);

    fs.writeFileSync(filePath, featureContent);
    logger.info(`[AIGen] Generated feature file: ${fileName}`);

    return { filePath, content: featureContent };
  }

  /**
   * Generate step definitions for a feature file
   * @param {string} featureContent - Content of the feature file
   * @param {string} pageName - Associated page object name
   */
  async generateStepDefinitions(featureContent, pageName) {
    const systemPrompt = `You are a Playwright + Cucumber automation expert.
Generate complete JavaScript step definitions using @cucumber/cucumber.
Use async/await, Playwright best practices, and proper error handling.
Import from the world object for page access.`;

    const userPrompt = `Generate Playwright + Cucumber step definitions for this feature:

${featureContent}

Page Object: ${pageName}Page

Requirements:
- Use const { When, Given, Then } = require('@cucumber/cucumber')
- Access page via this.page or this.context
- Use async/await
- Import page objects properly
- Include proper assertions using expect from @playwright/test
- Handle waits appropriately`;

    const stepsContent = await aiClient.ask(systemPrompt, userPrompt);

    const fileName = pageName.toLowerCase().replace(/\s+/g, '_') + '.steps.js';
    const filePath = path.join(this.stepsDir, 'generated', fileName);

    // Ensure generated directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, stepsContent);
    logger.info(`[AIGen] Generated step definitions: ${fileName}`);

    return { filePath, content: stepsContent };
  }

  /**
   * Generate test data for a specific test context
   */
  async generateTestData(context, count = 5) {
    logger.info(`[AIGen] Generating ${count} test data records for: ${context}`);
    return await aiClient.generateTestData(context, count);
  }

  /**
   * Generate a page object from a URL or HTML
   * @param {string} pageName - Name for the page object class
   * @param {string} pageDescription - Description of the page
   * @param {string[]} elements - Key elements to include
   */
  async generatePageObject(pageName, pageDescription, elements = []) {
    const systemPrompt = `You are a Playwright Page Object Model expert.
Generate clean, maintainable JavaScript Page Object classes.
Follow POM best practices with clear selectors and methods.`;

    const userPrompt = `Generate a Playwright Page Object for:

Page Name: ${pageName}
Description: ${pageDescription}
Key Elements:
${elements.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Requirements:
- Class-based with constructor(page)
- Use meaningful selector names as class properties
- Include action methods (navigate, fill, click, verify)
- Use Playwright best practices (getByRole, getByText, getByTestId)
- Include JSDoc comments`;

    const pageContent = await aiClient.ask(systemPrompt, userPrompt);

    const fileName = pageName.replace(/\s+/g, '') + 'Page.js';
    const filePath = path.join(this.pagesDir, 'generated', fileName);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, pageContent);
    logger.info(`[AIGen] Generated page object: ${fileName}`);

    return { filePath, content: pageContent };
  }
}

module.exports = new AITestGenerator();
