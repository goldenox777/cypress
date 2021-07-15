import { Given } from "cypress-cucumber-preprocessor/steps"
import { pageObjectController } from "./PageObjectController"

Given(`I type {string} into field {string}`, (string1, string2) => {
    cy.get(pageObjectController(string2)).type(string1)
})