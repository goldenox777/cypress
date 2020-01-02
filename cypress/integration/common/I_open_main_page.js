import { Given } from "cypress-cucumber-preprocessor/steps"

Given(`I open main page`, (string) => {
    cy.visit("https://aeontarrenmill.github.io/")
})