Feature: Feature file example for Cypress and Cucumber

    Clicking around, opening pages etc

    @auto
    Scenario: Open the baseUrl and verify elements are present
        Given I visit "baseUrl"
        Then "Google logo" element with identifier "#hplogo" should "be.visible"
        And "Search box" element with identifier "[name='q']" should "be.visible"

    @auto
    Scenario: I search for something that will fail
        Given I visit "baseUrl"
        And I type "groupon" into field with identifier "[name='q']"
        And I click element with identifier "[name='btnK']"
        Then "Results number" element with identifier "#mBMHK" should "be.visible"

    @auto
    Scenario: I search for something that will pass
        Given I visit "baseUrl"
        And I type "groupon" into field with identifier "[name='q']"
        And I focus on element with id "[name='q']" and press Enter
        Then "Results number" element with identifier "#mBMHK" should "be.visible"