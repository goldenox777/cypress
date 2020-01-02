Feature: Feature file example for Cypress and Cucumber

    Clicking around, opening pages etc

    Scenario: Open the page and verify we see something
        Given I open main page
        Then I see element with identifier "#divContainer" visible