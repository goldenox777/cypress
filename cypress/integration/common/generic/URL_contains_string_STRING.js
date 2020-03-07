import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`URL contains string {string}`, (string) => {
    cy.url().should('include', string)
})