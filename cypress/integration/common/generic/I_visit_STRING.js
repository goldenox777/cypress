import { Given } from "cypress-cucumber-preprocessor/steps"
import generic from "../../pageObjects/generic"
import { pageObjectController } from "../../common/generic/PageObjectController"

Given(`I visit {string}`, (string) => {
    if (string == 'baseUrl') {
        cy.visit(generic.baseUrl)
    } else {
        cy.visit(generic.baseUrl + string)
    }
})