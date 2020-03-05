Feature: Activate your account __ authentication _ Login _ ActivateYourAccountModal

    Activate your account modal

    Background: Reset rate limit
        Given I run API command for "reset rate limit;nonactivateduser@philips.com"

    @auto
    @tc:694
    Scenario: Logging in with an unactivated user triggers the Activate Your Account modal
        Given I open "baseUrl"
        And I log in with "nonactivateduser@philips.com" user
        Then "Resend activation" element is present with identifier "#user-activation-button"

    @auto
    Scenario: Activate Your Account modal Resend activation link button
        Given I open "baseUrl"
        And I log in with "nonactivateduser@philips.com" user
        And I click "Resend activation link" button with identifier "#user-activation-button"
        Then Notification is displayed
        And "Resend activation link" element with identifier "#user-activation-button" is not present

    @auto
    Scenario: Activate Your Account modal X button
        Given I open "baseUrl"
        And I log in with "nonactivateduser@philips.com" user
        And I click "X" button with identifier "#Dialog-user-activation-CloseButton"
        Then "Resend activation link" element with identifier "#user-activation-button" is not present