Feature: Feature file example for Cypress and Cucumber

    Clicking around, opening pages etc

    @auto
    Scenario: Open the page and verify we see something
        Given I open main page
        Then I see element with identifier "#divContainer" visible

    @manual
    Scenario: This is a test to ignore by Cypress
        Given __Hello world__
        Then __Hi back at ya__

    @auto
    Scenario: This is a failing test
        Given I open main page
        Then I see element with identifier "#zxczxc" visible