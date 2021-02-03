Feature: yahoo:Yahoo.feature

    Yahoo mail tests

    @auto
    @tc:1
    @updated:true
    Scenario: 1- Check that the logo element is present
        Given I visit "baseUrl"
        Then I see "Logo" element with identifier ".logo" present

    @auto
    @tc:2
    @updated:true
    Scenario: 2- Clicking Simple Testing tab takes me to easy.php
        Given I visit "baseUrl"
        And I click "Simple testing button" element with identifier "[href='/easy.php']"
        Then URL contains string "/easy.php"

    @auto
    @tc:3
    @updated:true
    Scenario: 3- Starting a test displays the Test... message
        Given I visit "baseUrl"
        And I type "google.com" into field with identifier "#url"
        And I click "Start test button" element with identifier "#start_test-container button"
        Then I see "Testing..." element with identifier "#runningHeader h3" present

    @auto
    @tc:4
    @updated:true
    Scenario: 4- Clicking cancel displays the Sorry message
        Given I visit "baseUrl"
        And I type "google.com" into field with identifier "#url"
        And I click "Start test button" element with identifier "#start_test-container button"
        And I click "Cancel Test button" element with identifier "[value='Cancel Test']"
        Then "Sorry message" element matching "Sorry, the test could not be cancelled. It might have already started or been cancelled" is present with identifier "body h3"