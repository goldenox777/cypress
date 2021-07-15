import { Given } from "cypress-cucumber-preprocessor/steps"
import { pageObjectController } from "./PageObjectController"

Given(`I click {string} element`, (string) => {
    cy.get(pageObjectController(string)).click()
})