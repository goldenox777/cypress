var Testrail = require('testrail-api');
var fs = require('fs');
var request = require('request');

const util = require('util');
const newline = require('newline')

var testFilesRoot = 'cypress/integration/tests'

var testrail = new Testrail({
    host: 'https://goldenox777.testrail.io/',
    user: 'goldenox777@gmail.com',
    password: '0ZioRu19JepbNTIPi/oa-dOIjuJPtJofdu8bFJ9KE'
});


// testrail.getCases(1)
//     .then(function (result) {
//     }).catch(function (error) {
//     });



function updateCase(json, number) {
    testrail.updateCase(number, json, function (err, response, testcase) {
    })
}

function getCases() {
    testrail.getCases(/*PROJECT_ID=*/1, /*FILTERS=*/{ suite_id: 1 }, function (err, response, cases) {
        return cases
    });
}

// writeToFile('kukuruz.feature', 'one\n\rtwo\n\rthree')


// const auth = process.env.USRKEY
// const testFolder = process.env.TSTFOLDER

function addCase(json) {
    return new Promise((resolve, reject) => {
        testrail.addCase(/*SECTION_ID=*/1, /*CONTENT=*/json, function (err, response, testcase) {
            if (err) {
                reject(err);
                return;
            }

            resolve(testcase);
        })
    });
}

function writeToFile(filename, data) {
    fs.writeFileSync(filename, data, function (err) {
        if (err) return console.log(err);
        // console.log('File ' + filename + ' rewritten');
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

var filesIndex = files(testFilesRoot)

testrail.getCases(/*PROJECT_ID=*/1, /*FILTERS=*/{ suite_id: 1 }, function (err, response, cases) {
    indexLocalFileContents(cases)
});

async function indexLocalFileContents(casesFromApi) {

    for (const file of filesIndex) {
        var reconstructedFileArray = []
        if (file.includes('.feature')) {

            var fileContents = fs.readFileSync(file, 'utf8')
            fileContents = fileContents.replace(/(\r\n|\n|\r)/gm, '\r\n')
            var fileContentsSplit = fileContents.split('\r\n\r\n')
            var reconstructedFileArray = []
            for (const scenario of fileContentsSplit) {

                var scenarioContentsSplit = scenario.split('\r\n')

                var givenStep = false
                var thenStep = false
                var whenStep = false

                var jsonBody = {}
                jsonBody.type_id = 1
                jsonBody.priority_id = 3
                jsonBody.template_id = 2
                jsonBody.custom_steps_separated = []
                var constructedStepTracker = -1

                for (const stringInScenario of scenarioContentsSplit) {
                    if (stringInScenario.includes('Given ') || stringInScenario.includes('When ') || stringInScenario.includes('Then ') || stringInScenario.includes('And ') || stringInScenario.includes('Scenario: ')) {
                        jsonBody.custom_steps_separated.push({})
                        if (stringInScenario.includes('Scenario:')) {
                            jsonBody.title = stringInScenario.split('Scenario:')[1]
                        } else if (stringInScenario.includes('Given ')) {
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].content = stringInScenario
                            givenStep = true
                        } else if (stringInScenario.includes('And ') && givenStep == true) {
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].content = stringInScenario
                        } else if (stringInScenario.includes('Then ') && givenStep == true) {
                            jsonBody.custom_steps_separated[constructedStepTracker].expected = stringInScenario
                            givenStep = false
                            thenStep = true
                        } else if (stringInScenario.includes('And ') && thenStep == true && whenStep == false) {
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].expected = stringInScenario
                        } else if (stringInScenario.includes('When ')) {
                            thenStep == false
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].content = stringInScenario
                            whenStep = true
                        } else if (stringInScenario.includes('And ') && whenStep == true) {
                            constructedStepTracker++
                            jsonBody.custom_steps_separated[constructedStepTracker].content = stringInScenario
                        } else if (stringInScenario.includes('Then ') && whenStep == true) {
                            jsonBody.custom_steps_separated[constructedStepTracker].expected = stringInScenario
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

                if (scenario.toString().includes('@auto') || scenario.toString().includes('@manual')) {
                    var doesTestCaseHaveAConnectedTC = scenarioContentsSplit[1].includes('@tc:')
                    if (!doesTestCaseHaveAConnectedTC) {
                        // const testCaseResponse = await addCase(jsonBody);
                        var apiId = 500
                        scenarioContentsSplit.splice(1, 0, "@tc:" + apiId)
                    }
                    // const testCaseResponse = await addCase(jsonBody);
                }

                var givenStep = false
                var thenStep = false
                var whenStep = false
                var constructedStepTracker = -1

                console.log(scenarioContentsSplit)
            }
        }
    }
}
