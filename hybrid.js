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

var timerStart = Date.now()

function updateCase(number, json) {
    return new Promise((resolve, reject) => {
        testrail.updateCase(number, json, function (err, response, testcase) {
            if (err) {
                reject(err);
                return;
            }

            resolve(testcase);
        })
    });
}

function getCases() {
    testrail.getCases(/*PROJECT_ID=*/1, /*FILTERS=*/{ suite_id: 1 }, function (err, response, cases) {
        return cases
    });
}

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

var filesIndex = files(testFilesRoot)

testrail.getCases(/*PROJECT_ID=*/1, /*FILTERS=*/{ suite_id: 1 }, function (err, response, cases) {
    indexLocalFileContents(cases)
    // console.log(cases)
});

async function indexLocalFileContents(casesFromApi) {
    for (const file of filesIndex) {
        if (file.includes('.feature')) {
            var doesItNeedUpdate
            var fileContents = fs.readFileSync(file, 'utf8')
            var fileStats = fs.statSync(file)
            var fileLastModifiedDate = fileStats.mtime
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
                            if (scenario.includes('@auto') || scenario.includes('@manual')) {
                                console.log('\x1b[32m', 'Synchronizing ' + stringInScenario)
                            }

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
                        doesItNeedUpdate = true
                        const testCaseResponse = await addCase(jsonBody);
                        await updateCase(testCaseResponse.id, {
                            title: testCaseResponse.id + "- " + testCaseResponse.title
                        })
                        var apiId = testCaseResponse.id
                        scenarioContentsSplit.splice(1, 0, "@tc:" + apiId)
                        scenarioContentsSplit.splice(2, 0, "@updated:false")
                        console.log('\x1b[37m', 'Assigned ID: ' + apiId)
                        var index = 0
                        for (const string of scenarioContentsSplit) {
                            if (string.includes('Scenario:')) {
                                scenarioContentsSplit[index] = string.split(':')[0] + ': ' + apiId + '-' + string.split(':')[1]
                            }
                            index++
                        }
                    } else {
                        if (scenario.includes('@updated:true')) {
                            console.log(scenarioContentsSplit[1].split(':')[1])
                            testrail.updateCase(scenarioContentsSplit[1].split(':')[1], jsonBody)
                            scenarioContentsSplit[2] = "@updated:false"
                            doesItNeedUpdate = true
                        }
                    }
                }

                var givenStep = false
                var thenStep = false
                var whenStep = false
                var constructedStepTracker = -1

                var reconstructedScenarioArray = []
                for (const line of scenarioContentsSplit) {
                    reconstructedScenarioArray.push(line.trim())
                }

                var reconstructedScenario = reconstructedScenarioArray.join("\r\n")
                reconstructedFileArray.push(reconstructedScenario)
            }
            var reconstructedFile = reconstructedFileArray.join('\r\n\r\n')

            if (doesItNeedUpdate == true) {
                console.log('Rewriting file: ' + file)
                writeToFile(file, reconstructedFile)
                doesItNeedUpdate = false
            }


        }
    }
    var endTimer = Date.now() - timerStart
    console.log('This synchronization took: ', "\x1b[31m", " " + millisToMinutesAndSeconds(endTimer))
}

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
}