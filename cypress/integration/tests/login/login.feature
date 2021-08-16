Feature: login:Login.feature

    Login page tests

    @auto
    Scenario: 1- Validate that the GOP logo is present on the login page
        Given I open "baseUrl"
        Then I see "Game of pods logo" element present with identifier "login.gopLogo"

    @auto
    Scenario: 2- Clicking Login without filling out email and password display validation messages
        Given I open "baseUrl"
        And I click "Log in button" element with identifier "login.logIn"
        Then "Error message" element matching "Invalid username or password. Please try again" is present with identifier "login.errorMessage"

    @auto
    @fail
    Scenario: 3- test
        Given I open "baseUrl"
        And I type into "Email" field with identifier "login.username"
            | text | This is a text |
        Then I see "Nonexisting button" element present with identifier "login.nonexisting"