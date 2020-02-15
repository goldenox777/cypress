import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`{string} element with identifier {string} should {string}`, (string1, string2, string3) => {
    cy.get(string2).should(string3)
})