import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`I type {string} into field with identifier {string}`, (string1, string2) => {
    cy.get(string2).type(string1)
})