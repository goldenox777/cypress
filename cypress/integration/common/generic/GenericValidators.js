import { Given } from "cypress-cucumber-preprocessor/steps"
import { generic } from "../../pageObjects/generic"
import { pageObjectController } from "./PageObjectController"

Given(`I see {string} element present with identifier {string}`, (string1, string2) => {
    cy.get(pageObjectController(string2)).should('be.visible')
})

And(`{string} element matching {string} is present with identifier {string}`, (string1, string2, string3) => {
    cy.get(pageObjectController(string3)).should('have.text', string2)
})

Given(`URL contains string {string}`, (string) => {
    cy.url().should('include', string)
})