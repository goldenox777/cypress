'use strict';
//const args = process.argv;
//first argument looks for the source of the jsons
//var reportsFolder = args[2].split('=')[1]
// var reportsFolder = "/test/results/consumables/"

//debug reportsFolders
var reportsFolder = __dirname + "/../r/c/"

//second argument is where we copy the end html
// var endReportFolder = args[3].split('=')[1]
var endReportFolder = __dirname + "/../r/"

const testFolder = reportsFolder
const fs = require('fs');
const path = require('path');

var string
var line = 0

//set up empty arrays which will later be loaded with info
var failedArray = []
var passedArray = []
var stats = []
//read the source folder and go through all the JSONs
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    if (file.includes('.json')) {
      let rawdata = fs.readFileSync(path.join(testFolder, file));
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
          builtFilePath[builtFilePath.length - 1] = builtFilePath[builtFilePath.length - 1]
          var errorFilePathSuffix = ""
          var screenshotsErrorFileName = myJson.results[0].suites[0].tests[i].fullTitle + ' (failed).png'
          screenshotsErrorFileName = screenshotsErrorFileName.replace(':', '')
          screenshotsErrorFileName = screenshotsErrorFileName.replace('.feature ', '.feature -- ')

          // screenshotsErrorFileName = screenshotsErrorFileName.replace(' __ ', '  ')
          // screenshotsErrorFileName = screenshotsErrorFileName.replace(/ _ /g, '  ')

          screenshotsErrorFileName = encodeURI(screenshotsErrorFileName)
          for (var ii = 0; ii < builtFilePath.length; ii++) {
            errorFilePathSuffix += '/' + builtFilePath[ii]
          }
          var screenshotsFilePath = 's/tests' + errorFilePathSuffix + '/' + screenshotsErrorFileName

          var videosFilePath = 'v/tests' + errorFilePathSuffix + '.mp4'

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
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>

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
<body style="background-color: #f5f5f5;">`
  returnStats()
  for (const json of failedArray) {
    baseHtml += returnEntry(json)
  }

  for (const json of passedArray) {
    baseHtml += returnEntry(json)
  }
  baseHtml += '<div id="mainContainer" style="position:fixed;z-index:2;top:0px;width:100%;height:100%;display:none"><div style="width:100%;height:100%;background-color:black;opacity:0.5" id="grayContainer"></div><div id="scrcontainer" style="width:50%;position:absolute;top:50px;"></div><div id="vidcontainer" style="width:50%;position:absolute;top:50px;"></div><div id="filepathcontainer" style="position:absolute;top:30px;background-color:white"></div></div>'
  baseHtml += `<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', function() {
    $(".consumables").click(          
      function() {         
        var filepath = ($(this).attr("filepath"))
        document.getElementById("mainContainer").style.display = "block"
        var wHeight = window.innerHeight
        var wWidth = window.innerWidth
        var vidsource = ($(this).attr("sourcevideo"))
        if ($(this).attr("status") == 'failed') {
          console.log('hereee')
          var scrsource = ($(this).attr("sourcescreenshot"))
          var percent = (50 * wWidth) / 100
          $("#scrcontainer").html('<img style="width:'+ percent +'px" src="'+ scrsource +'">')
          $("#vidcontainer").html('<video width="100%" controls=""><source src="'+ vidsource +'"></video>')
          $("#vidcontainer").offset({left:percent})
        } else {
          $("#scrcontainer").html('')
          $("#vidcontainer").html('<video width="100%" controls=""><source src="'+ vidsource +'"></video>')
          $("#vidcontainer").offset({left:0})
          $("#vidcontainer").attr({'style': 'height:90%;position:absolute;top:50px;'})
        }
        
        $("#filepathcontainer").html(filepath)
      }          
    )

  $("#grayContainer").click(function() {
      document.getElementById("mainContainer").style.display = "none"
    })
  })
  </script>`
  baseHtml += `</body>`

  function returnStats() {
    console.log(failedArray.length)
    console.log(passedArray.length)
  }

  function returnEntry(json) {
    var string = `<div class="entry">
  <div class="status">
    <div class="status-button cursor status-` + json.status + ` separator-right" style="display: inline-block;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
        style="width: 15px;height: 15px; vertical-align: middle;padding-left: 5px;">
        `+ returnIcon(json.status) + `
      </svg>
      `+ returnLinkElement(json.id) + `
    </div>
  </div>
  <div class="icon consumables" sourceScreenshot="`+ json.screenshots + `" sourceVideo="` + json.videos + `" status="` + json.status + `"">
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



  var maxBarSize = 200
  var barSizeFailed = (failed * 100) / tests
  barSizeFailed = maxBarSize * barSizeFailed / 100
  var barSizePassed = (passed * 100) / tests
  barSizePassed = maxBarSize * barSizePassed / 100
  var emailHtml = `<!DOCTYPE html>
  <html>
  
  <head>
    <style>
      .bar {
        padding-left: 10px;
        padding-right: 10px;
      }
  
      .total {
        background-color: rgb(122, 120, 119);
        width: `+ maxBarSize + `px;
      }
  
      .failed {
        background-color: rgb(240, 206, 209);
        width: `+ barSizeFailed + `px;
      }
  
      .passed {
        background-color: rgb(152, 235, 210);
        width: `+ barSizePassed + `px;
      }
  
      .fright {
        float: right;
      }
  
      .fleft {
        float: left;
      }
    </style>
  </head>
  
  <body>
    <div class="bar total fleft">Total</div>
    <div class="fleft">`+ tests + ` tests</div>
    <br>`
  if (failed != 0) {
    emailHtml += `<div class="bar failed fleft"> </div>
      <div class="fleft">`+ failed + ` Failed</div>
      <br>`
  }
  if (passed != 0) {
    emailHtml += `<div class="bar passed fleft"> </div>
      <div class="fleft">`+ passed + ` Passed</div>
      <br>
      `
  }
  emailHtml += `<div class="fleft">Execution time: ` + durationInMinutes + `</div>
    <br>
    <br>
    <div>¯\\_(ツ)_/¯</div>
    <div>For additional details, please see the attached archive.</div>
    <div>Please find below a quick link to all of the failing test cases OR view the full run in <a
        href="https://google.com" target="_blank">TFS</a></div>
    <a href="http://www.google.com" target="_blank">19658</a>
  </body>
  
  </html>
  `


  var calculatedDate = Date.now()
  writeToFile(endReportFolder + 'Report' + '.html', baseHtml)
  writeToFile(endReportFolder + calculatedDate + '.html', baseHtml)
  writeToFile(endReportFolder + 'EmailBody.html', emailHtml)
  function writeToFile(pathWithFileName, htmlVar) {
    fs.writeFile(pathWithFileName, htmlVar, function (err) {
      if (err) {
        return console.log(err)
      }
    });
  }
})