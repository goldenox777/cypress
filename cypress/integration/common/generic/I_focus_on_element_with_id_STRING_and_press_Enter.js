import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`I focus on element with id {string} and press Enter`, (string1) => {
    cy.get(string1).type('{enter}')
})