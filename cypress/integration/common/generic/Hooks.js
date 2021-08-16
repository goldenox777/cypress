import { After, Before } from "cypress-cucumber-preprocessor/steps"
var helpers = require("./Helpers")

var arrayOfTests = []

// After(() => {
//     var runID = Cypress.env('RUN_ID')
//     Cypress.on('test:after:run', (attributes, test) => {
//         var error;
//         if (attributes.err == undefined) {
//             error = 'No errors.'
//         } else {
//             error = attributes.err
//         }

//         var obj = {
//             runID: runID,
//             title: attributes.title,
//             status: attributes.state,
//             duration: attributes.duration,
//             date: Date.now(),
//             err: error
//         }

//         if (arrayOfTests.length == 0) {
//             helpers.apiCall("entry", JSON.stringify(obj))
//             arrayOfTests.push(attributes.title)
//         } else {
//             if (arrayOfTests.indexOf(attributes.title) == -1) {
//                 arrayOfTests.push(attributes.title)
//                 helpers.apiCall("entry", JSON.stringify(obj))
//             }
//         }
//     })
// })