Feature: index:Index.feature

    Index page tests

    @auto
    @updated:true
    Scenario: Check that the logo element is present
        Given I visit "baseUrl"
        Then I see "index.logo" element present

    @auto
    Scenario: Clicking the women button loads women subcategories
        Given I visit "baseUrl"
        And I click "index.women" element
        Then I see "women.subcategories" element present

    @auto
    Scenario: Searching for skirt will return a list with one element
        Given I visit "baseUrl"
        And I type "skirt" into field "index.searchbox"
        And I click "index.submitsearch" element
        Then I see "searchresults.productlist" element present