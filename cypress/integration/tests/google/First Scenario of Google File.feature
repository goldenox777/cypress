Feature: Feature file example for Cypress and Cucumber

    Clicking around, opening pages etc

    @auto
    Scenario: First scenario of google file
        Given I visit "baseUrlxxx"
        Then "zzz" element with identifier "#mBMHK" should "be.visible"
        When I type "groupon" into field with identifier "[name='q']"
        And I focus on element with id "[name='q']" and press Enter
        Then "Results number" element with identifier "#mBMHK" should "be.visible"

    @auto
    Scenario: Second scenario of google file
        Given I visit "baseUrl"
        And __I click profile button__
        Then __My profile is displayed__
        When __I click the change password button__
        And __I change my password__
        Then __My password is changed__
        And __My old password does not work anymore__

    @auto
    Scenario: Third scenario of google file
        Given I visit "baseUrl"
        And __I click 3rd button__
        Then __3rd profile is displayed__
        When __I click the change 3rd button__
        And __I change my 3rd button__
        Then __My 3rd is changed__
        And __My old 3rd does not work anymore__