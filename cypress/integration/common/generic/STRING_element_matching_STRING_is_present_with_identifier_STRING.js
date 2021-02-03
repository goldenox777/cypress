import { Given } from "cypress-cucumber-preprocessor/steps"

And(`{string} element matching {string} is present with identifier {string}`, (string1, string2, string3) => {
    cy.get(string3).should('have.text', string2)
})