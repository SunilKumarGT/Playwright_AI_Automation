const common = `
  --require-module dotenv/config
  --require src/hooks/hooks.js
  --require src/steps/**/*.js
  --require src/support/**/*.js
  --format @cucumber/pretty-formatter
  --format json:reports/cucumber-report.json
  --format html:reports/cucumber-report.html
  --parallel 2
  --retry 1
`;

module.exports = {
  default: `${common} features/**/*.feature`,
  smoke: `${common} features/**/*.feature --tags @smoke`,
  regression: `${common} features/**/*.feature --tags @regression`,
  ai: `${common} features/**/*.feature --tags @ai`,
};
