'use strict';

var tags = process.env.TAGS
if (tags == 'undefined') {
  tags = '@auto'
}

var trigggeredBy = process.env.TRIGGEREDBY
if (trigggeredBy == 'undefined') {
  trigggeredBy = 'arthur.bazso@gmail.com'
}

var host = process.env.HOST
if (host == undefined) {
  host = 'https://tfs.vitalhealthsoftware.com/tfs/DefaultCollection/PH3/_testManagement/runs?_a=runQuery'
}


// var baseReportsFolder = "/test/r/"
//debug reportsFolders
var baseReportsFolder = __dirname + "/../r/"
//debug reportsFolders

var consumablesFolder = baseReportsFolder + "c/"
//second argument is where we copy the end html

const fs = require('fs');
const path = require('path');

var string
var line = 0

//set up empty arrays which will later be loaded with info
var failedArray = []
var passedArray = []
var stats = []
//read the source folder and go through all the JSONs
fs.readdir(consumablesFolder, (err, files) => {
  files.forEach(file => {
    if (file.includes('.json')) {
      let rawdata = fs.readFileSync(path.join(consumablesFolder, file));
      let myJson = JSON.parse(rawdata);
      var myStats = {
        tests: myJson.stats.tests,
        passed: myJson.stats.passes,
        failures: myJson.stats.failures,
        duration: myJson.stats.duration
      }

      stats.push(myStats)
      if (myJson.stats.suites != 0) {
        for (var i = 0; i < myJson.results[0].suites[0].tests.length; i++) {
          var title = myJson.results[0].suites[0].tests[i].title
          var id
          if (title.includes('-')) {
            id = title.split('-')[0]
          } else {
            id = 'NOT IN TFS'
          }
          //since I couldn't find a way to make mochawesome to output the filepath into the JSON
          //I had to write the file path into each .feature file
          //and it resides after the double "__"
          //console.log(myJson.results[0].suites[0].title)
          var filePath = (myJson.results[0].suites[0].title)
          //each folder is separated with a " _ "
          var builtFilePath = filePath.split(":")
          // builtFilePath[builtFilePath.length - 1] = builtFilePath[builtFilePath.length - 1]

          var errorFilePathSuffix = ""
          var screenshotsErrorFileName = myJson.results[0].suites[0].tests[i].fullTitle + ' (failed).png'
          screenshotsErrorFileName = screenshotsErrorFileName.replace(/:/g, '')
          screenshotsErrorFileName = screenshotsErrorFileName.replace('.feature ', '.feature -- ')

          // screenshotsErrorFileName = screenshotsErrorFileName.replace(' __ ', '  ')
          // screenshotsErrorFileName = screenshotsErrorFileName.replace(/ _ /g, '  ')

          screenshotsErrorFileName = encodeURI(screenshotsErrorFileName)
          for (var ii = 0; ii < builtFilePath.length; ii++) {
            errorFilePathSuffix += '/' + builtFilePath[ii]
          }

          var screenshotsFilePath = 's' + errorFilePathSuffix + '/' + screenshotsErrorFileName
          var videosFilePath = 'v' + errorFilePathSuffix + '.mp4'

          //we extract the TFS id of a file by splitting after the first ocurrence of "- "
          var titleSplit
          if (title.includes('- ')) {
            titleSplit = title.split(/- (.+)/)[1]
          } else {
            titleSplit = title
          }
          var testStatus = myJson.results[0].suites[0].tests[i].state
          var error

          filePath = filePath.replace(/_/g, ">")
          if (myJson.results[0].suites[0].tests[i].state == 'failed') {
            error = myJson.results[0].suites[0].tests[i].err.message
            error = error.replace("<", "&lt;")
            error = error.replace(">", "&gt;")
            var myObj = {
              title: titleSplit,
              id: id,
              filePath: filePath,
              status: testStatus,
              screenshots: screenshotsFilePath,
              videos: videosFilePath,
              error: error
            }
            failedArray.push(myObj)
          } else {
            var myObj = {
              title: titleSplit,
              id: id,
              filePath: filePath,
              status: testStatus,
              screenshots: screenshotsFilePath,
              videos: videosFilePath
            }
            passedArray.push(myObj)
          }

        }
      }
    }
  });

  var tests = 0
  var passed = 0
  var failed = 0
  var duration = 0

  for (var k = 0; k < stats.length; k++) {
    tests = tests + stats[k].tests
    passed = passed + stats[k].passed
    failed = failed + stats[k].failures
    duration = duration + stats[k].duration
  }

  var durationInMinutes = (duration / 60000).toFixed(2)

  var iconPassed = `<path
        d="M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 L12,2 Z M10,17 L5,12 L6.41,10.59 L10,14.17 L17.59,6.58 L19,8 L10,17 L10,17 Z">
      </path>`
  var iconFailed = `<path d="M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 L12,2 Z M13,17 L11,17 L11,15 L13,15 L13,17 L13,17 Z M13,13 L11,13 L11,7 L13,7 L13,13 L13,13 Z"></path>`

  var iconMedia = `<path
              d="M21.4,9.4 L17.5,9.4 C17.2,9.4 16.9,9.7 16.9,10 L16.9,13.8 L13.9,18.6 C13.5,19.2 13,19.6 12.3,19.7 C11.6,19.8 11,19.7 10.4,19.4 C9.2,18.6 8.9,17.1 9.6,15.9 L10.5,14.5 L13.8,14.5 C14.1,14.5 14.4,14.2 14.4,13.9 L14.4,10.8 L14.5,10.7 L15.5,9.1 C16.1,8.1 16.3,7 16.1,5.9 C15.9,4.8 15.2,3.8 14.2,3.2 C13.2,2.6 12.1,2.4 11,2.6 C9.9,2.8 8.9,3.5 8.3,4.5 L5.2,9.5 L2.6,9.5 C2.3,9.4 2,9.7 2,10 L2,13.9 C2,14.2 2.3,14.5 2.6,14.5 L6.5,14.5 C6.8,14.5 7.1,14.2 7.1,13.9 L7.1,10 L7.1,9.8 L9.9,5.4 C10.7,4.2 12.2,3.9 13.4,4.6 C14,5 14.4,5.5 14.5,6.2 C14.6,6.9 14.5,7.5 14.2,8.1 L13.4,9.4 L9.9,9.4 C9.6,9.4 9.3,9.7 9.3,10 L9.3,13.2 L9.2,13.3 L8.2,14.9 C6.9,16.9 7.5,19.5 9.5,20.8 C10.2,21.2 11,21.5 11.8,21.5 C12.1,21.5 12.4,21.5 12.7,21.4 C13.8,21.2 14.8,20.5 15.4,19.5 L18.6,14.5 L21.4,14.5 C21.7,14.5 22,14.2 22,13.9 L22,10 C22,9.7 21.7,9.4 21.4,9.4 Z M4.5,13.2 C3.8,13.2 3.2,12.6 3.2,11.9 C3.2,11.2 3.8,10.6 4.5,10.6 C5.2,10.6 5.8,11.2 5.8,11.9 C5.8,12.6 5.2,13.2 4.5,13.2 Z M11.8,10.7 C12.5,10.7 13.1,11.3 13.1,12 C13.1,12.7 12.5,13.3 11.8,13.3 C11.1,13.3 10.5,12.7 10.5,12 C10.6,11.2 11.1,10.7 11.8,10.7 Z M19.5,13.2 C18.8,13.2 18.2,12.6 18.2,11.9 C18.2,11.2 18.8,10.6 19.5,10.6 C20.2,10.6 20.8,11.2 20.8,11.9 C20.7,12.6 20.2,13.2 19.5,13.2 Z">
            </path>`
  function returnIcon(status) {
    if (status == 'passed') {
      return iconPassed
    } else {
      return iconFailed
    }
  }


  var baseHtml = `
<!DOCTYPE html>
<html lang="en">
` + returnHead('htmlReport') + `
<body style="background-color: #f5f5f5;">`
  baseHtml += returnStats()
  var counter = 0
  for (const json of failedArray) {
    baseHtml += returnEntry(json, counter)
    counter++
  }

  for (const json of passedArray) {
    baseHtml += returnEntry(json, counter)
    counter++
  }

  baseHtml += returnScripts()
  baseHtml += `</body>`

  function returnScripts() {
    var string = `
    <script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function () {
        $(".consumables").click(
            function () {
                var target = '#consumablesContainer' + $(this).attr('counter')
                if ($(target).is(":visible")) {
                    document.getElementById("consumablesContainer" + $(this).attr('counter')).style.display = "none"
                } else {
                    document.getElementById("consumablesContainer" + $(this).attr('counter')).style.display = "flex"
                    var status = $(this).attr('status')
                    if (status == 'failed') {
                        $(target).html('<div id="scrcontainer" style="width:50%;"><img style="width:100%" src="' + $(this).attr('sourcescreenshot') + '"></div><div id="vidcontainer" style="width: 50%;"><video width="100%" controls=""><source src="' + $(this).attr('sourcevideo') + '"></video></div>')
                    } else {
                        $(target).html('<div id="vidcontainer" style="width: 70%;"><video width="100%" controls=""><source src="' + $(this).attr('sourcevideo') + '"></video></div>')
                    }

                    $(".consumables").css("background-color", "")
                    $(this).css("background-color", "teal")
                }
            }
        )

        $(document).keyup(function (e) {
            if (e.key === "Escape") {
                document.getElementById("mainContainer").style.display = "none"
            }
        });

        $("#statFailed").click(function () {
            if ($(".passed").is(":visible") == true) {
                $(".passed").hide()
            } else {
                $(".passed").show()
            }
        })

        $("#statPassed").click(function () {
            if ($(".failed").is(":visible") == true) {
                $(".failed").hide()
            } else {
                $(".failed").show()
            }
        })

        $("#statsUrl").click(function () {
            window.open("`+ host + `");
        })

        $("#statCombined").height("auto")

        var checkedStatus = function () {
            if ($("#statFailed").attr("data") != 0) {
                $("#statsStatus").addClass("label-danger")
                return "Failed"
            } else {
                $("#statsStatus").addClass("label-success")
                return "Passed"
            }
        }
      })
    </script>
    `
    return string
  }

  function returnHead(type) {
    var string
    if (type == 'htmlReport') {
      string = `
      <head>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  
      <style>
        @charset "UTF-8";
        @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,700);
  
        .status-button {
          border-radius: 25px;
          width: 100px;
          color: #fff;
          font-family: "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-weight: 600;
          font-size: 12px;
        }
  
  
        .status-passed {
          background: #42c88a;
        }
  
        .status-failed {
          background: #ed5c5c;
        }
  
        .entry {
          display: flex;
          margin-bottom: 4px;
          background-color: #fff;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.15);
          box-sizing: border-box;
          font-family: "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          font-size: 14px;
          line-height: 1.5;
          color: #212121;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }
  
        .statistics {
          font-size: 12px;
          margin: 4px;
          align-self: flex-end;
          height: 10px;      
        }
        
  
        .status {
          -webkit-box-flex: 0;
          flex: 0 0 130px;
          padding: 7px 6px;
          border-right: 1px solid rgba(0, 0, 0, 0.05);
          display: block;
  
        }
  
        .cursor {
          cursor: default;
        }
  
        .pointer {
          cursor: pointer;
        }
  
        .title {
          display: flex;
          -webkit-box-align: stretch;
          align-items: stretch;
          -webkit-box-flex: 1;
          flex: 1 0;
          min-width: 0;
          padding: 6px 12px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          line-height: 1.8;
        }
  
        .error {
          display: flex;
          -webkit-box-align: stretch;
          align-items: stretch;
          -webkit-box-flex: 1;
          flex: 1 0;
          min-width: 0;
          padding: 6px 12px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          line-height: 1.8;
        }
  
        .icon {
          vertical-align: middle;
          min-width: 0;
          padding: 6px 12px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          line-height: 1.8;
        }
      </style>
      </head>
      `

    }

    if (type == 'emailReport') {
      string = `
      <head>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  
      <style>
        @charset "UTF-8";
        @import url(https://fonts.googleapis.com/css?family=Open+Sans:300,400,700);
  
        .status-button {
          border-radius: 25px;
          width: 100px;
          color: #fff;
          font-family: "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-weight: 600;
          font-size: 12px;
        }
  
  
        .status-passed {
          background: #42c88a;
        }
  
        .status-failed {
          background: #ed5c5c;
        }
  
        .entry {
          display: flex;
          margin-bottom: 4px;
          background-color: #fff;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.15);
          box-sizing: border-box;
          font-family: "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          font-size: 14px;
          line-height: 1.5;
          color: #212121;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }
  
        .statistics {
          font-size: 12px;
          margin: 4px;
          align-self: flex-end;
          height: 10px;      
        }
        
  
        .status {
          -webkit-box-flex: 0;
          flex: 0 0 130px;
          padding: 7px 6px;
          border-right: 1px solid rgba(0, 0, 0, 0.05);
          display: block;
  
        }
  
        .cursor {
          cursor: default;
        }
  
        .pointer {
          cursor: pointer;
        }
  
        .title {
          display: flex;
          -webkit-box-align: stretch;
          align-items: stretch;
          -webkit-box-flex: 1;
          flex: 1 0;
          min-width: 0;
          padding: 6px 12px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          line-height: 1.8;
        }
  
        .error {
          display: flex;
          -webkit-box-align: stretch;
          align-items: stretch;
          -webkit-box-flex: 1;
          flex: 1 0;
          min-width: 0;
          padding: 6px 12px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          line-height: 1.8;
        }
  
        .icon {
          vertical-align: middle;
          min-width: 0;
          padding: 6px 12px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          line-height: 1.8;
        }

        @media screen {
          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansThin.woff') format('woff');
              font-weight: 100;
              font-style: normal;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansThin-Italic.woff') format('woff');
              font-weight: 100;
              font-style: italic;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansXLight.woff') format('woff');
              font-weight: 200;
              font-style: normal;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansXLight-Italic.woff') format('woff');
              font-weight: 200;
              font-style: italic;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansLight.woff') format('woff');
              font-weight: 300;
              font-style: normal;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansLight-Italic.woff') format('woff');
              font-weight: 300;
              font-style: italic;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansBook.woff') format('woff');
              font-weight: normal;
              font-style: normal;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansBook-Italic.woff') format('woff');
              font-weight: normal;
              font-style: italic;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansMedium.woff') format('woff');
              font-weight: 500;
              font-style: normal;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansMedium-Italic.woff') format('woff');
              font-weight: 500;
              font-style: italic;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansBold.woff') format('woff');
              font-weight: bold;
              font-style: normal;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansBold-italic.woff') format('woff');
              font-weight: bold;
              font-style: italic;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansXBold.woff') format('woff');
              font-weight: 800;
              font-style: normal;
          }

          @font-face {
              font-family: 'CentraleSans';
              src: url('https://test.vitalhealth-ph3.nl/iam/static/fonts/CentraleSansXBold-Italic.woff') format('woff');
              font-weight: 800;
              font-style: italic;
          }

          body {
              font-family: CentraleSans, Tahoma, Geneva, Kalimati, sans-serif;
          }
        }
      </style>
      </head>
      `
    }
    return string
  }

  function returnStats() {

    var status = () => {
      if (parseInt(failedArray.length) > 0) {
        return `<span id="statsStatus" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #d9534f;">
                Status: Failed
                </span>`
      } else {
        return `<span id="statsStatus" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #5cb85c;">
                Status: Passed
                </span>`
      }
    }


    var statsCombined = parseInt(failedArray.length) + parseInt(passedArray.length)

    function returnStatus(status) {
      if (status == 'passed') {
        if (passedArray.length > 0) {
          return `<span id="statPassed" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #5cb85c;">
                  Passed `+ passedArray.length + `
                  </span>`
        } else {
          return ''
        }
      } else {
        if (failedArray.length > 0) {
          return `<span id="statFailed" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #d9534f;">
                  Failed `+ failedArray.length + `
                  </span>`
        } else {
          return ''
        }
      }
    }

    var string = `
    <div class="entry" id="statistics" align="left">
      <div class="statistics" id="statCombined" data="`+ statsCombined + `" style="height: auto;font-size:75%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;color: white;display: block;font-weight: 600;">
        <div style="padding-bottom: 1px;padding-top: 1px;">
            ` + status() + `
        </div>
        <div style="padding-bottom: 1px;padding-top: 1px;">
            <span id="statsTotalTestsExecuted" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #5bc0de;">
              Total tests executed: `+ statsCombined + `</span>
            `+ returnStatus('failed') + `
            `+ returnStatus('passed') + `
            <span id="statsDuration" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #777;">
              Run time: `+ durationInMinutes + `
            </span>
        </div>
        <div style="padding-bottom: 1px;padding-top: 1px;">
            <span id="statsTriggeredBy" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #777; text-decoration: none;color: white;">
              Triggered by: <a style="text-decoration: none;color: white;">`+ trigggeredBy + `</a>
            </span>
            <span id="statsTags" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #777;">
              Tag(s): `+ tags + `
            </span>
        </div>
        <span class="pointer" id="statsUrl" style="padding-left: 4px;padding-right: 4px;border-radius: .25em;background-color: #777;">
          <a href="`+ host + `" target="_blank" style="text-decoration: none;color: white;">
          `+ host + `
          </a>
        </span>
      </div>
    </div>
    `
    return string
  }

  function returnEntry(json, counter) {
    var string = `<div>
    <div class="entry ` + json.status + `">
    <div class="status">
      <div class="status-button cursor status-` + json.status + ` separator-right" style="display: inline-block;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
          style="width: 15px;height: 15px; vertical-align: middle;padding-left: 5px;">
          `+ returnIcon(json.status) + `
        </svg>
        `+ returnLinkElement(json.id) + `
      </div>
    </div>
    <div class="icon consumables pointer" sourceScreenshot="`+ json.screenshots + `" counter="` + counter + `" sourceVideo="` + json.videos + `" status="` + json.status + `"">
      <div>
        <div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            class="css-1rozygh" style="width: 15px;height: 15px; vertical-align: middle;padding-left: 5px;">
            ` + iconMedia + ` 
          </svg></div>
      </div>
    </div>
    <div class="title">`+ json.title + `</div>
    `+ returnError(json) + `
    </div>
    <div id="consumablesContainer`+ counter + `" style="top: 0px; width: 100%; display: none"></div>
    </div>
    `
    return string
  }

  function returnError(json) {
    if (json.status == 'failed') {
      return '<div class="error">' + json.error + '</div>'
    } else {
      return ' '
    }
  }
  function returnLinkElement(id) {
    try {
      if (parseInt(id)) {
        return '<a style="display: inline-block;vertical-align: middle;color: inherit;text-decoration: none;" href="https://tfs.vitalhealthsoftware.com/tfs/DefaultCollection/PH3/_workitems/edit/' + id + '" target="_blank">' + id + '</a>'
      } else {
        return id
      }
    }
    catch (err) {
    }
  }

  var emailHtml = `<!DOCTYPE html>
  <html>
  ` + returnHead('emailReport') + `
  ` + returnScripts() + `
    <body>
    <body leftmargin="0" marginheight="0" marginwidth="0" topmargin="0" yahoo="fix">
    <!-- Wrapper -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td bgcolor="#F5F5F5" valign="top" width="100%">
                <!-- Start Centered Content-->
                <table align="center" border="0" cellpadding="0" cellspacing="0"
                    class="device-width outside header-margin shadow">
                    <tr>
                        <td align="center" bgcolor="#ffffff" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0"
                                class="content-width inside">
                                <tr>
                                    <img alt="Photo of a woman looking at her health record in a sofa."
                                        style="height: 192px; width: 640px;"
                                        src="https://test.vitalhealth-ph3.nl/iam/static/img/email-header.png" />
                                </tr>
                            </table>


                            <table border="0" cellpadding="0" cellspacing="0" class="content-width inside">
      `+ returnStats() + `
      </table>

                        </td>
                    </tr>
                </table>

                <!-- One Column -->
                <table align="center" border="0" cellpadding="0" cellspacing="0"
                    style="text-align:center; height: 192px; width: 640px; background: radial-gradient(circle, #10555B 0%, #16414C 100%);">
                    <tr>
                        <td style="vertical-align: middle;" valign="top">
                            <img alt="Philips logo"
                                src="https://test.vitalhealth-ph3.nl/iam/static/img/philips-shield-logo.png"
                                style="height: 96px; width: 96px;" />
                        </td>
                    </tr>
                </table>

                <!-- End One Column -->

                <!-- Start Centered Content-->
                <table align="center" border="0" cellpadding="0" cellspacing="0" class="device-width outside">
                    <tr>
                        <td align="center" valign="top">
                            <!-- One Column -->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="width: 592px;">
                                <tr>
                                    <td align="left"
                                        style="padding-top: 24px; height: 120px; width: 592px; color: #696969; font-family: 'Centrale Sans'; font-size: 14px; font-weight: 300; line-height: 20px;"
                                        valign="top">
                                        The information contained in this message may be confidential and legally
                                        protected under applicable law. The message is intended solely for the
                                        addressee(s). If you are not the intended recipient, you are hereby notified
                                        that any use, forwarding, dissemination, or reproduction of this message is
                                        strictly prohibited and may be unlawful. If you are not the intended recipient,
                                        please contact the sender by return e-mail and destroy all copies of the
                                        original message .
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <div style="height:10px">&nbsp;</div>
                <!-- spacer -->
            </td>
        </tr>
    </table>

    <!-- End Wrapper -->
    </body>
  </html>
  `


  var calculatedDate = Date.now()
  writeToFile(baseReportsFolder + 'Report' + '.html', baseHtml)
  writeToFile(baseReportsFolder + calculatedDate + '.html', baseHtml)
  writeToFile(baseReportsFolder + 'EmailBody.html', emailHtml)
  function writeToFile(pathWithFileName, htmlVar) {
    fs.writeFile(pathWithFileName, htmlVar, function (err) {
      if (err) {
        return console.log(err)
      }
    });
  }
})
