import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`I see {string} element with identifier {string} present`, (string1, string2) => {
    cy.get(string2).should('be.visible')
})