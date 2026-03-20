# 🤖 Playwright + Cucumber + AI Test Automation Framework

A production-ready test automation framework combining **Playwright**, **Cucumber BDD**, and **Anthropic Claude AI** for intelligent, self-healing, and AI-assisted testing.

---

## 🏗️ Architecture Overview

```
playwright-cucumber-ai/
├── config/
│   └── playwright.config.js       # Browser & Playwright settings
├── features/
│   ├── login.feature              # Login BDD scenarios
│   ├── dashboard.feature          # Dashboard scenarios
│   ├── api.feature                # API test scenarios
│   └── ai_capabilities.feature    # AI-specific scenarios
├── src/
│   ├── ai/
│   │   ├── aiClient.js            # Anthropic Claude API client
│   │   ├── selfHealingLocator.js  # AI-powered self-healing selectors
│   │   ├── testGenerator.js       # AI test & data generator
│   │   └── testAnalyzer.js        # AI post-run result analysis
│   ├── hooks/
│   │   └── hooks.js               # Cucumber Before/After hooks
│   ├── pages/
│   │   ├── BasePage.js            # Base POM class
│   │   ├── LoginPage.js           # Login page object
│   │   └── DashboardPage.js       # Dashboard page object
│   ├── steps/
│   │   ├── commonSteps.js         # Reusable step definitions
│   │   ├── loginSteps.js          # Login-specific steps
│   │   └── apiSteps.js            # API testing steps
│   └── support/
│       ├── constants.js           # Test constants
│       ├── helpers.js             # Test utility helpers
│       ├── logger.js              # Winston logger
│       ├── reporter.js            # HTML report generator
│       └── world.js               # Cucumber World setup
├── .env.example                   # Environment variable template
├── cucumber.js                    # Cucumber configuration
└── package.json
```

---

## ✨ Key Features

### 🎭 Playwright Integration
- Multi-browser support: **Chromium, Firefox, WebKit**
- Parallel test execution
- Screenshot, video & trace capture on failure
- Network interception and API testing
- Auto-wait and smart locators

### 🥒 Cucumber BDD
- Gherkin feature files with full Given/When/Then support
- Scenario Outlines with data tables
- Tag-based test filtering (`@smoke`, `@regression`, `@ai`)
- Rich HTML reports with screenshots
- Retry logic for flaky tests

### 🤖 AI Capabilities (Claude-Powered)
| Feature | Description |
|---------|-------------|
| **Self-Healing Locators** | AI automatically fixes broken CSS/XPath selectors |
| **Failure Analysis** | AI explains why tests failed with actionable fixes |
| **Test Data Generation** | Generate realistic test data from plain descriptions |
| **Page Validation** | AI validates page content against expected behavior |
| **Test Generation** | Generate feature files, steps & page objects from descriptions |
| **Accessibility Audit** | AI-generated WCAG accessibility check suggestions |
| **Run Analysis** | Post-run AI insights, root cause patterns & recommendations |

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Anthropic API key (for AI features)

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values:
# - BASE_URL: Your application URL
# - ANTHROPIC_API_KEY: Your Claude API key
# - TEST_USER_EMAIL / TEST_USER_PASSWORD
```

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run specific tag
npm run test:tag -- --tags @smoke
npm run test:tag -- --tags @regression
npm run test:tag -- --tags @ai

# Run in headed mode (see browser)
npm run test:headed

# Run only AI-powered tests
npm run test:ai

# Generate HTML report
npm run report

# Clean reports
npm run clean
```

---

## 🤖 AI Features Guide

### Self-Healing Locators
Locators automatically heal when selectors break due to UI changes:
```javascript
// In your steps, use the healer:
const element = await this.healer.findElement(
  '[data-testid="submit-btn"]',  // original selector
  'Submit button'                  // description for AI context
);
```

### AI Step Definitions (in your feature files)
```gherkin
# Validate page with AI
Then AI validates the page shows "a checkout form with items and total"

# Generate test data with AI
When AI generates test data for "product orders with SKU, quantity, price"

# AI accessibility audit
Then AI checks accessibility of the page

# AI validates login page structure
When AI validates the login page is correct
```

### AI Test Generator (programmatic use)
```javascript
const generator = require('./src/ai/testGenerator');

// Generate a feature file
await generator.generateFeatureFile('Shopping Cart', 
  'E-commerce cart functionality',
  ['Add item to cart', 'Remove item', 'Apply coupon', 'Checkout']
);

// Generate test data
const users = await generator.generateTestData('user profiles', 10);

// Generate page object
await generator.generatePageObject('Checkout', 
  'The checkout page',
  ['Cart items list', 'Order total', 'Payment form', 'Place order button']
);
```

### Post-Run AI Analysis
```javascript
const analyzer = require('./src/ai/testAnalyzer');
await analyzer.analyze(); // Generates reports/ai-analysis.md
```

---

## 📊 Reports

After a test run:
- **JSON Report**: `reports/cucumber-report.json`
- **HTML Report**: `reports/html/index.html` (run `npm run report`)
- **AI Analysis**: `reports/ai-analysis.md`
- **Screenshots**: `reports/screenshots/`
- **Videos**: `test-results/videos/`
- **Logs**: `reports/logs/test-run.log`

---

## 🔧 Adding New Tests

### 1. Create a Feature File
```gherkin
# features/my-feature.feature
@myfeature @smoke
Feature: My New Feature
  Scenario: Happy path
    Given I am on the login page
    When I submit the login form with "user@test.com" and "Pass123!"
    Then I should be redirected to the dashboard
    And AI validates the page shows "user dashboard"
```

### 2. Create a Page Object
```javascript
// src/pages/MyPage.js
const BasePage = require('./BasePage');

class MyPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      myButton: '[data-testid="my-btn"]',
    };
  }
  async clickMyButton() {
    await this.click(this.selectors.myButton);
  }
}
module.exports = MyPage;
```

### 3. Add Step Definitions
```javascript
// src/steps/mySteps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const MyPage = require('../pages/MyPage');

When('I click my button', async function () {
  const page = new MyPage(this.page);
  await page.clickMyButton();
});
```

---

## 🏷️ Available Tags

| Tag | Description |
|-----|-------------|
| `@smoke` | Critical smoke tests |
| `@regression` | Full regression suite |
| `@ai` | AI-powered test scenarios |
| `@positive` | Positive/happy path tests |
| `@negative` | Negative/error path tests |
| `@login` | Login-related tests |
| `@dashboard` | Dashboard-related tests |
| `@api` | API integration tests |

---

## 🤝 Contributing

1. Add new features in `features/`
2. Add page objects in `src/pages/`
3. Add steps in `src/steps/`
4. Tag scenarios appropriately
5. Run `npm test` before committing

---

## 📄 License

MIT License - feel free to use and adapt for your projects.
