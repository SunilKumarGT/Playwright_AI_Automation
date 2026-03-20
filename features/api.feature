@api @regression
Feature: API Integration Testing
  As a QA engineer
  I want to validate the application's API endpoints
  So that I can ensure backend services work correctly

  @smoke @positive
  Scenario: Validate API health endpoint
    Given I navigate to "/api/health"
    Then I should see "ok"

  @ai
  Scenario: AI generates API test data
    When AI generates test data for "REST API user payloads with name, email, role, and status fields"
    Then AI validates the page shows "API response"

  @positive
  Scenario Outline: API endpoints return correct status
    Given I navigate to "<endpoint>"
    Then the URL should contain "<endpoint>"

    Examples:
      | endpoint    |
      | /api/health |
      | /api/status |
