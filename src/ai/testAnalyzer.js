const fs = require('fs');
const path = require('path');
const aiClient = require('./aiClient');
const logger = require('../support/logger');

/**
 * AI Test Analyzer
 * Analyzes test results after a run and provides AI-powered insights
 */
class AITestAnalyzer {
  constructor() {
    this.reportPath = path.join(process.cwd(), 'reports', 'cucumber-report.json');
    this.analysisPath = path.join(process.cwd(), 'reports', 'ai-analysis.md');
  }

  /**
   * Load and parse the Cucumber JSON report
   */
  loadReport() {
    if (!fs.existsSync(this.reportPath)) {
      logger.warn('[AIAnalyzer] No cucumber-report.json found. Run tests first.');
      return null;
    }
    const raw = fs.readFileSync(this.reportPath, 'utf8');
    return JSON.parse(raw);
  }

  /**
   * Extract summary statistics from the report
   */
  extractSummary(report) {
    let total = 0, passed = 0, failed = 0, skipped = 0;
    const failedScenarios = [];

    for (const feature of report) {
      for (const element of feature.elements || []) {
        total++;
        const statuses = element.steps.map((s) => s.result?.status);
        if (statuses.includes('failed')) {
          failed++;
          failedScenarios.push({
            feature: feature.name,
            scenario: element.name,
            error: element.steps.find((s) => s.result?.status === 'failed')?.result?.error_message || '',
          });
        } else if (statuses.includes('skipped')) {
          skipped++;
        } else {
          passed++;
        }
      }
    }

    return { total, passed, failed, skipped, failedScenarios };
  }

  /**
   * Run full AI analysis on test results
   */
  async analyze() {
    logger.info('[AIAnalyzer] Starting AI analysis of test results...');

    const report = this.loadReport();
    if (!report) return;

    const summary = this.extractSummary(report);
    const passRate = ((summary.passed / summary.total) * 100).toFixed(1);

    logger.info(`[AIAnalyzer] Summary: ${summary.passed}/${summary.total} passed (${passRate}%)`);

    // Build analysis prompt
    const summaryText = `
Test Run Summary:
- Total Scenarios: ${summary.total}
- Passed: ${summary.passed}
- Failed: ${summary.failed}
- Skipped: ${summary.skipped}
- Pass Rate: ${passRate}%

Failed Scenarios:
${summary.failedScenarios.map((f) => `- [${f.feature}] ${f.scenario}\n  Error: ${f.error.substring(0, 200)}`).join('\n')}
    `;

    const systemPrompt = `You are a senior QA lead analyzing automated test results.
Provide a professional, actionable test run analysis in Markdown format.
Include: executive summary, risk assessment, root cause patterns, and concrete recommendations.`;

    const aiAnalysis = await aiClient.ask(systemPrompt, `Analyze these test results:\n${summaryText}`);

    // Build the markdown report
    const markdownReport = `# 🤖 AI Test Analysis Report
Generated: ${new Date().toLocaleString()}

## 📊 Test Run Summary

| Metric | Value |
|--------|-------|
| Total Scenarios | ${summary.total} |
| ✅ Passed | ${summary.passed} |
| ❌ Failed | ${summary.failed} |
| ⏭️ Skipped | ${summary.skipped} |
| Pass Rate | ${passRate}% |

## 🤖 AI Analysis

${aiAnalysis}

## ❌ Failed Scenarios Detail

${summary.failedScenarios.map((f) => `### ${f.scenario}
- **Feature:** ${f.feature}
- **Error:** \`${f.error.substring(0, 500)}\`
`).join('\n')}

---
*Analysis powered by Claude AI (${process.env.AI_MODEL || 'claude-opus-4-5'})*
`;

    fs.writeFileSync(this.analysisPath, markdownReport);
    logger.info(`[AIAnalyzer] ✅ AI analysis saved to: ${this.analysisPath}`);

    return { summary, aiAnalysis, markdownReport };
  }
}

module.exports = new AITestAnalyzer();
