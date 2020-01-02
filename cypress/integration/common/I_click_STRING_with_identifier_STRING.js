import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`I click element with identifier {string}`, (string1, string2) => {
    cy.get(string2).click()
})