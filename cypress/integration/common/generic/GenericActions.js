import { Given } from "cypress-cucumber-preprocessor/steps"
import { generic } from "../../pageObjects/generic"
import { convertArrayToJson } from "./Helpers"
import { pageObjectController } from "./PageObjectController"

Given(`I click {string} element with identifier {string}`, (unusedString, identifier) => {
    cy.get(pageObjectController(identifier)).click()
})

Given(`I focus on {string} element with id {string} and press Enter`, (unusedString, string) => {
    cy.get(pageObjectController(string)).type('{enter}')
})

Given(`I open {string}`, (string) => {
    if (string == 'baseUrl') {
        cy.visit(generic.baseUrl)
    } else {
        cy.visit(generic.baseUrl + string)
    }
})

Given(`I type into {string} field with identifier {string}`, function (unusedString, identifier, data) {
    cy
        .get(pageObjectController(identifier))
        .type(convertArrayToJson(data.rawTable).text)
})