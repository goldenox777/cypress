import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`I click element with identifier {string}`, (string) => {
    cy.get(string).click()
})