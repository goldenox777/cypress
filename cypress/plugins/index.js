const cucumber = require('cypress-cucumber-preprocessor').default
var helpers = require('../integration/common/generic/Helpers')

module.exports = (on, config) => {
  on('file:preprocessor', cucumber())

  // on('before:run', () => {
  //   var obj = {
  //     runID: config.env.RUN_ID,
  //     status: "In progress"
  //   }
  //   helpers.apiCall("run", JSON.stringify(obj))
  // })

  // on('after:run', (results) => {
  //   var obj = {
  //     runID: config.env.RUN_ID,
  //     status: "Completed"
  //   }
  //   helpers.apiCall("run", JSON.stringify(obj))
  // })
}