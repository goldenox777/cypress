import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`I see element with identifier {string} visible`, (string1, string2) => {
    cy.get(string1).should('be.visible')
})