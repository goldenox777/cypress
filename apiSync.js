var Testrail = require('testrail-api');
var fs = require('fs');
var request = require('request');
var fileContentsArray = []
const util = require('util');
const readFile = util.promisify(fs.readFile);
var testFilesRoot = 'cypress/integration/tests'

var testrail = new Testrail({
    host: 'https://goldenox777.testrail.io/',
    user: 'goldenox777@gmail.com',
    password: '0ZioRu19JepbNTIPi/oa-dOIjuJPtJofdu8bFJ9KE'
});


// testrail.getCases(1)
//     .then(function (result) {
//         // console.log(result.body);
//     }).catch(function (error) {
//         console.log('error', error.message);
//     });

function addCase(json) {
    testrail.addCase(/*SECTION_ID=*/1, /*CONTENT=*/json, function (err, response, testcase) {
        console.log(testcase);
    });
}

function updateCase(json, number) {
    testrail.updateCase(number, json, function (err, response, testcase) {
        console.log(testcase);
    })
}





// const auth = process.env.USRKEY
// const testFolder = process.env.TSTFOLDER

function writeToFile(filename, data) {
    fs.writeFile(testFilesRoot + ' / ' + filename, data, function (err) {
        if (err) return console.log(err);
        console.log('File ' + filename + ' rewritten');
    });
}


var files = function (dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            /* Recurse into a subdirectory */
            results = results.concat(files(file));
        } else {
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}

var filesIndex = files('cypress/integration/tests')
for (var i = 0; i < filesIndex.length; i++) {
    if (filesIndex[i].includes('.feature')) {
        getContentsOfFile(files('cypress/integration/tests')[i]).then(data => {
            var jsonBody = {}
            jsonBody.type_id = 1
            jsonBody.priority_id = 3
            jsonBody.template_id = 2
            jsonBody.custom_steps_separated = []
            var fileContentsSplit = data.split('\r\n\r\n')
            fileContentsSplit.shift()
            fileContentsSplit.shift()
            var givenStep = false
            var thenStep = false
            var whenStep = false
            var constructedStepTracker = -1

            for (var ii = 0; ii < fileContentsSplit.length; ii++) {
                var scenarioContentsSplit = fileContentsSplit[ii].split('\r\n')
                for (var j = 0; j < scenarioContentsSplit.length; j++) {
                    if (scenarioContentsSplit[j].includes('Given ') || scenarioContentsSplit[j].includes('When ') || scenarioContentsSplit[j].includes('Then ') || scenarioContentsSplit[j].includes('And ') || scenarioContentsSplit[j].includes('Scenario: ')) {
                        jsonBody.custom_steps_separated.push({})
                        if (scenarioContentsSplit[j].includes('Scenario:')) {
                            jsonBody.title = scenarioContentsSplit[j].split('Scenario:')[1]
                        } else if (scenarioContentsSplit[j].includes('Given ')) {
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].content = scenarioContentsSplit[j]
                            givenStep = true
                        } else if (scenarioContentsSplit[j].includes('And ') && givenStep == true) {
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].content = scenarioContentsSplit[j]
                        } else if (scenarioContentsSplit[j].includes('Then ') && givenStep == true) {
                            jsonBody.custom_steps_separated[constructedStepTracker].expected = scenarioContentsSplit[j]
                            givenStep = false
                            thenStep = true
                        } else if (scenarioContentsSplit[j].includes('And ') && thenStep == true && whenStep == false) {
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].expected = scenarioContentsSplit[j]
                        } else if (scenarioContentsSplit[j].includes('When ')) {
                            thenStep == false
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].content = scenarioContentsSplit[j]
                            whenStep = true
                        } else if (scenarioContentsSplit[j].includes('And ') && whenStep == true) {
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].content = scenarioContentsSplit[j]
                        } else if (scenarioContentsSplit[j].includes('Then ') && whenStep == true) {
                            jsonBody.custom_steps_separated[constructedStepTracker].expected = scenarioContentsSplit[j]
                            thenStep = true
                            whenStep = false
                        }
                    }
                }
                for (var k = 0; k < jsonBody.custom_steps_separated.length; k++) {
                    if (Object.keys(jsonBody.custom_steps_separated[k]).length == 0) {
                        jsonBody.custom_steps_separated.splice(k, k + 1)
                    }
                }
                // addCase(jsonBody)
                jsonBody.custom_steps_separated = []
                var givenStep = false
                var thenStep = false
                var whenStep = false
                var constructedStepTracker = -1
            }
            // updateCase(jsonBody, 7)
        })
    }

}
function getContentsOfFile(file) {
    return readFile(file, 'utf8');
}


// console.log(files('cypress/integration/tests'))
// var numberOfFiles = files('cypress/integration/tests').length
// 

// let goThroughFiles = new Promise((resolve, reject) => {
//     for (var i = 0; i < numberOfFiles; i++) {
//         var currentFile = files('cypress/integration/tests')[i]
//         fs.readFile(currentFile, 'utf8', function (err, data) {
//             if (err) throw err;
//             var splitOn
//             if (currentFile.substring(currentFile.length - 14, currentFile.length) == 'Manual.feature') {
//                 splitOn = '@manual'
//             } else {
//                 splitOn = '@auto'
//             }
//             fileContentsArray.push(data)
//         });
//     }
// })

// goThroughFiles.then(() => {
//     console.log(fileContentsArray)
// })



function runCalls() {
    console.log('Starting runCalls')

    const fs = require('fs');
    const path = require('path');

    function base64_encode(file) {
        var image = fs.readFileSync(file, 'base64')
        return image
    }

    fs.readdir(testFolder, (err, files) => {

        files.forEach(file => {
            if (file.includes('.feature')) {

            }
        });
        // async function hrr() {
        //     var arrayTestIds = []
        //     var arrayTestStatuses = []
        //     var arrayTestFailureMessages = []
        //     var arrayTestFailureImages = []
        //     for (var i = 0; i < passedArray.length; i++) {
        //         arrayTestIds.push(passedArray[i].id)
        //         arrayTestStatuses.push(passedArray[i].status)
        //         arrayTestFailureMessages.push(" ")
        //         arrayTestFailureImages.push(" ")
        //     }
        //     for (var i = 0; i < failedArray.length; i++) {
        //         arrayTestIds.push(failedArray[i].id)
        //         arrayTestStatuses.push(failedArray[i].status)
        //         arrayTestFailureMessages.push(failedArray[i].error)
        //         arrayTestFailureImages.push(base64_encode(failedArray[i].screenshots))
        //     }
        //     var optionsGETpoints = {
        //         'method': 'GET',
        //         'url': 'https://tfs.vitalhealthsoftware.com/tfs/DefaultCollection/PH3/_apis/test/Plans/195354/Suites/228677/points?api-version=5.0',
        //         'headers': {
        //             'Content-Type': 'application/json',
        //             'Authorization': 'Basic ' + auth
        //         }
        //     };

        //     const pointsResponse = await fetch(optionsGETpoints)
        //     var body = `{"plan":{"id":195354},"name": "_tagged:auto", "pointIds": [`
        //     for (var i = 0; i < pointsResponse.count; i++) {
        //         if (i < pointsResponse.count - 1) {
        //             body += pointsResponse.value[i].id + ','
        //         } else {
        //             body += pointsResponse.value[i].id
        //         }

        //     }
        //     body += `]}`
        //     //POST to RUNS with points to include tests in the run
        //     var optionsPOSTruns = {
        //         'method': 'POST',
        //         'url': 'https://tfs.vitalhealthsoftware.com/tfs/DefaultCollection/PH3/_apis/test/runs?api-version=5.0',
        //         'headers': {
        //             'Content-Type': 'application/json',
        //             'Authorization': 'Basic ' + auth
        //         },
        //         'body': body,
        //     }
        //     const runResponse = await fetch(optionsPOSTruns)
        //     //get points again for the last created run
        //     const latestPointsResponse = await fetch(optionsGETpoints)
        //     //PATCH results to the run that was just created
        //     var newBody = `[`

        //     for (var i = 0; i < latestPointsResponse.count; i++) {
        //         var indexOfMatchingId = arrayTestIds.indexOf(latestPointsResponse.value[i].testCase.id)
        //         // console.log(latestPointsResponse.value[i].id + ' ' + arrayTestIds[indexOfMatchingId] + ' ' + arrayTestStatuses[indexOfMatchingId] + ' ' + arrayTestFailureMessages[indexOfMatchingId])

        //         if (indexOfMatchingId != -1) {
        //             var sanitizedFailures = arrayTestFailureMessages[indexOfMatchingId].replace(/\"/g, "'")
        //             newBody += '{"testPoint": {"id": ' + latestPointsResponse.value[i].id + '},"id": "' + latestPointsResponse.value[i].lastResult.id + '","priority": 2,"outcome": "' + arrayTestStatuses[indexOfMatchingId] + '","state": "Completed","testCase": {"id": ' + arrayTestIds[indexOfMatchingId] + '}, "comment":"' + sanitizedFailures + '"},'
        //         }
        //     }
        //     newBody = newBody.substring(0, newBody.length - 1)
        //     newBody += `]`
        //     var optionsPATCHResults = {
        //         'method': 'PATCH',
        //         'url': 'https://tfs.vitalhealthsoftware.com/tfs/DefaultCollection/PH3/_apis/test/Runs/' + runResponse.id + '/results?api-version=5.0',
        //         'headers': {
        //             'Content-Type': 'application/json',
        //             'Authorization': 'Basic ' + auth
        //         },
        //         'body': newBody
        //     }
        //     // console.log(arrayTestFailureImages[1])
        //     await fetch(optionsPATCHResults)


        //     var newBody = `{"state": "completed"}`
        //     var optionsPATCHRunState = {
        //         'method': 'PATCH',
        //         'url': 'https://tfs.vitalhealthsoftware.com/tfs/DefaultCollection/PH3/_apis/test/Runs/' + runResponse.id + '?api-version=5.0',
        //         'headers': {
        //             'Content-Type': 'application/json',
        //             'Authorization': 'Basic ' + auth
        //         },
        //         'body': newBody
        //     }
        //     await fetch(optionsPATCHRunState)
        //     //for some reason the first optionsPATCHRunState will set the status to aborted, the below one gets the job done
        //     await fetch(optionsPATCHRunState)

        //     const pointsResponse2 = await fetch(optionsGETpoints)

        //     for (var i = 0; i < pointsResponse2.count; i++) {
        //         if (pointsResponse2.value[i].outcome == 'Failed' && arrayTestIds.indexOf(pointsResponse2.value[i].testCase.id) != -1) {
        //             var indexOfMatchingId = arrayTestIds.indexOf(pointsResponse2.value[i].testCase.id)
        //             var streamBody = '{"stream": "' + arrayTestFailureImages[indexOfMatchingId] + '","fileName": "failure.png","comment": "Failure screenshot","attachmentType":"GeneralAttachment"}'
        //             var optionsPOSTattachments = {
        //                 'method': 'POST',
        //                 'url': 'https://tfs.vitalhealthsoftware.com/tfs/DefaultCollection/PH3/_apis/test/Runs/' + runResponse.id + '/Results/' + pointsResponse2.value[i].lastResult.id + '/attachments?api-version=5.0-preview.1',
        //                 'headers': {
        //                     'Content-Type': 'application/json',
        //                     'Authorization': 'Basic ' + auth
        //                 },
        //                 'body': streamBody
        //             }
        //             await fetch(optionsPOSTattachments)
        //         }
        //     }
        // }

    })

}

// runCalls()