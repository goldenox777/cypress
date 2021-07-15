import { Given } from "cypress-cucumber-preprocessor/steps"
import { pageObjectController } from "./PageObjectController"

Given(`I see {string} element present`, (string) => {
    cy.get(pageObjectController(string)).should('be.visible')
})