Feature: Feature file example for Cypress and Cucumber

    Clicking around, opening pages etc

    @auto
    Scenario: Open the baseUrl and verify Email field is present
        Given I visit "baseUrl"
        Then I see element "Email or phone" with identifier "#identifierId" "be.visible"


