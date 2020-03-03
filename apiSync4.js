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

function addCase(object) {
    testrail.addCase(/*SECTION_ID=*/1, /*CONTENT=*/object.json, function (err, response, testcase) {
        var array = object.fileTurnedIntoArray
        array[object.tagIndex] = "@auto\r\n@tc:" + testcase.id
        var rewrittenFile = array.join('\r\n')
        writeToFile(object.currentFile, rewrittenFile)
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

function indexLocalFileContents(casesFromApi) {

    for (const file of filesIndex) {
        var fileContentsObject = []
        if (file.includes('.feature')) {

            var fileContents = fs.readFileSync(file, 'utf8')
            fileContents = fileContents.replace(/(\r\n|\n|\r)/gm, '\r\n')
            var fileContentsSplit = fileContents.split('\r\n\r\n')
            console.log(fileContents)
            console.log('///')
            fileContentsSplit.shift()
            fileContentsSplit.shift()
            var scenarioIndex = -1

            for (const scenario of fileContentsSplit) {

                var updatedFileContents = fs.readFileSync(file, 'utf8')

                updatedFileContents = updatedFileContents.replace(/(\r\n|\n|\r)/gm, '\r\n')
                var updatedFileTurnedIntoArray = updatedFileContents.split('\r\n')

                var scenarioContentsSplit = scenario.split('\r\n')
                if (!scenarioContentsSplit[0].includes('Background: Reset rate limit')) {
                    var tagIndex = []

                    var loopIndex = 0
                    for (const entry of updatedFileTurnedIntoArray) {
                        if (entry.includes('@auto') || entry.includes('@manual')) {
                            tagIndex.push(loopIndex)
                        }
                        loopIndex++
                    }
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
                    var testId
                    for (const entry of scenarioContentsSplit) {
                        if (entry.includes('@tc:')) {
                            testId = parseInt(entry.split(':')[1])
                        } else {
                            testId = false
                        }
                    }


                    for (var k = 0; k < jsonBody.custom_steps_separated.length; k++) {
                        if (Object.keys(jsonBody.custom_steps_separated[k]).length == 0) {
                            jsonBody.custom_steps_separated.splice(k, k + 1)
                        }
                    }
                    scenarioIndex++

                    var givenStep = false
                    var thenStep = false
                    var whenStep = false
                    var constructedStepTracker = -1
                    fileContentsObject.push({
                        tagIndex: tagIndex[scenarioIndex],
                        scenarioIndex: scenarioIndex,
                        currentFile: file,
                        json: jsonBody,
                        testId: testId,
                        fileTurnedIntoArray: updatedFileTurnedIntoArray
                    })
                    if (casesFromApi.length != 0) {
                        if (fileContentsObject[scenarioIndex].testId == false) {
                            addCase(fileContentsObject[scenarioIndex])
                        } else {
                            var caseExists
                            for (var a = 0; a < casesFromApi.length; a++) {
                                if (fileContentsObject[scenarioIndex].testId == casesFromApi[a].id) {
                                    caseExists = true
                                } else {
                                    caseExists = false
                                }
                            }
                            if (caseExists == false) {
                                addCase(fileContentsObject[scenarioIndex])
                            }
                        }
                    } else if (casesFromApi.length == 0) {
                        addCase(fileContentsObject[scenarioIndex])
                    }

                }
            }

        }

    }

}
