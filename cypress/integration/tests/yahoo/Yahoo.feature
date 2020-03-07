Feature: Yahoo __ audit _ AuditManual

Yahoo mail tests

@auto
@tc:1381
@updated:false
Scenario: 1381- Visiting the yahoo url should work
Given I visit "baseUrl"
Then URL contains string "login.yahoo.com"

@auto
@tc:1382
@updated:false
Scenario: 1382- Elements presence on the yahoo page
Given I visit "baseUrl"
Then I see "Email address" element with identifier "#login-username" present
And I see "Next button" element with identifier "#login-signin" present
And I see "Stay signed in checkbox" element with identifier "[class='stay-signed-in checkbox-container']" present
And I see "Forgot username" element with identifier "[class='helper-item arlink']" present
And I see "Create an account" element with identifier "#createacc" present

@auto
@tc:1383
@updated:false
Scenario: 1383- Email validation
Given I visit "baseUrl"
And I click "Next button" element with identifier "#login-signin"
Then I see "Error message" element with identifier "#username-error" present

@auto
@tc:1384
@updated:false
Scenario: 1384- This will be a failing Scenario
Given I visit "baseUrl"
And I click "Non existing" element with identifier "#nonexisting"
Then I see "nothing" element with identifier "#nothing" present

@auto
@tc:1386
@updated:false
Scenario: 1386- New scenario that doesn't fit
Given I visit "something odd"
Then I see "nahanahanah" element with identifier "#auuuuu" present
And I focus on element with id "zzzzzzzzzzzzz" and press Enter
And I see "z" element with identifier "x" present
And I see "z" element with identifier "y" present
And I see "z" element with identifier "z" present