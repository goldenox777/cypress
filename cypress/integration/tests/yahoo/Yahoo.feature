Feature: Yahoo __ audit _ AuditManual

Yahoo mail tests

@auto
@tc:1622
@updated:false
Scenario: 1622- Elements presence on the yahoo page
Given I visit "baseUrl"
Then I see "Email address" element with identifier "#login-username" present
And I see "Next button" element with identifier "#login-signin" present
And I see "Stay signed in checkbox" element with identifier "[class='stay-signed-in checkbox-container']" present
And I see "Forgot username" element with identifier "[class='helper-item arlink']" present
And I see "Create an account" element with identifier "#createacc" present

@auto
@tc:1623
@updated:false
Scenario: 1623- Email validation
Given I visit "baseUrl"
And I click "Next button" element with identifier "#login-signin"
Then I see "Error message" element with identifier "#username-error" present

@auto
@tc:1624
@updated:false
Scenario: 1624- This will be a failing Scenario
Given I visit "baseUrl"
And I click "Non existing" element with identifier "#nonexisting"
Then I see "nothing" element with identifier "#nothing" present