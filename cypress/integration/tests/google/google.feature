Feature: Feature file example for Cypress and Cucumber

    Clicking around, opening pages etc

    @auto
    Scenario: First scenario of google file
        Given I visit "baseUrl"
        Then "zzz" element with identifier "#mBMHK" should "be.visible"
        When I type "groupon" into field with identifier "[name='q']"
        And I focus on element with id "[name='q']" and press Enter
        Then "Results number" element with identifier "#mBMHK" should "be.visible"

    @auto
    Scenario: This is the second and manual scenario of google file
        Given __I go to the beach__
        Then __There is sand there__
        When __I walk into the sea__
        And __I start swimming__
        And __The sharks don't get me__
        Then __I will survive__