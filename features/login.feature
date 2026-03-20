@login @smoke
Feature: User Authentication
  As a registered user
  I want to be able to log in to the application
  So that I can access my account and features

  Background:
    Given I am on the login page

  @positive @regression
  Scenario: Successful login with valid credentials
    When I submit the login form with "test@example.com" and "TestPassword123!"
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @negative @regression
  Scenario Outline: Failed login with invalid credentials
    When I submit the login form with "<email>" and "<password>"
    Then I should see an error message "<error_message>"
    And I should remain on the login page

    Examples:
      | email                | password      | error_message        |
      | wrong@email.com      | ValidPass123! | Invalid credentials  |
      | test@example.com     | wrongpassword | Invalid credentials  |
      | notanemail           | password123   | Invalid email        |
      |                      | password123   | Email is required    |
      | test@example.com     |               | Password is required |

  @positive
  Scenario: Login with Remember Me option
    When I check the Remember Me checkbox
    And I submit the login form with "test@example.com" and "TestPassword123!"
    Then I should be redirected to the dashboard

  @positive
  Scenario: Successful logout
    Given I am logged in as "test@example.com" with password "TestPassword123!"
    When I log out
    Then I should be on the login page

  @positive
  Scenario: Forgot Password navigation
    When I click forgot password
    Then I should see the forgot password page

  @ai @smoke
  Scenario: AI-powered login page validation
    When AI validates the login page is correct
    And I submit the login form with "test@example.com" and "TestPassword123!"
    Then AI confirms login was successful

  @ai
  Scenario: Login with AI-generated test data
    Given AI generates test user data
    When AI validates the login page is correct
    Then I should see "email" 
    And I should see "password"
