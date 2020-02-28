var Testrail = require('testrail-api');
var fs = require('fs');
var request = require('request');

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



function updateCase(json, number) {
    testrail.updateCase(number, json, function (err, response, testcase) {
        console.log(testcase);
    })
}

function getCases() {
    testrail.getCases(/*PROJECT_ID=*/1, /*FILTERS=*/{ suite_id: 1 }, function (err, response, cases) {
        // console.log(cases.length);
    });
}

// writeToFile('kukuruz.feature', 'one\n\rtwo\n\rthree')


// const auth = process.env.USRKEY
// const testFolder = process.env.TSTFOLDER

function addCase(json, currentFileName/*, currentFileContents*/) {
    testrail.addCase(/*SECTION_ID=*/1, /*CONTENT=*/json, function (err, response, testcase) {
        // var rewrittenFile = currentFileContents.replace("@auto", "@auto\n@tc:" + testcase.id)
        // writeToFile(currentFileName, rewrittenFile)
    });
}

function writeToFile(filename, data) {
    fs.writeFile(filename, data, function (err) {
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
var morti = 0
indexLocalFileContents()
async function indexLocalFileContents() {
    var fileContentsObject = []
    // for (const file of filesIndex) {
    //     if (file.includes('.feature')) {
    //         file.type_id
    //     }
    // }

    for (var i = 0; i < filesIndex.length; i++) {
        if (filesIndex[i].includes('.feature')) {
            var currentFile = files(testFilesRoot)[i]
            await getContentsOfFile(currentFile).then(data => {
                // console.log(data.match(/^([\s]+(@.*))+[\s]+Scenario:/gm))
                // var reg = /^([\s]+(@.*))+[\s]+Scenario:/gm
                // while ((match = reg.exec(data)) != null) {
                //     console.log("match at " + match.index)
                // }
                // var zzz = (/^([\s]+(@.*))+[\s]+Scenario:/gm).exec(data)
                // console.log(zzz)
                var fileTurnedIntoArray = data.split('\r\n')
                for (const entry of fileTurnedIntoArray) {
                    if (entry.includes('@auto')) {
                        console.log(entry)
                    }
                }

                var fileContentsSplit = data.split('\r\n\r\n')
                fileContentsSplit.shift()
                fileContentsSplit.shift()

                var givenStep = false
                var thenStep = false
                var whenStep = false
                var constructedStepTracker = -1
                for (var ii = 0; ii < fileContentsSplit.length; ii++) {
                    var jsonBody = {}
                    jsonBody.type_id = 1
                    jsonBody.priority_id = 3
                    jsonBody.template_id = 2
                    jsonBody.custom_steps_separated = []

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

                    var testId
                    if (scenarioContentsSplit[1].includes('@tc:')) {
                        testId = parseInt(scenarioContentsSplit[1].split(':')[1])
                    } else {
                        testId = false
                    }
                    fileContentsObject.push({
                        currentFile: currentFile,
                        json: jsonBody,
                        testId: testId
                    })
                    // console.log(fileContentsObject)

                    // fileContentsObject[currentObjectIndex].currentFile = currentFile
                    // fileContentsObject[currentObjectIndex].json = jsonBody
                    // 


                    var givenStep = false
                    var thenStep = false
                    var whenStep = false
                    var constructedStepTracker = -1
                }


                // addCase(jsonBody, currentFile, data)


                // console.log(currentFile)
                // updateCase(jsonBody, 7)
            })
        }
    }
    // console.log(fileContentsObject)
    // getCases()
    // for (var i = 0; i < fileContentsObject.length; i++) {
    //     console.log(fileContentsObject[i])
    //     addCase(JSON.stringify(fileContentsObject[i].json), fileContentsObject[i].currentFile)
    // }
}

function getContentsOfFile(file) {
    return readFile(file, 'utf8');
}