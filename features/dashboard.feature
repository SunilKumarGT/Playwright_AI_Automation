@dashboard @regression
Feature: Dashboard Functionality
  As a logged-in user
  I want to interact with the dashboard
  So that I can access all application features

  Background:
    Given I am logged in as a test user

  @smoke @positive
  Scenario: Dashboard loads successfully
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @positive
  Scenario: User can navigate to profile
    When I click on "Profile"
    Then the URL should contain "profile"

  @positive
  Scenario: User can search for content
    When I type "test query" into "search"
    And I press "Enter"
    Then the URL should contain "search"

  @positive
  Scenario: User can access settings
    When I click on "Settings"
    Then the URL should contain "settings"

  @ai @smoke
  Scenario: AI validates dashboard content
    Then AI validates the page shows "a logged-in dashboard with user navigation and main content area"

  @ai
  Scenario: AI checks dashboard accessibility
    Then AI checks accessibility of the page
